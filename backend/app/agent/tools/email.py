"""Email tools  summarize recent mail and send mail (Gmail).

send_email is outbound/destructive: when confirm_before_send is on, the first call
returns a confirmation preview; the model relays it to the user and only re-calls
with confirmed=true after a YES.
"""
from __future__ import annotations

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry
from app.constants import IntegrationProvider
from app.integrations.google import gmail
from app.integrations.google.oauth import refresh_access_token
from app.integrations.tokens import get_fresh_access_token


async def _token(ctx: ToolContext) -> str:
    return await get_fresh_access_token(
        ctx.db, ctx.agent.id, IntegrationProvider.gmail, refresh_access_token
    )


class SummarizeEmails(Tool):
    name = "summarize_emails"
    description = "Fetch the user's most recent emails so you can summarize them."
    requires = IntegrationProvider.gmail
    parameters = {
        "type": "object",
        "properties": {
            "max_results": {"type": "integer", "description": "How many recent emails (default 8)"},
            "query": {"type": "string", "description": "Optional Gmail search query"},
        },
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        token = await _token(ctx)
        emails = await gmail.list_recent(
            token, max_results=int(kw.get("max_results", 8)), query=kw.get("query", "")
        )
        return ToolResult(ok=True, data={"emails": emails})


class SendEmail(Tool):
    name = "send_email"
    description = "Send an email on the user's behalf. Outbound  confirm before sending."
    requires = IntegrationProvider.gmail
    destructive = True
    parameters = {
        "type": "object",
        "properties": {
            "to": {"type": "string"},
            "subject": {"type": "string"},
            "body": {"type": "string"},
            "confirmed": {"type": "boolean", "description": "Set true once the user confirms"},
        },
        "required": ["to", "subject", "body"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        if ctx.agent.confirm_before_send and not kw.get("confirmed"):
            return ToolResult(
                ok=True,
                data={
                    "action": "send_email",
                    "to": kw["to"],
                    "subject": kw["subject"],
                    "body": kw["body"],
                },
                requires_confirmation=True,
            )
        token = await _token(ctx)
        result = await gmail.send_email(
            token, to=kw["to"], subject=kw["subject"], body=kw["body"]
        )
        return ToolResult(
            ok=True,
            data={"sent": True, "id": result.get("id")},
            summary=f"Sent email to {kw['to']}  {kw['subject']}",
        )


registry.register(SummarizeEmails())
registry.register(SendEmail())
