"""The agent runtime  the LLM tool-calling loop.

assemble context → ask the model → if it requests tools, execute the ones available
for connected integrations → feed results back → loop until a final text reply or the
iteration cap. Destructive tools surface a confirmation instead of committing.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field

from prisma import Prisma
from prisma.models import Agent

from app.agent.context import assemble_context
from app.agent.tools.registry import ToolContext, build_registry
from app.config import settings
from app.constants import IntegrationProvider, IntegrationStatus
from app.llm.base import LLMMessage, Tier
from app.llm.factory import get_llm_client
from app.logging_config import get_logger

log = get_logger(__name__)


@dataclass
class AgentTurn:
    reply_text: str
    actions: list[dict] = field(default_factory=list)
    input_tokens: int = 0
    output_tokens: int = 0


async def _connected_providers(db: Prisma, agent: Agent) -> set[str]:
    rows = await db.agentintegration.find_many(
        where={"agent_id": agent.id, "status": IntegrationStatus.connected}
    )
    providers = {r.provider for r in rows}
    if IntegrationProvider.google_calendar in providers:
        providers.add(IntegrationProvider.google_meet)  # Meet rides on Calendar creds
    if IntegrationProvider.outlook_calendar in providers:
        providers.add(IntegrationProvider.microsoft_teams)  # Teams rides on Outlook creds
    return providers


async def run_turn(
    db: Prisma,
    agent: Agent,
    user_timezone: str,
    incoming_text: str,
) -> AgentTurn:
    llm = get_llm_client()
    registry = build_registry()
    connected = await _connected_providers(db, agent)

    tool_ctx = ToolContext(db=db, agent=agent, user_timezone=user_timezone, connected=connected)
    specs = registry.specs_for(connected)

    messages: list[LLMMessage] = await assemble_context(
        db, agent, user_timezone, incoming_text=incoming_text
    )

    actions: list[dict] = []
    in_tokens = out_tokens = 0

    for _ in range(settings.agent_max_tool_iterations):
        resp = await llm.complete(messages, tier=Tier.main, tools=specs or None)
        in_tokens += resp.input_tokens
        out_tokens += resp.output_tokens

        if not resp.wants_tools:
            return AgentTurn(
                reply_text=(resp.content or "").strip() or "Done.",
                actions=actions,
                input_tokens=in_tokens,
                output_tokens=out_tokens,
            )

        messages.append(
            LLMMessage(role="assistant", content=resp.content, tool_calls=resp.tool_calls)
        )

        for call in resp.tool_calls:
            tool = registry.get(call.name)
            if tool is None or not tool.available_for(connected):
                result_text = json.dumps({"error": f"tool '{call.name}' not available"})
            else:
                try:
                    result = await tool.run(tool_ctx, **call.arguments)
                    if result.requires_confirmation:
                        result_text = json.dumps(
                            {
                                "status": "needs_confirmation",
                                "preview": result.data,
                                "instruction": "Ask the user to confirm before proceeding.",
                            },
                            default=str,
                        )
                    else:
                        result_text = (
                            result.data
                            if isinstance(result.data, str)
                            else json.dumps(result.data, default=str)
                        )
                        if result.ok and result.summary:
                            actions.append({"tool": call.name, "summary": result.summary})
                except Exception as exc:
                    log.warning("tool_failed", tool=call.name, error=str(exc))
                    result_text = json.dumps({"error": str(exc)})

            messages.append(
                LLMMessage(
                    role="tool", tool_call_id=call.id, name=call.name, content=result_text
                )
            )

    return AgentTurn(
        reply_text="I'm having trouble completing that  could you rephrase?",
        actions=actions,
        input_tokens=in_tokens,
        output_tokens=out_tokens,
    )
