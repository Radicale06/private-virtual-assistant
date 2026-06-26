"""Reminders  list and cancel the user's scheduled reminders."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.constants import JobStatus, JobType
from app.core.deps import CurrentUser, Db
from app.schemas.schemas import ReminderOut
from app.services.agent_service import get_or_create_agent

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.get("", response_model=list[ReminderOut])
async def list_reminders(
    user: CurrentUser,
    db: Db,
    status: str = Query("pending", pattern="^(pending|sent|cancelled|all)$"),
) -> list[ReminderOut]:
    agent = await get_or_create_agent(db, user.id)
    where: dict = {"agent_id": agent.id, "type": JobType.reminder}
    if status != "all":
        where["status"] = status
    jobs = await db.job.find_many(where=where, order={"run_at": "asc"}, take=100)
    return [
        ReminderOut(id=j.id, title=j.title, run_at=j.run_at, status=j.status) for j in jobs
    ]


@router.delete("/{reminder_id}")
async def cancel_reminder(reminder_id: str, user: CurrentUser, db: Db) -> dict:
    agent = await get_or_create_agent(db, user.id)
    job = await db.job.find_unique(where={"id": reminder_id})
    if job and job.agent_id == agent.id:
        await db.job.update(where={"id": reminder_id}, data={"status": JobStatus.cancelled})
    return {"cancelled": reminder_id}
