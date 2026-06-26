"""Reminder tool  creates a durable Job row. The scheduler (Celery beat) polls due
jobs and delivers them via WhatsApp. The table is the source of truth; no reminder is
lost if Redis/the worker restarts. Always available (no integration required).
"""
from __future__ import annotations

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry
from app.constants import JobStatus, JobType
from app.utils.timeparse import humanize, parse_dt, to_utc


class SetReminder(Tool):
    name = "set_reminder"
    description = (
        "Schedule a reminder to message the user at a specific time. "
        "Use an absolute ISO-8601 datetime in the user's timezone."
    )
    requires = None  # core capability, always available
    parameters = {
        "type": "object",
        "properties": {
            "text": {"type": "string", "description": "What to remind the user about"},
            "remind_at": {"type": "string", "description": "ISO-8601 datetime to fire"},
        },
        "required": ["text", "remind_at"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        when = parse_dt(kw["remind_at"], ctx.user_timezone)
        job = await ctx.db.job.create(
            data={
                "agent_id": ctx.agent.id,
                "type": JobType.reminder,
                "status": JobStatus.pending,
                "run_at": to_utc(when),
                "title": kw["text"],
                "payload": {"text": kw["text"]},
            }
        )
        return ToolResult(
            ok=True,
            data={"reminder_id": job.id, "remind_at": when.isoformat()},
            summary=f"Reminder set for {humanize(when, ctx.user_timezone)}: {kw['text']}",
        )


class ListReminders(Tool):
    name = "list_reminders"
    description = "List the user's upcoming (pending) reminders."
    requires = None
    parameters = {"type": "object", "properties": {}}

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        jobs = await ctx.db.job.find_many(
            where={"agent_id": ctx.agent.id, "type": JobType.reminder, "status": JobStatus.pending},
            order={"run_at": "asc"},
            take=20,
        )
        return ToolResult(
            ok=True,
            data={
                "reminders": [
                    {"id": j.id, "text": j.title, "remind_at": j.run_at.isoformat()} for j in jobs
                ]
            },
        )


class CancelReminder(Tool):
    name = "cancel_reminder"
    description = "Cancel an upcoming reminder by its id (from list_reminders)."
    requires = None
    parameters = {
        "type": "object",
        "properties": {"reminder_id": {"type": "string"}},
        "required": ["reminder_id"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        await ctx.db.job.update(
            where={"id": kw["reminder_id"]}, data={"status": JobStatus.cancelled}
        )
        return ToolResult(ok=True, data={"cancelled": kw["reminder_id"]}, summary="Reminder cancelled")


registry.register(SetReminder())
registry.register(ListReminders())
registry.register(CancelReminder())
