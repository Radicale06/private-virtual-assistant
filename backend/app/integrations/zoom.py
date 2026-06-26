"""Zoom OAuth + API client (create meetings)."""
from __future__ import annotations

import base64
import time
from datetime import datetime
from urllib.parse import urlencode

import httpx

from app.config import settings

AUTH_URI = "https://zoom.us/oauth/authorize"
TOKEN_URI = "https://zoom.us/oauth/token"
API = "https://api.zoom.us/v2"


def _basic_auth_header() -> dict:
    creds = f"{settings.zoom_client_id}:{settings.zoom_client_secret}".encode()
    return {"Authorization": f"Basic {base64.b64encode(creds).decode()}"}


def authorization_url(state: str) -> str:
    params = {
        "response_type": "code",
        "client_id": settings.zoom_client_id,
        "redirect_uri": settings.zoom_redirect_uri,
        "state": state,
    }
    return f"{AUTH_URI}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            TOKEN_URI,
            headers=_basic_auth_header(),
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.zoom_redirect_uri,
            },
        )
        resp.raise_for_status()
        data = resp.json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data.get("refresh_token"),
        "expiry": time.time() + int(data.get("expires_in", 3600)),
    }


async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            TOKEN_URI,
            headers=_basic_auth_header(),
            data={"grant_type": "refresh_token", "refresh_token": refresh_token},
        )
        resp.raise_for_status()
        return resp.json()


async def create_meeting(
    access_token: str,
    *,
    topic: str,
    start: datetime,
    duration_minutes: int = 30,
    timezone: str = "UTC",
) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{API}/users/me/meetings",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json={
                "topic": topic,
                "type": 2,  # scheduled
                "start_time": start.strftime("%Y-%m-%dT%H:%M:%S"),
                "duration": duration_minutes,
                "timezone": timezone,
            },
        )
        resp.raise_for_status()
        m = resp.json()
    return {
        "id": m.get("id"),
        "join_url": m.get("join_url"),
        "start_url": m.get("start_url"),
        "topic": m.get("topic"),
        "start_time": m.get("start_time"),
    }
