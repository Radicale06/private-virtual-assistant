"""Message persistence + the WhatsApp 24h-window send decision.

Logs every inbound/outbound message to the transcript (history), records agent
actions for the activity feed, and chooses free-form vs. template when replying.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from prisma import Prisma

from app.constants import MessageDirection, MessageRole, MessageType
from app.whatsapp import client as wa
from app.whatsapp.templates import body_vars, reminder_sid


async def log_inbound(
    db: Prisma, agent_id: str, *, wa_message_id: str, text: str, mtype: str
) -> None:
    # Idempotent on wa_message_id (Meta retries deliveries).
    existing = await db.message.find_unique(where={"wa_message_id": wa_message_id})
    if existing:
        return
    await db.message.create(
        data={
            "agent_id": agent_id,
            "wa_message_id": wa_message_id,
            "direction": MessageDirection.inbound,
            "role": MessageRole.user,
            "type": MessageType.voice if mtype == "audio" else MessageType.text,
            "content": text,
        }
    )


async def log_outbound(
    db: Prisma,
    agent_id: str,
    *,
    text: str,
    mtype: str = MessageType.text,
    tokens: int = 0,
) -> None:
    await db.message.create(
        data={
            "agent_id": agent_id,
            "direction": MessageDirection.outbound,
            "role": MessageRole.assistant,
            "type": mtype,
            "content": text,
            "tokens": tokens or None,
        }
    )


async def log_actions(db: Prisma, agent_id: str, actions: list[dict]) -> None:
    for a in actions:
        await db.message.create(
            data={
                "agent_id": agent_id,
                "direction": MessageDirection.outbound,
                "role": MessageRole.tool,
                "type": MessageType.action,
                "content": a.get("summary"),
                "payload": a,
            }
        )


async def within_window(db: Prisma, phone_number: str) -> bool:
    """True if the recipient messaged us within the last 24h (free-form allowed)."""
    identity = await db.whatsappidentity.find_unique(where={"phone_number": phone_number})
    if identity is None or identity.last_inbound_at is None:
        return False
    return identity.last_inbound_at > datetime.now(timezone.utc) - timedelta(hours=24)


async def send_windowed(db: Prisma, agent_id: str, phone_number: str, text: str) -> None:
    """Send `text`, choosing free-form vs. Twilio Content template by the 24h window."""
    if await within_window(db, phone_number):
        await wa.send_text(phone_number, text)
        await log_outbound(db, agent_id, text=text)
        return

    # Outside the window: use an approved Content template if configured.
    sid = reminder_sid()
    if sid:
        await wa.send_template(phone_number, sid, body_vars(text))
        await log_outbound(db, agent_id, text=text, mtype=MessageType.template)
    else:
        # No template configured: best-effort free-form (Twilio rejects outside window).
        await wa.send_text(phone_number, text)
        await log_outbound(db, agent_id, text=text)


# Backwards-compatible alias used by the inbound flow.
reply = send_windowed
