"""Integrations  OAuth connect/callback for Google, Calendly, Zoom; list; disconnect.

Connect requires auth (to know the agent); the agent id is signed into the OAuth
`state` so the browser callback (no auth header) can be tied back to the tenant.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from jose import jwt

from app.config import settings
from app.constants import IntegrationProvider, IntegrationStatus
from app.core.deps import CurrentUser, Db
from app.core.vault import write_tokens
from app.integrations import calendly, zoom
from app.integrations.google import oauth as goauth
from app.integrations.microsoft import oauth as msoauth
from app.schemas.schemas import ConnectUrlOut, IntegrationOut
from app.services.agent_service import get_or_create_agent

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

_STATE_ALG = "HS256"


def _sign_state(agent_id: str, provider: str) -> str:
    return jwt.encode(
        {
            "agent_id": agent_id,
            "provider": provider,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        },
        settings.app_secret_key,
        algorithm=_STATE_ALG,
    )


def _verify_state(state: str) -> dict:
    try:
        return jwt.decode(state, settings.app_secret_key, algorithms=[_STATE_ALG])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")


async def _upsert_integration(db, agent_id, provider, tokens, email=None, scopes=None):
    await db.agentintegration.upsert(
        where={"agent_id_provider": {"agent_id": agent_id, "provider": provider}},
        data={
            "create": {
                "agent_id": agent_id,
                "provider": provider,
                "status": IntegrationStatus.connected,
                "account_email": email,
                "scopes": scopes,
                "token_blob": write_tokens(tokens),
            },
            "update": {
                "status": IntegrationStatus.connected,
                "account_email": email,
                "scopes": scopes,
                "token_blob": write_tokens(tokens),
                "last_error": None,
            },
        },
    )


# ---------------------------------------------------------------- list / disconnect
@router.get("", response_model=list[IntegrationOut])
async def list_integrations(user: CurrentUser, db: Db) -> list[IntegrationOut]:
    agent = await get_or_create_agent(db, user.id)
    rows = await db.agentintegration.find_many(where={"agent_id": agent.id})
    return [
        IntegrationOut(
            provider=r.provider,
            status=r.status,
            account_email=r.account_email,
            last_error=r.last_error,
        )
        for r in rows
    ]


@router.delete("/{provider}")
async def disconnect(provider: str, user: CurrentUser, db: Db) -> dict:
    agent = await get_or_create_agent(db, user.id)
    row = await db.agentintegration.find_unique(
        where={"agent_id_provider": {"agent_id": agent.id, "provider": provider}}
    )
    if row:
        await db.agentintegration.update(
            where={"id": row.id},
            data={"status": IntegrationStatus.disconnected, "token_blob": None},
        )
    return {"disconnected": provider}


# ---------------------------------------------------------------- connect URLs
@router.get("/{service}/connect", response_model=ConnectUrlOut)
async def connect(service: str, user: CurrentUser, db: Db) -> ConnectUrlOut:
    agent = await get_or_create_agent(db, user.id)
    state = _sign_state(agent.id, service)
    if service == "google":
        url = goauth.authorization_url(state)
    elif service == "calendly":
        url = calendly.authorization_url(state)
    elif service == "zoom":
        url = zoom.authorization_url(state)
    elif service == "microsoft":
        url = msoauth.authorization_url(state)
    else:
        raise HTTPException(status_code=404, detail="Unknown integration")
    return ConnectUrlOut(authorization_url=url)


# ---------------------------------------------------------------- callbacks
def _redirect_to_frontend(ok: bool, service: str) -> RedirectResponse:
    status = "connected" if ok else "error"
    return RedirectResponse(
        url=f"{settings.frontend_base_url}/app/integrations?service={service}&status={status}"
    )


@router.get("/google/callback")
async def google_callback(db: Db, code: str = Query(...), state: str = Query(...)):
    data = _verify_state(state)
    agent_id = data["agent_id"]
    tokens = await goauth.exchange_code(code)
    info = await goauth.get_userinfo(tokens["access_token"])
    email = info.get("email")
    # One Google consent covers Calendar + Gmail (+ Meet via Calendar).
    await _upsert_integration(
        db, agent_id, IntegrationProvider.google_calendar, tokens, email, goauth.SCOPES
    )
    await _upsert_integration(
        db, agent_id, IntegrationProvider.gmail, tokens, email, goauth.SCOPES
    )
    return _redirect_to_frontend(True, "google")


@router.get("/calendly/callback")
async def calendly_callback(db: Db, code: str = Query(...), state: str = Query(...)):
    data = _verify_state(state)
    tokens = await calendly.exchange_code(code)
    me = await calendly.get_current_user(tokens["access_token"])
    await _upsert_integration(
        db, data["agent_id"], IntegrationProvider.calendly, tokens, me.get("email")
    )
    return _redirect_to_frontend(True, "calendly")


@router.get("/zoom/callback")
async def zoom_callback(db: Db, code: str = Query(...), state: str = Query(...)):
    data = _verify_state(state)
    tokens = await zoom.exchange_code(code)
    await _upsert_integration(db, data["agent_id"], IntegrationProvider.zoom, tokens)
    return _redirect_to_frontend(True, "zoom")


@router.get("/microsoft/callback")
async def microsoft_callback(db: Db, code: str = Query(...), state: str = Query(...)):
    data = _verify_state(state)
    agent_id = data["agent_id"]
    tokens = await msoauth.exchange_code(code)
    info = await msoauth.get_userinfo(tokens["access_token"])
    email = info.get("email")
    # One Microsoft consent covers Outlook Calendar + Mail + Teams.
    for provider in (
        IntegrationProvider.outlook_calendar,
        IntegrationProvider.outlook_mail,
        IntegrationProvider.microsoft_teams,
    ):
        await _upsert_integration(db, agent_id, provider, tokens, email, msoauth.SCOPES)
    return _redirect_to_frontend(True, "microsoft")
