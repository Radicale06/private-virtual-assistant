"""Prisma client provider.

A single shared async Prisma client for the web process (connected/disconnected in
the FastAPI lifespan). Celery workers use `prisma_session()` for a short-lived
connected client per task to avoid event-loop reuse issues.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from prisma import Prisma

# Shared client for the API process.
prisma = Prisma(auto_register=True)


async def connect_db() -> None:
    if not prisma.is_connected():
        await prisma.connect()


async def disconnect_db() -> None:
    if prisma.is_connected():
        await prisma.disconnect()


async def get_db() -> Prisma:
    """FastAPI dependency  returns the shared connected client."""
    return prisma


@asynccontextmanager
async def prisma_session() -> AsyncIterator[Prisma]:
    """Short-lived connected client, for Celery tasks / scripts."""
    client = Prisma(auto_register=True)
    await client.connect()
    try:
        yield client
    finally:
        await client.disconnect()
