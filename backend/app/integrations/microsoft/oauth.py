"""Microsoft 365 OAuth 2.0 (Azure AD / Microsoft Graph).

One consent grants Outlook Calendar (read/write), Outlook Mail (read + send), and
Teams online meetings (created as calendar events). Same token bundle shape as the
Google integration so the shared vault/refresh helpers work unchanged.
"""
from __future__ import annotations

import time
from urllib.parse import urlencode

import httpx

from app.config import settings

GRAPH = "https://graph.microsoft.com/v1.0"


def _authority() -> str:
    return f"https://login.microsoftonline.com/{settings.ms_tenant}/oauth2/v2.0"


SCOPES = [
    "openid",
    "email",
    "profile",
    "offline_access",
    "User.Read",
    "Calendars.ReadWrite",
    "Mail.Read",
    "Mail.Send",
]


def authorization_url(state: str) -> str:
    params = {
        "client_id": settings.ms_client_id,
        "response_type": "code",
        "redirect_uri": settings.ms_redirect_uri,
        "response_mode": "query",
        "scope": " ".join(SCOPES),
        "state": state,
        "prompt": "select_account",
    }
    return f"{_authority()}/authorize?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{_authority()}/token",
            data={
                "client_id": settings.ms_client_id,
                "client_secret": settings.ms_client_secret,
                "code": code,
                "redirect_uri": settings.ms_redirect_uri,
                "grant_type": "authorization_code",
                "scope": " ".join(SCOPES),
            },
        )
        resp.raise_for_status()
        data = resp.json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data.get("refresh_token"),
        "expiry": time.time() + int(data.get("expires_in", 3600)),
        "scope": data.get("scope"),
        "token_type": data.get("token_type", "Bearer"),
    }


async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{_authority()}/token",
            data={
                "client_id": settings.ms_client_id,
                "client_secret": settings.ms_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
                "scope": " ".join(SCOPES),
            },
        )
        resp.raise_for_status()
        return resp.json()  # {access_token, expires_in, refresh_token?, scope}


async def get_userinfo(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{GRAPH}/me", headers={"Authorization": f"Bearer {access_token}"}
        )
        resp.raise_for_status()
        me = resp.json()
    return {
        "email": me.get("mail") or me.get("userPrincipalName"),
        "name": me.get("displayName"),
    }
