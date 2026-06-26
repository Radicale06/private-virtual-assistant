"""Agent lifecycle helpers."""
from __future__ import annotations

from prisma import Prisma
from prisma.models import Agent


async def get_or_create_agent(db: Prisma, user_id: str, name: str = "Assistant") -> Agent:
    agent = await db.agent.find_unique(where={"user_id": user_id})
    if agent is None:
        agent = await db.agent.create(data={"user_id": user_id, "name": name})
    return agent


async def is_linked(db: Prisma, agent_id: str) -> tuple[bool, str | None]:
    identity = await db.whatsappidentity.find_first(where={"agent_id": agent_id})
    if identity is None:
        return False, None
    return True, identity.phone_number
