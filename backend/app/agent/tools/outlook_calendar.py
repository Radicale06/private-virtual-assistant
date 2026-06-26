"""Outlook Calendar tools (Microsoft Graph): create, list, reschedule, cancel."""
from __future__ import annotations

from datetime import timedelta

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry
from app.constants import IntegrationProvider
from app.integrations.microsoft import calendar as mscal
from app.integrations.microsoft.oauth import refresh_access_token
from app.integrations.tokens import get_fresh_access_token
from app.utils.timeparse import humanize, now_in, parse_dt


async def _token(ctx: ToolContext) -> str:
    return await get_fresh_access_token(
        ctx.db, ctx.agent.id, IntegrationProvider.outlook_calendar, refresh_access_token
    )


class CreateOutlookEvent(Tool):
    name = "create_outlook_event"
    description = "Create an event in the user's Outlook (Microsoft 365) calendar."
    requires = IntegrationProvider.outlook_calendar
    parameters = {
        "type": "object",
        "properties": {
            "summary": {"type": "string", "description": "Event title"},
            "start": {"type": "string", "description": "ISO-8601 start datetime"},
            "end": {"type": "string", "description": "ISO-8601 end datetime (optional)"},
            "duration_minutes": {"type": "integer"},
            "description": {"type": "string"},
            "location": {"type": "string"},
            "attendees": {"type": "array", "items": {"type": "string"}},
            "add_teams_meeting": {"type": "boolean", "description": "Attach a Teams meeting link"},
        },
        "required": ["summary", "start"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        start = parse_dt(kw["start"], ctx.user_timezone)
        end = (
            parse_dt(kw["end"], ctx.user_timezone)
            if kw.get("end")
            else start + timedelta(minutes=int(kw.get("duration_minutes", 30)))
        )
        token = await _token(ctx)
        event = await mscal.create_event(
            token,
            summary=kw["summary"],
            start=start,
            end=end,
            timezone=ctx.user_timezone,
            description=kw.get("description"),
            location=kw.get("location"),
            attendees=kw.get("attendees"),
            online_meeting=bool(kw.get("add_teams_meeting")),
        )
        return ToolResult(
            ok=True,
            data=event,
            summary=f"Created Outlook event '{kw['summary']}' at {humanize(start, ctx.user_timezone)}",
        )


class ListOutlookEvents(Tool):
    name = "list_outlook_events"
    description = "List upcoming Outlook calendar events (defaults to the next 7 days)."
    requires = IntegrationProvider.outlook_calendar
    parameters = {
        "type": "object",
        "properties": {
            "time_min": {"type": "string"},
            "time_max": {"type": "string"},
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
        events = await mscal.list_events(
            token, time_min=tmin, time_max=tmax, max_results=int(kw.get("max_results", 25))
        )
        return ToolResult(ok=True, data={"events": events})


class RescheduleOutlookEvent(Tool):
    name = "reschedule_outlook_event"
    description = "Move an Outlook event to a new time. Requires the event id."
    requires = IntegrationProvider.outlook_calendar
    parameters = {
        "type": "object",
        "properties": {
            "event_id": {"type": "string"},
            "start": {"type": "string"},
            "end": {"type": "string"},
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
            "start": {"dateTime": start.replace(tzinfo=None).isoformat(), "timeZone": ctx.user_timezone},
            "end": {"dateTime": end.replace(tzinfo=None).isoformat(), "timeZone": ctx.user_timezone},
        }
        await mscal.update_event(token, kw["event_id"], patch)
        return ToolResult(
            ok=True,
            data={"event_id": kw["event_id"], "start": start.isoformat()},
            summary=f"Rescheduled Outlook event to {humanize(start, ctx.user_timezone)}",
        )


class CancelOutlookEvent(Tool):
    name = "cancel_outlook_event"
    description = "Cancel/delete an Outlook event by id. Destructive."
    requires = IntegrationProvider.outlook_calendar
    destructive = True
    parameters = {
        "type": "object",
        "properties": {
            "event_id": {"type": "string"},
            "summary": {"type": "string"},
            "confirmed": {"type": "boolean"},
        },
        "required": ["event_id"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        if ctx.agent.confirm_before_send and not kw.get("confirmed"):
            return ToolResult(
                ok=True,
                data={"action": "cancel_outlook_event", "summary": kw.get("summary", kw["event_id"])},
                requires_confirmation=True,
            )
        token = await _token(ctx)
        await mscal.delete_event(token, kw["event_id"])
        return ToolResult(
            ok=True,
            data={"cancelled": kw["event_id"]},
            summary=f"Cancelled Outlook event {kw.get('summary', kw['event_id'])}",
        )


registry.register(CreateOutlookEvent())
registry.register(ListOutlookEvents())
registry.register(RescheduleOutlookEvent())
registry.register(CancelOutlookEvent())
