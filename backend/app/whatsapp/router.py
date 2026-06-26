"""Tenant router  the spine of the multi-tenant single-number architecture.

Every inbound message funnels through one number; the `from` phone is the tenant key.
  known phone        → resolve agent instance, update 24h window
  unknown + token    → bind phone to agent (linking)
  unknown + no token → onboarding reply, no agent
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from prisma import Prisma
from prisma.models import Agent

from app.config import settings
from app.services.linking_service import (
    consume_linking_token,
    looks_like_token,
    normalize_phone,
)


@dataclass
class RouteResult:
    agent: Agent | None
    just_linked: bool = False
    onboarding: bool = False


async def resolve(db: Prisma, phone: str, text: str | None) -> RouteResult:
    phone_norm = normalize_phone(phone)

    identity = await db.whatsappidentity.find_unique(where={"phone_number": phone_norm})
    if identity is not None:
        if identity.blocked:
            return RouteResult(agent=None, onboarding=False)
        await db.whatsappidentity.update(
            where={"phone_number": phone_norm},
            data={"last_inbound_at": datetime.now(timezone.utc)},
        )
        agent = await db.agent.find_unique(where={"id": identity.agent_id})
        return RouteResult(agent=agent)

    # Unknown sender  try linking.
    if looks_like_token(text):
        agent = await consume_linking_token(db, text, phone, None)
        if agent is not None:
            return RouteResult(agent=agent, just_linked=True)

    return RouteResult(agent=None, onboarding=True)


def onboarding_message() -> str:
    return (
        "👋 Hi! I'm a personal assistant, but I don't recognize this number yet.\n\n"
        f"Sign up at {settings.frontend_base_url}, set up your assistant, and scan the QR "
        "code to connect  then I'll help you manage your calendar, reminders, and email "
        "right here."
    )


def linked_message(agent_name: str) -> str:
    return (
        f"✅ You're connected  I'm {agent_name}, your assistant.\n"
        "Try things like:\n"
        "• \"Remind me to call the bank in 3 hours\"\n"
        "• \"What's on my calendar tomorrow?\"\n"
        "• \"Schedule a meeting with Sara Friday at 2pm\"\n"
        "You can also send me a voice note."
    )
