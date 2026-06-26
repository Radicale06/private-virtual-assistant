"""Celery task: morning briefings.

Runs every 15 min; for each agent with briefings enabled whose local briefing time
falls in this window, builds a short agenda from their calendar and sends it.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta

from app.constants import IntegrationProvider, IntegrationStatus
from app.db import prisma_session
from app.integrations.google import calendar as gcal
from app.integrations.google.oauth import refresh_access_token
from app.integrations.tokens import get_fresh_access_token
from app.logging_config import get_logger
from app.utils.timeparse import now_in
from app.whatsapp import client as wa
from app.whatsapp.templates import body_vars, briefing_sid
from app.services.message_service import log_outbound, within_window
from app.tasks.celery_app import celery_app

log = get_logger(__name__)


async def _build_briefing(db, agent, tz: str) -> str:
    today = now_in(tz)
    end = today.replace(hour=23, minute=59, second=59)
    try:
        token = await get_fresh_access_token(
            db, agent.id, IntegrationProvider.google_calendar, refresh_access_token
        )
        events = await gcal.list_events(token, time_min=today, time_max=end, max_results=10)
    except Exception:
        events = []

    if not events:
        return "Good morning! You have no events scheduled today. ☀️"
    lines = []
    for e in events[:6]:
        start = (e.get("start") or "")[11:16]
        lines.append(f"• {start} {e.get('summary')}")
    return "Good morning! Today's agenda:\n" + "\n".join(lines)


async def _dispatch() -> int:
    sent = 0
    async with prisma_session() as db:
        agents = await db.agent.find_many(where={"morning_briefing_enabled": True})
        for agent in agents:
            if agent.morning_briefing_time is None:
                continue
            user = await db.user.find_unique(where={"id": agent.user_id})
            tz = user.timezone if user else "UTC"
            local = now_in(tz)
            try:
                hh, mm = (int(x) for x in agent.morning_briefing_time.split(":"))
            except (ValueError, AttributeError):
                continue

            # Fire if we're within 15 min after the configured local time.
            target_dt = local.replace(hour=hh, minute=mm, second=0, microsecond=0)
            if not (target_dt <= local < target_dt + timedelta(minutes=15)):
                continue

            identity = await db.whatsappidentity.find_first(where={"agent_id": agent.id})
            if identity is None:
                continue

            text = await _build_briefing(db, agent, tz)
            phone = identity.phone_number
            try:
                sid = briefing_sid()
                if not await within_window(db, phone) and sid:
                    await wa.send_template(phone, sid, body_vars(text))
                else:
                    await wa.send_text(phone, text)  # free-form (inside window or no template)
                await log_outbound(db, agent.id, text=text)
                sent += 1
            except Exception as exc:
                log.error("briefing_failed", agent_id=agent.id, error=str(exc))
    return sent


@celery_app.task(name="app.tasks.briefings.dispatch_briefings")
def dispatch_briefings() -> int:
    return asyncio.run(_dispatch())
