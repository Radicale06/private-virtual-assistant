"""Agent (My Assistant)  read, edit, and WhatsApp linking (QR)."""
from __future__ import annotations

from fastapi import APIRouter

from app.core.deps import CurrentUser, Db
from app.schemas.schemas import AgentOut, AgentUpdate, LinkOut, LinkStatusOut
from app.services.agent_service import get_or_create_agent, is_linked
from app.services.linking_service import create_linking_token

router = APIRouter(prefix="/api/agent", tags=["agent"])


def _to_out(agent) -> AgentOut:
    return AgentOut(
        id=agent.id,
        name=agent.name,
        tone=agent.tone,
        status=agent.status,
        confirm_before_send=agent.confirm_before_send,
        morning_briefing_enabled=agent.morning_briefing_enabled,
        morning_briefing_time=agent.morning_briefing_time,
        work_start=agent.work_start,
        work_end=agent.work_end,
    )


@router.get("", response_model=AgentOut)
async def get_agent(user: CurrentUser, db: Db) -> AgentOut:
    agent = await get_or_create_agent(db, user.id)
    return _to_out(agent)


@router.patch("", response_model=AgentOut)
async def update_agent(body: AgentUpdate, user: CurrentUser, db: Db) -> AgentOut:
    agent = await get_or_create_agent(db, user.id)
    data = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if data:
        agent = await db.agent.update(where={"id": agent.id}, data=data)
    return _to_out(agent)


@router.post("/link", response_model=LinkOut)
async def link(user: CurrentUser, db: Db) -> LinkOut:
    """Generate a QR / wa.me deep link to bind the user's phone to this agent."""
    agent = await get_or_create_agent(db, user.id)
    result = await create_linking_token(db, agent.id)
    return LinkOut(**result)


@router.get("/link/status", response_model=LinkStatusOut)
async def link_status(user: CurrentUser, db: Db) -> LinkStatusOut:
    agent = await get_or_create_agent(db, user.id)
    linked, phone = await is_linked(db, agent.id)
    return LinkStatusOut(linked=linked, phone_number=phone)
