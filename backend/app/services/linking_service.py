"""Linking service  QR/deep-link token lifecycle that binds a phone to an agent.

Flow: dashboard creates a token → renders wa.me/<shared>?text=<token> as a QR →
user sends the prefilled message → webhook router consumes the token → phone is
bound to the agent in whatsapp_identities. After that, the phone IS the identity.
"""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from prisma import Prisma

from app.config import settings
from app.constants import AgentStatus

TOKEN_TTL_MINUTES = 60 * 24  # QR valid for 24h


def normalize_phone(phone: str) -> str:
    """Store phones consistently as digits only (WhatsApp `from` has no +)."""
    return "".join(ch for ch in phone if ch.isdigit())


def _shared_number_digits() -> str:
    return normalize_phone(settings.public_whatsapp_number)


async def create_linking_token(db: Prisma, agent_id: str) -> dict:
    token = f"link-{secrets.token_hex(8)}"
    expires = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_TTL_MINUTES)
    await db.linkingtoken.create(
        data={"token": token, "agent_id": agent_id, "expires_at": expires}
    )
    wa_link = f"https://wa.me/{_shared_number_digits()}?text={token}"
    return {"token": token, "wa_link": wa_link, "expires_at": expires.isoformat()}


def looks_like_token(text: str | None) -> bool:
    return bool(text) and text.strip().lower().startswith("link-")


async def consume_linking_token(
    db: Prisma, text: str, phone: str, profile_name: str | None
):
    """Bind a phone to the token's agent. Returns the Agent, or None if invalid."""
    token = text.strip().lower()
    row = await db.linkingtoken.find_unique(where={"token": token})
    if row is None or row.used_at is not None:
        return None
    if row.expires_at < datetime.now(timezone.utc):
        return None

    phone_norm = normalize_phone(phone)

    # Bind phone → agent (idempotent upsert), mark token used, activate agent.
    await db.whatsappidentity.upsert(
        where={"phone_number": phone_norm},
        data={
            "create": {
                "phone_number": phone_norm,
                "agent_id": row.agent_id,
                "display_name": profile_name,
                "last_inbound_at": datetime.now(timezone.utc),
            },
            "update": {"agent_id": row.agent_id, "last_inbound_at": datetime.now(timezone.utc)},
        },
    )
    await db.linkingtoken.update(
        where={"token": token}, data={"used_at": datetime.now(timezone.utc)}
    )
    await db.agent.update(where={"id": row.agent_id}, data={"status": AgentStatus.active})
    return await db.agent.find_unique(where={"id": row.agent_id})
