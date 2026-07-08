"""Google OAuth for *sign-in* (authentication).

Distinct from the Calendar/Gmail integration flow (app/integrations/google): this
requests only the basic openid/email/profile scopes and uses its own redirect URI
(`/api/auth/google/callback`), so signing in never triggers the sensitive-scope
consent/verification that the integration flow needs.
"""
from __future__ import annotations

import time
from urllib.parse import urlencode

import httpx

from app.config import settings

AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URI = "https://oauth2.googleapis.com/token"

LOGIN_SCOPES = ["openid", "email", "profile"]


def redirect_uri() -> str:
    """Derived from APP_BASE_URL — register this in the Google OAuth client."""
    return f"{settings.app_base_url.rstrip('/')}/api/auth/google/callback"


def authorization_url(state: str) -> str:
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": redirect_uri(),
        "response_type": "code",
        "scope": " ".join(LOGIN_SCOPES),
        "access_type": "online",       # sign-in only; no refresh token needed
        "prompt": "select_account",
        "state": state,
    }
    return f"{AUTH_URI}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            TOKEN_URI,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": redirect_uri(),
                "grant_type": "authorization_code",
            },
        )
        resp.raise_for_status()
        data = resp.json()
    return {
        "access_token": data["access_token"],
        "id_token": data.get("id_token"),
        "expiry": time.time() + int(data.get("expires_in", 3600)),
    }
