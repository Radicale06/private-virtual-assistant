"""Admin / Platform Console  operator monitoring across all tenants.

Privacy stance: aggregate/metadata views by default. Raw private message bodies are
not exposed in the cross-tenant feeds  only counts, status, and the agent owner.
Every mutating action is written to the audit log.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.constants import (
    AgentStatus,
    IntegrationStatus,
    JobStatus,
    PlanTier,
    UserStatus,
)
from app.core.deps import Admin, Db
from app.schemas.schemas import AdminOverview, AdminUserOut
from app.services.audit_service import record

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Monthly plan prices (USD). Keep in sync with the Stripe prices you sell.
PLAN_PRICES = {PlanTier.free: 0, PlanTier.pro: 15, PlanTier.team: 49}


@router.get("/overview", response_model=AdminOverview)
async def overview(admin: Admin, db: Db) -> AdminOverview:
    start_of_day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    total_users = await db.user.count()
    active_agents = await db.agent.count(where={"status": AgentStatus.active})
    messages_today = await db.message.count(where={"created_at": {"gte": start_of_day}})
    pending_jobs = await db.job.count(where={"status": JobStatus.pending})
    integrations_errored = await db.agentintegration.count(
        where={"status": IntegrationStatus.error}
    )
    return AdminOverview(
        total_users=total_users,
        active_agents=active_agents,
        messages_today=messages_today,
        pending_jobs=pending_jobs,
        integrations_errored=integrations_errored,
    )


@router.get("/users", response_model=list[AdminUserOut])
async def list_users(
    admin: Admin, db: Db, q: str | None = None, limit: int = Query(50, le=200)
) -> list[AdminUserOut]:
    where = {}
    if q:
        where = {"email": {"contains": q, "mode": "insensitive"}}
    users = await db.user.find_many(where=where, order={"created_at": "desc"}, take=limit)
    return [
        AdminUserOut(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            status=u.status,
            plan=u.plan,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.get("/users/{user_id}")
async def user_detail(user_id: str, admin: Admin, db: Db) -> dict:
    user = await db.user.find_unique(where={"id": user_id})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    agent = await db.agent.find_unique(where={"user_id": user_id})
    integrations = (
        await db.agentintegration.find_many(where={"agent_id": agent.id}) if agent else []
    )
    msg_count = await db.message.count(where={"agent_id": agent.id}) if agent else 0
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "status": user.status,
            "plan": user.plan,
            "timezone": user.timezone,
        },
        "agent": None
        if agent is None
        else {"id": agent.id, "name": agent.name, "status": agent.status},
        "integrations": [
            {"provider": i.provider, "status": i.status, "last_error": i.last_error}
            for i in integrations
        ],
        "message_count": msg_count,
    }


@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: str, admin: Admin, db: Db) -> dict:
    await db.user.update(where={"id": user_id}, data={"status": UserStatus.suspended})
    await record(
        db, actor_id=admin.id, action="suspend_user", target_type="user", target_id=user_id
    )
    return {"status": "suspended"}


@router.post("/users/{user_id}/activate")
async def activate_user(user_id: str, admin: Admin, db: Db) -> dict:
    await db.user.update(where={"id": user_id}, data={"status": UserStatus.active})
    await record(
        db, actor_id=admin.id, action="activate_user", target_type="user", target_id=user_id
    )
    return {"status": "active"}


@router.get("/agents")
async def list_agents(admin: Admin, db: Db, limit: int = Query(50, le=200)) -> list[dict]:
    agents = await db.agent.find_many(
        order={"updated_at": "desc"}, take=limit, include={"integrations": True, "user": True}
    )
    out = []
    for a in agents:
        out.append(
            {
                "id": a.id,
                "name": a.name,
                "status": a.status,
                "owner_email": a.user.email if a.user else None,
                "integrations_connected": sum(
                    1
                    for i in (a.integrations or [])
                    if i.status == IntegrationStatus.connected
                ),
            }
        )
    return out


@router.get("/integrations/health")
async def integrations_health(admin: Admin, db: Db) -> dict:
    rows = await db.agentintegration.find_many()
    by_provider: dict[str, dict] = {}
    for r in rows:
        bucket = by_provider.setdefault(
            r.provider, {"connected": 0, "error": 0, "disconnected": 0}
        )
        bucket[r.status] = bucket.get(r.status, 0) + 1
    return by_provider


@router.get("/costs")
async def costs(admin: Admin, db: Db) -> dict:
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=30)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    recent = await db.message.find_many(
        where={"created_at": {"gte": since}, "tokens": {"not": None}}, take=10000
    )
    total_tokens = sum((m.tokens or 0) for m in recent)
    cost_micros = sum((m.cost_usd_micros or 0) for m in recent)
    cost_today_micros = sum(
        (m.cost_usd_micros or 0) for m in recent if m.created_at >= start_of_day
    )
    return {
        "window_days": 30,
        "messages": len(recent),
        "total_tokens": total_tokens,
        "cost_usd": round(cost_micros / 1_000_000, 2),
        "cost_usd_today": round(cost_today_micros / 1_000_000, 2),
    }


async def _redis_ok() -> bool:
    try:
        import redis.asyncio as aioredis

        r = aioredis.from_url(settings.redis_url)
        await r.ping()
        await r.aclose()
        return True
    except Exception:
        return False


@router.get("/system/health")
async def system_health(admin: Admin, db: Db) -> dict:
    return {
        "pending_jobs": await db.job.count(where={"status": JobStatus.pending}),
        "failed_jobs": await db.job.count(where={"status": JobStatus.failed}),
        "integrations_errored": await db.agentintegration.count(
            where={"status": IntegrationStatus.error}
        ),
        "redis_ok": await _redis_ok(),
    }


@router.get("/whatsapp")
async def whatsapp_status(admin: Admin, db: Db) -> dict:
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    return {
        "linked_numbers": await db.whatsappidentity.count(),
        "inbound_24h": await db.message.count(
            where={"direction": "inbound", "created_at": {"gte": since}}
        ),
        "outbound_24h": await db.message.count(
            where={"direction": "outbound", "created_at": {"gte": since}}
        ),
    }


@router.get("/audit")
async def audit_log(admin: Admin, db: Db, limit: int = Query(100, le=500)) -> list[dict]:
    rows = await db.auditlog.find_many(order={"created_at": "desc"}, take=limit)
    return [
        {
            "id": r.id,
            "actor_id": r.actor_id,
            "action": r.action,
            "target_type": r.target_type,
            "target_id": r.target_id,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.get("/conversations")
async def conversations(
    admin: Admin, db: Db, limit: int = Query(50, le=200)
) -> list[dict]:
    """Cross-tenant message stream — metadata only, never message bodies."""
    rows = await db.message.find_many(
        order={"created_at": "desc"},
        take=limit,
        include={"agent": {"include": {"user": True}}},
    )
    return [
        {
            "id": m.id,
            "tenant": m.agent.user.email if m.agent and m.agent.user else None,
            "direction": m.direction,
            "type": m.type,
            "role": m.role,
            "created_at": m.created_at.isoformat(),
        }
        for m in rows
    ]


@router.get("/revenue")
async def revenue(admin: Admin, db: Db) -> dict:
    counts = {
        plan: await db.user.count(where={"plan": plan}) for plan in PLAN_PRICES
    }
    total = sum(counts.values())
    mrr = sum(PLAN_PRICES[plan] * n for plan, n in counts.items())
    paying = sum(n for plan, n in counts.items() if plan != PlanTier.free)
    plan_mix = [
        {
            "plan": plan,
            "count": n,
            "pct": round(n / total * 100) if total else 0,
            "price": PLAN_PRICES[plan],
        }
        for plan, n in counts.items()
    ]
    return {
        "mrr_usd": mrr,
        "paying_users": paying,
        "total_users": total,
        "plan_mix": plan_mix,
    }


@router.get("/templates")
async def templates(admin: Admin, db: Db) -> list[dict]:
    """Twilio Content templates used for proactive sends (outside the 24h window)."""
    return [
        {
            "name": "reminder",
            "sid": settings.twilio_content_reminder or None,
            "configured": bool(settings.twilio_content_reminder),
            "purpose": "Proactive reminders outside the 24h session window",
        },
        {
            "name": "morning_briefing",
            "sid": settings.twilio_content_briefing or None,
            "configured": bool(settings.twilio_content_briefing),
            "purpose": "Daily morning briefing",
        },
    ]
