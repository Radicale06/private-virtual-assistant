"""Create (or promote) a platform-admin (operator) account.

Roles: `user` (customer) and `admin` (platform operator). This script makes an
account an `admin` so it can access the Platform Console (/api/admin/*).

Usage:
    python -m scripts.create_admin <email> <password> [full_name]
"""
from __future__ import annotations

import asyncio
import sys

from app.constants import UserRole
from app.core.security import hash_password
from app.db import prisma_session


async def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python -m scripts.create_admin <email> <password> [full_name]")
        raise SystemExit(1)

    email, password = sys.argv[1], sys.argv[2]
    full_name = sys.argv[3] if len(sys.argv) > 3 else "Operator"

    async with prisma_session() as db:
        existing = await db.user.find_unique(where={"email": email})
        if existing:
            await db.user.update(where={"id": existing.id}, data={"role": UserRole.admin})
            print(f"Promoted existing user {email} to admin.")
        else:
            await db.user.create(
                data={
                    "email": email,
                    "hashed_password": hash_password(password),
                    "full_name": full_name,
                    "role": UserRole.admin,
                }
            )
            print(f"Created admin {email}.")


if __name__ == "__main__":
    asyncio.run(main())
