"""Audit log helper for admin (operator) actions."""
from __future__ import annotations

from prisma import Prisma


async def record(
    db: Prisma,
    *,
    actor_id: str | None,
    action: str,
    target_type: str | None = None,
    target_id: str | None = None,
    detail: dict | None = None,
) -> None:
    await db.auditlog.create(
        data={
            "actor_id": actor_id,
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "detail": detail,
        }
    )
