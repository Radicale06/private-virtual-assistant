"""Outlook Calendar via Microsoft Graph. Teams meetings are created here too
(an event with isOnlineMeeting + teamsForBusiness yields a Teams join URL).
"""
from __future__ import annotations

from datetime import datetime

import httpx

from app.integrations.microsoft.oauth import GRAPH


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def _fmt(dt: datetime) -> str:
    # Graph wants a local-naive ISO string paired with a timeZone field.
    return dt.replace(tzinfo=None).isoformat(timespec="seconds")


async def list_events(
    access_token: str, *, time_min: datetime, time_max: datetime, max_results: int = 25
) -> list[dict]:
    params = {
        "startDateTime": time_min.isoformat(),
        "endDateTime": time_max.isoformat(),
        "$orderby": "start/dateTime",
        "$top": str(max_results),
        "$select": "subject,start,end,location,onlineMeeting,webLink",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{GRAPH}/me/calendarView", headers=_auth(access_token), params=params
        )
        resp.raise_for_status()
        items = resp.json().get("value", [])
    return [
        {
            "id": e["id"],
            "summary": e.get("subject", "(no title)"),
            "start": (e.get("start") or {}).get("dateTime"),
            "end": (e.get("end") or {}).get("dateTime"),
            "location": (e.get("location") or {}).get("displayName"),
            "join_url": (e.get("onlineMeeting") or {}).get("joinUrl"),
            "html_link": e.get("webLink"),
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
    online_meeting: bool = False,
) -> dict:
    body: dict = {
        "subject": summary,
        "start": {"dateTime": _fmt(start), "timeZone": timezone},
        "end": {"dateTime": _fmt(end), "timeZone": timezone},
    }
    if description:
        body["body"] = {"contentType": "Text", "content": description}
    if location:
        body["location"] = {"displayName": location}
    if attendees:
        body["attendees"] = [
            {"emailAddress": {"address": a}, "type": "required"} for a in attendees
        ]
    if online_meeting:
        body["isOnlineMeeting"] = True
        body["onlineMeetingProvider"] = "teamsForBusiness"

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{GRAPH}/me/events", headers=_auth(access_token), json=body
        )
        resp.raise_for_status()
        e = resp.json()
    return {
        "id": e["id"],
        "summary": e.get("subject"),
        "start": (e.get("start") or {}).get("dateTime"),
        "end": (e.get("end") or {}).get("dateTime"),
        "html_link": e.get("webLink"),
        "join_url": (e.get("onlineMeeting") or {}).get("joinUrl"),
    }


async def update_event(access_token: str, event_id: str, patch: dict) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.patch(
            f"{GRAPH}/me/events/{event_id}", headers=_auth(access_token), json=patch
        )
        resp.raise_for_status()
        return resp.json()


async def delete_event(access_token: str, event_id: str) -> None:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.delete(
            f"{GRAPH}/me/events/{event_id}", headers=_auth(access_token)
        )
        if resp.status_code not in (200, 202, 204):
            resp.raise_for_status()
