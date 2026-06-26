"""Gmail REST client  list/read recent messages and send mail."""
from __future__ import annotations

import base64
from email.mime.text import MIMEText

import httpx

BASE = "https://gmail.googleapis.com/gmail/v1/users/me"


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def list_recent(access_token: str, *, max_results: int = 10, query: str = "") -> list[dict]:
    """List recent message headers (id, from, subject, snippet, date)."""
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{BASE}/messages",
            headers=_auth(access_token),
            params={"maxResults": str(max_results), "q": query or "in:inbox"},
        )
        resp.raise_for_status()
        ids = [m["id"] for m in resp.json().get("messages", [])]

        out = []
        for mid in ids:
            mresp = await client.get(
                f"{BASE}/messages/{mid}",
                headers=_auth(access_token),
                params={"format": "metadata", "metadataHeaders": ["From", "Subject", "Date"]},
            )
            mresp.raise_for_status()
            data = mresp.json()
            headers = {h["name"]: h["value"] for h in data.get("payload", {}).get("headers", [])}
            out.append(
                {
                    "id": mid,
                    "from": headers.get("From"),
                    "subject": headers.get("Subject"),
                    "date": headers.get("Date"),
                    "snippet": data.get("snippet"),
                }
            )
    return out


async def send_email(
    access_token: str, *, to: str, subject: str, body: str, sender: str | None = None
) -> dict:
    mime = MIMEText(body)
    mime["to"] = to
    mime["subject"] = subject
    if sender:
        mime["from"] = sender
    raw = base64.urlsafe_b64encode(mime.as_bytes()).decode()

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{BASE}/messages/send",
            headers={**_auth(access_token), "Content-Type": "application/json"},
            json={"raw": raw},
        )
        resp.raise_for_status()
        return resp.json()  # {id, threadId, labelIds}
