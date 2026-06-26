"""Memory / preferences  what the assistant remembers about the user."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.deps import CurrentUser, Db
from app.schemas.schemas import MemoryCreate, MemoryOut
from app.services.agent_service import get_or_create_agent

router = APIRouter(prefix="/api/memory", tags=["memory"])


@router.get("", response_model=list[MemoryOut])
async def list_memory(user: CurrentUser, db: Db) -> list[MemoryOut]:
    agent = await get_or_create_agent(db, user.id)
    rows = await db.agentmemory.find_many(
        where={"agent_id": agent.id}, order={"updated_at": "desc"}
    )
    return [MemoryOut(id=m.id, key=m.key, value=m.value, source=m.source) for m in rows]


@router.post("", response_model=MemoryOut, status_code=201)
async def add_memory(body: MemoryCreate, user: CurrentUser, db: Db) -> MemoryOut:
    agent = await get_or_create_agent(db, user.id)
    row = await db.agentmemory.upsert(
        where={"agent_id_key": {"agent_id": agent.id, "key": body.key}},
        data={
            "create": {
                "agent_id": agent.id,
                "key": body.key,
                "value": body.value,
                "source": "user",
            },
            "update": {"value": body.value, "source": "user"},
        },
    )
    return MemoryOut(id=row.id, key=row.key, value=row.value, source=row.source)


@router.delete("/{memory_id}")
async def delete_memory(memory_id: str, user: CurrentUser, db: Db) -> dict:
    agent = await get_or_create_agent(db, user.id)
    row = await db.agentmemory.find_unique(where={"id": memory_id})
    if row is None or row.agent_id != agent.id:
        raise HTTPException(status_code=404, detail="Not found")
    await db.agentmemory.delete(where={"id": memory_id})
    return {"deleted": memory_id}
