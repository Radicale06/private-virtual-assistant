"""Seed a regular customer (`user` role) + their draft assistant.

Mirrors create_admin.py, but for the `user` role (the normal customer flow is
self-registration via /api/auth/register; this is a convenience for seeding).

Usage:
    python -m scripts.create_user <email> <password> [full_name] [timezone]
"""
from __future__ import annotations

import asyncio
import sys

from app.constants import UserRole
from app.core.security import hash_password
from app.db import prisma_session
from app.services.agent_service import get_or_create_agent


async def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python -m scripts.create_user <email> <password> [full_name] [timezone]")
        raise SystemExit(1)

    email, password = sys.argv[1], sys.argv[2]
    full_name = sys.argv[3] if len(sys.argv) > 3 else None
    timezone = sys.argv[4] if len(sys.argv) > 4 else "UTC"

    async with prisma_session() as db:
        existing = await db.user.find_unique(where={"email": email})
        if existing:
            print(f"User {email} already exists (role={existing.role}).")
            return

        user = await db.user.create(
            data={
                "email": email,
                "hashed_password": hash_password(password),
                "full_name": full_name,
                "timezone": timezone,
                "role": UserRole.user,
            }
        )
        # Every customer gets one draft assistant up front (same as registration).
        await get_or_create_agent(db, user.id)
        print(f"Created user {email} (role=user) with a draft assistant.")


if __name__ == "__main__":
    asyncio.run(main())
