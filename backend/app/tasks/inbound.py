"""Celery task: process an inbound WhatsApp webhook payload.

The webhook returns 200 fast and enqueues here. Per-tenant Redis lock serializes one
user's messages (ordering) while different users run in parallel.
"""
from __future__ import annotations

import asyncio

from app.core.locks import tenant_lock
from app.db import prisma_session
from app.logging_config import get_logger
from app.services.inbound_service import process_inbound
from app.services.linking_service import normalize_phone
from app.tasks.celery_app import celery_app
from app.whatsapp.webhook import parse_inbound

log = get_logger(__name__)


async def _handle_payload(payload: dict) -> None:
    messages = parse_inbound(payload)
    async with prisma_session() as db:
        for msg in messages:
            try:
                await process_inbound(db, msg)
            except Exception as exc:  # one bad message shouldn't kill the batch
                log.error("inbound_processing_failed", error=str(exc), phone=msg.from_phone)


@celery_app.task(name="app.tasks.inbound.process_webhook", bind=True, max_retries=2)
def process_webhook(self, payload: dict) -> None:
    # Serialize per sender (first message's phone keys the lock for the batch).
    messages = parse_inbound(payload)
    if not messages:
        return
    key = normalize_phone(messages[0].from_phone)

    with tenant_lock(key) as acquired:
        if not acquired:
            # Couldn't get the lock  requeue shortly so ordering holds.
            raise self.retry(countdown=2)
        asyncio.run(_handle_payload(payload))
