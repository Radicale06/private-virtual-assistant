"""Google OAuth 2.0  authorization URL, code exchange, token refresh, userinfo.

Scopes cover Calendar (read/write) and Gmail (read + send). Google Meet links are
created through the Calendar API (conferenceData), so no separate scope.
"""
from __future__ import annotations

import time
from urllib.parse import urlencode

import httpx

from app.config import settings

AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URI = "https://oauth2.googleapis.com/token"
USERINFO_URI = "https://www.googleapis.com/oauth2/v3/userinfo"

SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]


def authorization_url(state: str) -> str:
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",       # request a refresh token
        "prompt": "consent",            # ensure refresh token on re-consent
        "include_granted_scopes": "true",
        "state": state,
    }
    return f"{AUTH_URI}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    """Exchange an auth code for a token bundle (normalized for the vault)."""
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            TOKEN_URI,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
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
            TOKEN_URI,
            data={
                "refresh_token": refresh_token,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "grant_type": "refresh_token",
            },
        )
        resp.raise_for_status()
        return resp.json()  # {access_token, expires_in, scope, token_type}


async def get_userinfo(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            USERINFO_URI, headers={"Authorization": f"Bearer {access_token}"}
        )
        resp.raise_for_status()
        return resp.json()  # {email, name, ...}
