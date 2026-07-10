"""Customer dashboard stats — real counts for the Home KPIs (this calendar month).

Agent actions are logged as role=tool messages with payload {"tool","summary"}
(see services/message_service.log_actions), so AI-actions and event counts come
straight from the messages table — no separate counters to keep in sync.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.constants import MessageRole
from app.core.deps import CurrentUser, Db
from app.services.agent_service import get_or_create_agent

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Tool names (app/agent/tools) that create a calendar event or meeting.
_EVENT_TOOLS = {
    "create_event",
    "create_outlook_event",
    "create_teams_meeting",
    "create_zoom_meeting",
}


@router.get("")
async def dashboard(user: CurrentUser, db: Db) -> dict:
    agent = await get_or_create_agent(db, user.id)
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    messages_this_month = await db.message.count(
        where={"agent_id": agent.id, "created_at": {"gte": month_start}}
    )

    action_rows = await db.message.find_many(
        where={
            "agent_id": agent.id,
            "role": MessageRole.tool,
            "created_at": {"gte": month_start},
        }
    )
    ai_actions = len(action_rows)
    events_created = sum(
        1
        for m in action_rows
        if isinstance(m.payload, dict) and m.payload.get("tool") in _EVENT_TOOLS
    )

    last = await db.message.find_first(
        where={"agent_id": agent.id}, order={"created_at": "desc"}
    )

    return {
        "messages_this_month": messages_this_month,
        "ai_actions": ai_actions,
        "events_created": events_created,
        "last_active_at": last.created_at.isoformat() if last else None,
    }
