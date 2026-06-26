"""WhatsApp client via Twilio.

Sends through the Twilio Messages API (HTTP Basic auth: AccountSid:AuthToken,
form-encoded body). Twilio's WhatsApp also enforces the 24h customer-care window:
free-form `Body` is allowed within 24h of the user's last inbound message; outside
it you must send an approved Content template (referenced by ContentSid).
"""
from __future__ import annotations

import json

import httpx

from app.config import settings
from app.logging_config import get_logger

log = get_logger(__name__)


def _messages_url() -> str:
    return f"{settings.twilio_api_base}/Accounts/{settings.twilio_account_sid}/Messages.json"


def _auth() -> tuple[str, str]:
    return (settings.twilio_account_sid, settings.twilio_auth_token)


def _wa(number: str) -> str:
    """Format an E.164 number as a Twilio WhatsApp address (whatsapp:+E164)."""
    n = number.strip()
    if n.startswith("whatsapp:"):
        return n
    if not n.startswith("+"):
        n = "+" + "".join(ch for ch in n if ch.isdigit())
    return f"whatsapp:{n}"


def _from() -> str:
    return _wa(settings.twilio_whatsapp_number)


async def _post(data: dict) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(_messages_url(), data=data, auth=_auth())
        if resp.status_code >= 400:
            log.warning("twilio_send_failed", status=resp.status_code, body=resp.text)
        resp.raise_for_status()
        return resp.json()


async def send_text(to: str, body: str) -> dict:
    """Free-form text reply. Valid only inside the recipient's 24h window."""
    return await _post({"From": _from(), "To": _wa(to), "Body": body[:1600]})


async def send_template(to: str, content_sid: str, variables: dict | None = None) -> dict:
    """Send an approved Content template (proactive messages outside the 24h window).

    `content_sid` is a Twilio Content SID (HX...). `variables` maps positional keys
    ("1", "2", ...) to substitution values.
    """
    data = {"From": _from(), "To": _wa(to), "ContentSid": content_sid}
    if variables:
        data["ContentVariables"] = json.dumps(variables)
    return await _post(data)


async def download_media(media_url: str) -> bytes:
    """Download inbound media (voice note). Twilio media URLs require Basic auth and
    typically 307-redirect to a short-lived storage URL; httpx drops the auth header
    on the cross-host redirect, which is correct.
    """
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        resp = await client.get(media_url, auth=_auth())
        resp.raise_for_status()
        return resp.content
