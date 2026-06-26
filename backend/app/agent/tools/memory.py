"""Memory tools  durable facts about the user (context layer 2).

The agent calls save_memory when the user states a lasting preference
("never schedule before 10am", "Sara = sara@co.com"). Always available.
"""
from __future__ import annotations

from app.agent.tools.registry import Tool, ToolContext, ToolResult, registry


class SaveMemory(Tool):
    name = "save_memory"
    description = (
        "Remember a durable fact or preference about the user for future conversations. "
        "Use a short stable key and a concise value."
    )
    requires = None
    parameters = {
        "type": "object",
        "properties": {
            "key": {"type": "string", "description": "Short identifier, e.g. 'no_morning_meetings'"},
            "value": {"type": "string", "description": "The fact/preference text"},
        },
        "required": ["key", "value"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        await ctx.db.agentmemory.upsert(
            where={"agent_id_key": {"agent_id": ctx.agent.id, "key": kw["key"]}},
            data={
                "create": {
                    "agent_id": ctx.agent.id,
                    "key": kw["key"],
                    "value": kw["value"],
                    "source": "agent",
                },
                "update": {"value": kw["value"]},
            },
        )
        return ToolResult(ok=True, data={"saved": kw["key"]}, summary=f"Remembered: {kw['value']}")


class ForgetMemory(Tool):
    name = "forget_memory"
    description = "Forget a previously saved preference by its key."
    requires = None
    parameters = {
        "type": "object",
        "properties": {"key": {"type": "string"}},
        "required": ["key"],
    }

    async def run(self, ctx: ToolContext, **kw) -> ToolResult:
        existing = await ctx.db.agentmemory.find_unique(
            where={"agent_id_key": {"agent_id": ctx.agent.id, "key": kw["key"]}}
        )
        if existing:
            await ctx.db.agentmemory.delete(where={"id": existing.id})
        return ToolResult(ok=True, data={"forgot": kw["key"]}, summary=f"Forgot: {kw['key']}")


registry.register(SaveMemory())
registry.register(ForgetMemory())
