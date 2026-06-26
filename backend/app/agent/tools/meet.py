"""Meeting-link tools  create a video meeting link (Zoom). Google Meet links are
created via the calendar tool's add_meet_link flag.
"""
from __future__ import annotations

from datetime import timedelta

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry
from app.constants import IntegrationProvider
from app.integrations import zoom
from app.integrations.tokens import get_fresh_access_token
from app.utils.timeparse import humanize, now_in, parse_dt


class CreateZoomMeeting(Tool):
    name = "create_zoom_meeting"
    description = "Create a Zoom meeting and return the join link."
    requires = IntegrationProvider.zoom
    parameters = {
        "type": "object",
        "properties": {
            "topic": {"type": "string"},
            "start": {"type": "string", "description": "ISO-8601 start (optional, default now)"},
            "duration_minutes": {"type": "integer"},
        },
        "required": ["topic"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        start = parse_dt(kw["start"], ctx.user_timezone) if kw.get("start") else now_in(
            ctx.user_timezone
        ) + timedelta(minutes=5)
        token = await get_fresh_access_token(
            ctx.db, ctx.agent.id, IntegrationProvider.zoom, zoom.refresh_access_token
        )
        meeting = await zoom.create_meeting(
            token,
            topic=kw["topic"],
            start=start,
            duration_minutes=int(kw.get("duration_minutes", 30)),
            timezone=ctx.user_timezone,
        )
        return ToolResult(
            ok=True,
            data=meeting,
            summary=f"Created Zoom meeting '{kw['topic']}' at {humanize(start, ctx.user_timezone)}",
        )


registry.register(CreateZoomMeeting())
