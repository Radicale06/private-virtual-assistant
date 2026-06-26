"""Microsoft Teams meeting tool — creates a Teams online meeting as a calendar event
and returns the join link. Uses the Outlook calendar credentials (one Microsoft consent).
"""
from __future__ import annotations

from datetime import timedelta

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry
from app.constants import IntegrationProvider
from app.integrations.microsoft import calendar as mscal
from app.integrations.microsoft.oauth import refresh_access_token
from app.integrations.tokens import get_fresh_access_token
from app.utils.timeparse import humanize, now_in, parse_dt


class CreateTeamsMeeting(Tool):
    name = "create_teams_meeting"
    description = "Create a Microsoft Teams meeting and return the join link."
    requires = IntegrationProvider.microsoft_teams
    parameters = {
        "type": "object",
        "properties": {
            "topic": {"type": "string"},
            "start": {"type": "string", "description": "ISO-8601 start (optional, default soon)"},
            "duration_minutes": {"type": "integer"},
            "attendees": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["topic"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        start = (
            parse_dt(kw["start"], ctx.user_timezone)
            if kw.get("start")
            else now_in(ctx.user_timezone) + timedelta(minutes=5)
        )
        end = start + timedelta(minutes=int(kw.get("duration_minutes", 30)))
        # Teams meetings ride on the Outlook calendar credentials.
        token = await get_fresh_access_token(
            ctx.db, ctx.agent.id, IntegrationProvider.outlook_calendar, refresh_access_token
        )
        event = await mscal.create_event(
            token,
            summary=kw["topic"],
            start=start,
            end=end,
            timezone=ctx.user_timezone,
            attendees=kw.get("attendees"),
            online_meeting=True,
        )
        return ToolResult(
            ok=True,
            data={"join_url": event.get("join_url"), "topic": kw["topic"], "start": event.get("start")},
            summary=f"Created Teams meeting '{kw['topic']}' at {humanize(start, ctx.user_timezone)}",
        )


registry.register(CreateTeamsMeeting())
