"""Celery task: deliver due reminders.

Polls the durable jobs table for pending reminders whose run_at has passed and sends
them via WhatsApp. Outside the 24h window these go out as approved templates.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from app.constants import JobStatus, JobType
from app.db import prisma_session
from app.logging_config import get_logger
from app.services.message_service import send_windowed
from app.tasks.celery_app import celery_app

log = get_logger(__name__)


async def _deliver_due() -> int:
    sent = 0
    async with prisma_session() as db:
        now = datetime.now(timezone.utc)
        due = await db.job.find_many(
            where={"type": JobType.reminder, "status": JobStatus.pending, "run_at": {"lte": now}},
            order={"run_at": "asc"},
            take=100,
        )
        for job in due:
            identity = await db.whatsappidentity.find_first(where={"agent_id": job.agent_id})
            if identity is None:
                await db.job.update(
                    where={"id": job.id},
                    data={"status": JobStatus.failed, "last_error": "no linked phone"},
                )
                continue

            phone = identity.phone_number
            text = (job.payload or {}).get("text") or job.title or "Reminder"
            try:
                # Window-aware send (free-form inside 24h, Content template outside).
                await send_windowed(db, job.agent_id, phone, f"⏰ Reminder: {text}")
                await db.job.update(
                    where={"id": job.id},
                    data={"status": JobStatus.sent, "sent_at": datetime.now(timezone.utc)},
                )
                sent += 1
            except Exception as exc:
                log.error("reminder_delivery_failed", job_id=job.id, error=str(exc))
                await db.job.update(
                    where={"id": job.id},
                    data={"status": JobStatus.failed, "last_error": str(exc)},
                )
    return sent


@celery_app.task(name="app.tasks.reminders.poll_due_jobs")
def poll_due_jobs() -> int:
    return asyncio.run(_deliver_due())
