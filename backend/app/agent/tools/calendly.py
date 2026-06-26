"""Calendly tools  share the user's scheduling link, list upcoming bookings."""
from __future__ import annotations

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry
from app.constants import IntegrationProvider
from app.integrations import calendly
from app.integrations.tokens import get_fresh_access_token


async def _token(ctx: ToolContext) -> str:
    return await get_fresh_access_token(
        ctx.db, ctx.agent.id, IntegrationProvider.calendly, calendly.refresh_access_token
    )


class GetSchedulingLink(Tool):
    name = "get_scheduling_link"
    description = "Get the user's Calendly scheduling link to share with someone."
    requires = IntegrationProvider.calendly
    parameters = {"type": "object", "properties": {}}

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        token = await _token(ctx)
        link = await calendly.get_scheduling_link(token)
        return ToolResult(ok=True, data={"scheduling_url": link})


class ListBookings(Tool):
    name = "list_calendly_bookings"
    description = "List the user's upcoming Calendly-scheduled events."
    requires = IntegrationProvider.calendly
    parameters = {
        "type": "object",
        "properties": {"count": {"type": "integer"}},
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        token = await _token(ctx)
        events = await calendly.list_scheduled_events(token, count=int(kw.get("count", 10)))
        return ToolResult(ok=True, data={"bookings": events})


registry.register(GetSchedulingLink())
registry.register(ListBookings())
