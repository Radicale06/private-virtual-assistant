"""Load a connected integration for an agent, transparently refreshing OAuth tokens.

Strictly scoped by agent_id  the one place tools obtain credentials. A refresh
failure flips the integration to `error` so the dashboard surfaces it.
"""
from __future__ import annotations

import time
from typing import Awaitable, Callable

from prisma import Prisma
from prisma.models import AgentIntegration

from app.constants import IntegrationStatus
from app.core.vault import read_tokens, write_tokens


class IntegrationNotConnected(Exception):
    pass


async def get_integration(db: Prisma, agent_id: str, provider: str) -> AgentIntegration:
    row = await db.agentintegration.find_unique(
        where={"agent_id_provider": {"agent_id": agent_id, "provider": provider}}
    )
    if row is None or row.status == IntegrationStatus.disconnected:
        raise IntegrationNotConnected(f"{provider} is not connected")
    return row


async def get_fresh_access_token(
    db: Prisma,
    agent_id: str,
    provider: str,
    refresh_fn: Callable[[str], Awaitable[dict]],
) -> str:
    """Return a valid access token, refreshing via `refresh_fn(refresh_token)` if expired."""
    row = await get_integration(db, agent_id, provider)
    tokens = read_tokens(row.token_blob)
    access = tokens.get("access_token")
    expiry = tokens.get("expiry", 0)
    refresh = tokens.get("refresh_token")

    if access and expiry and time.time() < (expiry - 60):
        return access

    if not refresh:
        return access

    try:
        new = await refresh_fn(refresh)
        tokens["access_token"] = new["access_token"]
        tokens["expiry"] = time.time() + int(new.get("expires_in", 3600))
        if new.get("refresh_token"):
            tokens["refresh_token"] = new["refresh_token"]
        await db.agentintegration.update(
            where={"id": row.id},
            data={
                "token_blob": write_tokens(tokens),
                "status": IntegrationStatus.connected,
                "last_error": None,
            },
        )
        return tokens["access_token"]
    except Exception as exc:
        await db.agentintegration.update(
            where={"id": row.id},
            data={"status": IntegrationStatus.error, "last_error": str(exc)},
        )
        raise
