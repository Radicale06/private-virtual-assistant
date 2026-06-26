"""Calendly OAuth + API client (scheduling link, scheduled events)."""
from __future__ import annotations

import time
from urllib.parse import urlencode

import httpx

from app.config import settings

AUTH_URI = "https://auth.calendly.com/oauth/authorize"
TOKEN_URI = "https://auth.calendly.com/oauth/token"
API = "https://api.calendly.com"


def authorization_url(state: str) -> str:
    params = {
        "client_id": settings.calendly_client_id,
        "redirect_uri": settings.calendly_redirect_uri,
        "response_type": "code",
        "state": state,
    }
    return f"{AUTH_URI}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            TOKEN_URI,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.calendly_client_id,
                "client_secret": settings.calendly_client_secret,
                "redirect_uri": settings.calendly_redirect_uri,
            },
        )
        resp.raise_for_status()
        data = resp.json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data.get("refresh_token"),
        "expiry": time.time() + int(data.get("expires_in", 3600)),
        "owner": data.get("owner"),
    }


async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            TOKEN_URI,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.calendly_client_id,
                "client_secret": settings.calendly_client_secret,
            },
        )
        resp.raise_for_status()
        return resp.json()


async def get_current_user(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{API}/users/me", headers={"Authorization": f"Bearer {access_token}"}
        )
        resp.raise_for_status()
        return resp.json().get("resource", {})


async def get_scheduling_link(access_token: str) -> str | None:
    """Return the user's primary scheduling URL (so the agent can share it)."""
    user = await get_current_user(access_token)
    return user.get("scheduling_url")


async def list_scheduled_events(access_token: str, *, count: int = 10) -> list[dict]:
    user = await get_current_user(access_token)
    user_uri = user.get("uri")
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{API}/scheduled_events",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"user": user_uri, "count": str(count), "sort": "start_time:asc"},
        )
        resp.raise_for_status()
        events = resp.json().get("collection", [])
    return [
        {
            "name": e.get("name"),
            "start": e.get("start_time"),
            "end": e.get("end_time"),
            "status": e.get("status"),
            "location": (e.get("location") or {}).get("location"),
        }
        for e in events
    ]
