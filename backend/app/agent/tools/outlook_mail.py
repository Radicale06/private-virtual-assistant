"""Outlook Mail tools (Microsoft Graph): summarize recent mail and send mail.

send_outlook_email is outbound/destructive: with confirm_before_send on, the first
call returns a confirmation preview; the model relays it and re-calls confirmed=true.
"""
from __future__ import annotations

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry
from app.constants import IntegrationProvider
from app.integrations.microsoft import mail as msmail
from app.integrations.microsoft.oauth import refresh_access_token
from app.integrations.tokens import get_fresh_access_token


async def _token(ctx: ToolContext) -> str:
    return await get_fresh_access_token(
        ctx.db, ctx.agent.id, IntegrationProvider.outlook_mail, refresh_access_token
    )


class SummarizeOutlookEmails(Tool):
    name = "summarize_outlook_emails"
    description = "Fetch the user's most recent Outlook emails so you can summarize them."
    requires = IntegrationProvider.outlook_mail
    parameters = {
        "type": "object",
        "properties": {
            "max_results": {"type": "integer", "description": "How many recent emails (default 8)"},
            "query": {"type": "string", "description": "Optional search query"},
        },
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        token = await _token(ctx)
        emails = await msmail.list_recent(
            token, max_results=int(kw.get("max_results", 8)), query=kw.get("query", "")
        )
        return ToolResult(ok=True, data={"emails": emails})


class SendOutlookEmail(Tool):
    name = "send_outlook_email"
    description = "Send an email from the user's Outlook account. Outbound — confirm first."
    requires = IntegrationProvider.outlook_mail
    destructive = True
    parameters = {
        "type": "object",
        "properties": {
            "to": {"type": "string"},
            "subject": {"type": "string"},
            "body": {"type": "string"},
            "confirmed": {"type": "boolean"},
        },
        "required": ["to", "subject", "body"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        if ctx.agent.confirm_before_send and not kw.get("confirmed"):
            return ToolResult(
                ok=True,
                data={
                    "action": "send_outlook_email",
                    "to": kw["to"],
                    "subject": kw["subject"],
                    "body": kw["body"],
                },
                requires_confirmation=True,
            )
        token = await _token(ctx)
        await msmail.send_email(token, to=kw["to"], subject=kw["subject"], body=kw["body"])
        return ToolResult(
            ok=True,
            data={"sent": True},
            summary=f"Sent Outlook email to {kw['to']} — {kw['subject']}",
        )


registry.register(SummarizeOutlookEmails())
registry.register(SendOutlookEmail())
