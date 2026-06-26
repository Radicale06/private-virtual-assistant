"""Prompt assembly  turn stored history into the curated context for one LLM call.

Layered memory (cache-friendly: stable content first, volatile last):
  1. SYSTEM PROMPT       agent persona + rules            (frozen)
  2. LONG-TERM MEMORY    durable facts about the user     (stable-ish)
  3. ROLLING SUMMARY     compressed older conversation
  4. RECENT MESSAGES     last N raw turns + current msg   (volatile)

History (every message) lives in Postgres forever; only this window is sent to the LLM.
"""
from __future__ import annotations

from prisma import Prisma
from prisma.models import Agent, AgentMemory

from app.config import settings
from app.constants import MessageRole
from app.llm.base import LLMMessage


def _render_system_prompt(agent: Agent, user_timezone: str) -> str:
    work = ""
    if agent.work_start and agent.work_end:
        work = (
            f"\n- Working hours: {agent.work_start}–{agent.work_end} ({user_timezone})."
        )
    confirm = (
        "Always echo back and ask for a YES confirmation before sending an email or any "
        "outbound/destructive action."
        if agent.confirm_before_send
        else "You may take actions directly, but confirm anything ambiguous."
    )
    return (
        f"You are {agent.name}, a personal assistant operating over WhatsApp. "
        f"Your tone is {agent.tone}. You help the user manage their calendar, reminders, "
        f"email, and meetings by taking real actions through your tools.\n"
        f"Rules:\n"
        f"- The user's timezone is {user_timezone}. Interpret all times in it.{work}\n"
        f"- Prefer taking action over asking questions when the request is clear.\n"
        f"- {confirm}\n"
        f"- Keep replies short and natural  this is a chat, not an email.\n"
        f"- When you set a reminder or create an event, confirm what you did in one line.\n"
        f"- Use save_memory to remember durable preferences the user states."
    )


def _render_memory(memories: list[AgentMemory]) -> str | None:
    if not memories:
        return None
    lines = "\n".join(f"- {m.key}: {m.value}" for m in memories)
    return f"What you know about the user:\n{lines}"


async def assemble_context(
    db: Prisma,
    agent: Agent,
    user_timezone: str,
    *,
    incoming_text: str,
) -> list[LLMMessage]:
    """Build the message list for the agent loop for one inbound message."""
    messages: list[LLMMessage] = [
        LLMMessage(role="system", content=_render_system_prompt(agent, user_timezone))
    ]

    # current time so the model can resolve relative phrasing ("in 3 hours")
    from app.utils.timeparse import now_in

    messages.append(
        LLMMessage(
            role="system",
            content=(
                f"Current time: {now_in(user_timezone).strftime('%A %Y-%m-%d %H:%M %Z')}. "
                "When calling tools, pass absolute ISO-8601 datetimes."
            ),
        )
    )

    # 2. long-term memory
    memories = await db.agentmemory.find_many(where={"agent_id": agent.id})
    mem_block = _render_memory(memories)
    if mem_block:
        messages.append(LLMMessage(role="system", content=mem_block))

    # 3. rolling summary
    state = await db.conversationstate.find_unique(where={"agent_id": agent.id})
    if state and state.summary_text:
        messages.append(
            LLMMessage(role="system", content=f"Earlier conversation summary:\n{state.summary_text}")
        )

    # 4. recent raw messages (newest first → reverse to chronological)
    recent = await db.message.find_many(
        where={"agent_id": agent.id, "role": {"in": [MessageRole.user, MessageRole.assistant]}},
        order={"created_at": "desc"},
        take=settings.context_recent_messages,
    )
    for m in reversed(recent):
        if not m.content:
            continue
        role = "assistant" if m.role == MessageRole.assistant else "user"
        messages.append(LLMMessage(role=role, content=m.content))

    messages.append(LLMMessage(role="user", content=incoming_text))
    return messages
