"""Calendar tools: create, list, reschedule, cancel events (Google Calendar)."""
from __future__ import annotations

from datetime import timedelta

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry
from app.constants import IntegrationProvider
from app.integrations.google import calendar as gcal
from app.integrations.google.oauth import refresh_access_token
from app.integrations.tokens import get_fresh_access_token
from app.utils.timeparse import humanize, now_in, parse_dt


async def _token(ctx: ToolContext) -> str:
    return await get_fresh_access_token(
        ctx.db, ctx.agent.id, IntegrationProvider.google_calendar, refresh_access_token
    )


class CreateEvent(Tool):
    name = "create_event"
    description = "Create a calendar event. Use ISO-8601 datetimes in the user's timezone."
    requires = IntegrationProvider.google_calendar
    parameters = {
        "type": "object",
        "properties": {
            "summary": {"type": "string", "description": "Event title"},
            "start": {"type": "string", "description": "ISO-8601 start datetime"},
            "end": {"type": "string", "description": "ISO-8601 end datetime (optional)"},
            "duration_minutes": {"type": "integer", "description": "Used if end is omitted"},
            "description": {"type": "string"},
            "location": {"type": "string"},
            "attendees": {"type": "array", "items": {"type": "string"}},
            "add_meet_link": {"type": "boolean", "description": "Attach a Google Meet link"},
        },
        "required": ["summary", "start"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        start = parse_dt(kw["start"], ctx.user_timezone)
        if kw.get("end"):
            end = parse_dt(kw["end"], ctx.user_timezone)
        else:
            end = start + timedelta(minutes=int(kw.get("duration_minutes", 30)))

        token = await _token(ctx)
        event = await gcal.create_event(
            token,
            summary=kw["summary"],
            start=start,
            end=end,
            timezone=ctx.user_timezone,
            description=kw.get("description"),
            location=kw.get("location"),
            attendees=kw.get("attendees"),
            add_meet_link=bool(kw.get("add_meet_link")),
        )
        return ToolResult(
            ok=True,
            data=event,
            summary=f"Created event '{kw['summary']}' at {humanize(start, ctx.user_timezone)}",
        )


class ListEvents(Tool):
    name = "list_events"
    description = "List upcoming calendar events within a window (defaults to the next 7 days)."
    requires = IntegrationProvider.google_calendar
    parameters = {
        "type": "object",
        "properties": {
            "time_min": {"type": "string", "description": "ISO-8601 start of window"},
            "time_max": {"type": "string", "description": "ISO-8601 end of window"},
            "max_results": {"type": "integer"},
        },
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        tmin = parse_dt(kw["time_min"], ctx.user_timezone) if kw.get("time_min") else now_in(
            ctx.user_timezone
        )
        tmax = (
            parse_dt(kw["time_max"], ctx.user_timezone)
            if kw.get("time_max")
            else tmin + timedelta(days=7)
        )
        token = await _token(ctx)
        events = await gcal.list_events(
            token, time_min=tmin, time_max=tmax, max_results=int(kw.get("max_results", 25))
        )
        return ToolResult(ok=True, data={"events": events})


class RescheduleEvent(Tool):
    name = "reschedule_event"
    description = "Move an existing event to a new time. Requires the event id (from list_events)."
    requires = IntegrationProvider.google_calendar
    parameters = {
        "type": "object",
        "properties": {
            "event_id": {"type": "string"},
            "start": {"type": "string", "description": "New ISO-8601 start"},
            "end": {"type": "string", "description": "New ISO-8601 end (optional)"},
            "duration_minutes": {"type": "integer"},
        },
        "required": ["event_id", "start"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        start = parse_dt(kw["start"], ctx.user_timezone)
        end = (
            parse_dt(kw["end"], ctx.user_timezone)
            if kw.get("end")
            else start + timedelta(minutes=int(kw.get("duration_minutes", 30)))
        )
        token = await _token(ctx)
        patch = {
            "start": {"dateTime": start.isoformat(), "timeZone": ctx.user_timezone},
            "end": {"dateTime": end.isoformat(), "timeZone": ctx.user_timezone},
        }
        await gcal.update_event(token, kw["event_id"], patch)
        return ToolResult(
            ok=True,
            data={"event_id": kw["event_id"], "start": start.isoformat()},
            summary=f"Rescheduled event to {humanize(start, ctx.user_timezone)}",
        )


class CancelEvent(Tool):
    name = "cancel_event"
    description = "Cancel/delete a calendar event by id. This is destructive."
    requires = IntegrationProvider.google_calendar
    destructive = True
    parameters = {
        "type": "object",
        "properties": {
            "event_id": {"type": "string"},
            "summary": {"type": "string", "description": "Event title, for the confirmation"},
            "confirmed": {"type": "boolean", "description": "Set true once the user confirms"},
        },
        "required": ["event_id"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        if ctx.agent.confirm_before_send and not kw.get("confirmed"):
            return ToolResult(
                ok=True,
                data={"action": "cancel_event", "summary": kw.get("summary", kw["event_id"])},
                requires_confirmation=True,
            )
        token = await _token(ctx)
        await gcal.delete_event(token, kw["event_id"])
        return ToolResult(
            ok=True,
            data={"cancelled": kw["event_id"]},
            summary=f"Cancelled event {kw.get('summary', kw['event_id'])}",
        )


registry.register(CreateEvent())
registry.register(ListEvents())
registry.register(RescheduleEvent())
registry.register(CancelEvent())
