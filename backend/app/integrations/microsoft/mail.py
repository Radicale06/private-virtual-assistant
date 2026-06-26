"""Outlook Mail via Microsoft Graph — list/read recent messages and send mail."""
from __future__ import annotations

import httpx

from app.integrations.microsoft.oauth import GRAPH


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def list_recent(access_token: str, *, max_results: int = 10, query: str = "") -> list[dict]:
    params = {
        "$top": str(max_results),
        "$orderby": "receivedDateTime desc",
        "$select": "subject,from,receivedDateTime,bodyPreview",
    }
    if query:
        params["$search"] = f'"{query}"'
        params.pop("$orderby", None)  # Graph forbids $orderby with $search
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{GRAPH}/me/messages", headers=_auth(access_token), params=params
        )
        resp.raise_for_status()
        messages = resp.json().get("value", [])
    return [
        {
            "id": m["id"],
            "from": ((m.get("from") or {}).get("emailAddress") or {}).get("address"),
            "subject": m.get("subject"),
            "date": m.get("receivedDateTime"),
            "snippet": m.get("bodyPreview"),
        }
        for m in messages
    ]


async def send_email(access_token: str, *, to: str, subject: str, body: str) -> dict:
    payload = {
        "message": {
            "subject": subject,
            "body": {"contentType": "Text", "content": body},
            "toRecipients": [{"emailAddress": {"address": to}}],
        },
        "saveToSentItems": True,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{GRAPH}/me/sendMail",
            headers={**_auth(access_token), "Content-Type": "application/json"},
            json=payload,
        )
        # sendMail returns 202 Accepted with no body
        if resp.status_code not in (200, 202):
            resp.raise_for_status()
    return {"sent": True}
