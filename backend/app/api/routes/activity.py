"""Activity feed  recent messages and actions the assistant took."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, Db
from app.schemas.schemas import ActivityOut
from app.services.agent_service import get_or_create_agent

router = APIRouter(prefix="/api/activity", tags=["activity"])


@router.get("", response_model=list[ActivityOut])
async def activity(
    user: CurrentUser, db: Db, limit: int = Query(50, le=200)
) -> list[ActivityOut]:
    agent = await get_or_create_agent(db, user.id)
    rows = await db.message.find_many(
        where={"agent_id": agent.id}, order={"created_at": "desc"}, take=limit
    )
    return [
        ActivityOut(
            id=m.id,
            direction=m.direction,
            role=m.role,
            type=m.type,
            content=m.content,
            payload=m.payload,
            created_at=m.created_at,
        )
        for m in rows
    ]
