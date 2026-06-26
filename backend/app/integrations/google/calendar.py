"""Google Calendar REST client. Tools obtain a fresh access token then call these."""
from __future__ import annotations

import uuid
from datetime import datetime

import httpx

BASE = "https://www.googleapis.com/calendar/v3"


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


async def list_events(
    access_token: str,
    *,
    time_min: datetime,
    time_max: datetime,
    max_results: int = 25,
    calendar_id: str = "primary",
) -> list[dict]:
    params = {
        "timeMin": time_min.isoformat(),
        "timeMax": time_max.isoformat(),
        "singleEvents": "true",
        "orderBy": "startTime",
        "maxResults": str(max_results),
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{BASE}/calendars/{calendar_id}/events",
            headers=_auth(access_token),
            params=params,
        )
        resp.raise_for_status()
        items = resp.json().get("items", [])
    return [
        {
            "id": e["id"],
            "summary": e.get("summary", "(no title)"),
            "start": e["start"].get("dateTime", e["start"].get("date")),
            "end": e["end"].get("dateTime", e["end"].get("date")),
            "location": e.get("location"),
            "hangout_link": e.get("hangoutLink"),
            "html_link": e.get("htmlLink"),
        }
        for e in items
    ]


async def create_event(
    access_token: str,
    *,
    summary: str,
    start: datetime,
    end: datetime,
    timezone: str,
    description: str | None = None,
    location: str | None = None,
    attendees: list[str] | None = None,
    add_meet_link: bool = False,
    calendar_id: str = "primary",
) -> dict:
    body: dict = {
        "summary": summary,
        "start": {"dateTime": start.isoformat(), "timeZone": timezone},
        "end": {"dateTime": end.isoformat(), "timeZone": timezone},
    }
    if description:
        body["description"] = description
    if location:
        body["location"] = location
    if attendees:
        body["attendees"] = [{"email": a} for a in attendees]
    params = {}
    if add_meet_link:
        body["conferenceData"] = {
            "createRequest": {
                "requestId": uuid.uuid4().hex,
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        }
        params["conferenceDataVersion"] = "1"

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{BASE}/calendars/{calendar_id}/events",
            headers=_auth(access_token),
            params=params,
            json=body,
        )
        resp.raise_for_status()
        e = resp.json()
    return {
        "id": e["id"],
        "summary": e.get("summary"),
        "start": e["start"].get("dateTime"),
        "end": e["end"].get("dateTime"),
        "html_link": e.get("htmlLink"),
        "hangout_link": e.get("hangoutLink"),
    }


async def update_event(
    access_token: str, event_id: str, patch: dict, *, calendar_id: str = "primary"
) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.patch(
            f"{BASE}/calendars/{calendar_id}/events/{event_id}",
            headers=_auth(access_token),
            json=patch,
        )
        resp.raise_for_status()
        return resp.json()


async def delete_event(
    access_token: str, event_id: str, *, calendar_id: str = "primary"
) -> None:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.delete(
            f"{BASE}/calendars/{calendar_id}/events/{event_id}",
            headers=_auth(access_token),
        )
        if resp.status_code not in (200, 204):
            resp.raise_for_status()
