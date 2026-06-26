"""Compaction  fold older history into a rolling summary to bound the context.

Runs after a turn when the working window grows past a token threshold. Uses the
cheap router-tier model. Raw messages stay in Postgres; we only summarize what's
sent to the LLM going forward.
"""
from __future__ import annotations

from prisma import Prisma

from app.config import settings
from app.constants import MessageRole
from app.llm.base import LLMMessage, Tier
from app.llm.factory import get_llm_client


async def maybe_compact(db: Prisma, agent_id: str, llm=None) -> None:
    llm = llm or get_llm_client()

    state = await db.conversationstate.find_unique(where={"agent_id": agent_id})
    if state is None:
        state = await db.conversationstate.create(data={"agent_id": agent_id})

    where: dict = {
        "agent_id": agent_id,
        "role": {"in": [MessageRole.user, MessageRole.assistant]},
    }
    if state.summarized_through_message_at is not None:
        where["created_at"] = {"gt": state.summarized_through_message_at}

    rows = await db.message.find_many(where=where, order={"created_at": "asc"})
    if len(rows) <= settings.context_recent_messages:
        return  # working window still small enough

    to_fold = rows[: -settings.context_recent_messages]
    transcript = "\n".join(
        f"{'User' if m.role == MessageRole.user else 'Assistant'}: {m.content}"
        for m in to_fold
        if m.content
    )
    if llm.count_tokens(transcript) < settings.context_compaction_threshold_tokens:
        return

    prior = state.summary_text or ""
    prompt = (
        "You maintain a running summary of a WhatsApp conversation between a user and their "
        "personal assistant. Update the summary to include the new messages. Keep it concise, "
        "factual, and focused on commitments, preferences, and unresolved items.\n\n"
        f"Existing summary:\n{prior or '(none)'}\n\n"
        f"New messages:\n{transcript}\n\n"
        "Return only the updated summary."
    )
    resp = await llm.complete(
        [LLMMessage(role="user", content=prompt)], tier=Tier.router, max_tokens=500
    )
    await db.conversationstate.update(
        where={"agent_id": agent_id},
        data={
            "summary_text": (resp.content or prior).strip(),
            "summarized_through_message_at": to_fold[-1].created_at,
        },
    )
