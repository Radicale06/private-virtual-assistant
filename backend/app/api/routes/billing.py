"""Billing  Stripe checkout + webhook + plan/usage summary.

Usage caps matter: WhatsApp conversation fees + LLM cost are per-message, so the free
tier must be bounded. This exposes plan + a simple monthly message count.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import stripe
from fastapi import APIRouter, HTTPException, Request

from app.config import settings
from app.constants import MessageDirection, PlanTier
from app.core.deps import CurrentUser, Db
from app.logging_config import get_logger
from app.services.agent_service import get_or_create_agent

router = APIRouter(prefix="/api/billing", tags=["billing"])
log = get_logger(__name__)

stripe.api_key = settings.stripe_secret_key

PLAN_LIMITS = {PlanTier.free: 100, PlanTier.pro: 5000, PlanTier.team: 25000}


@router.get("")
async def billing_summary(user: CurrentUser, db: Db) -> dict:
    agent = await get_or_create_agent(db, user.id)
    since = datetime.now(timezone.utc) - timedelta(days=30)
    used = await db.message.count(
        where={
            "agent_id": agent.id,
            "direction": MessageDirection.outbound,
            "created_at": {"gte": since},
        }
    )
    limit = PLAN_LIMITS.get(user.plan, 100)
    return {"plan": user.plan, "messages_used": used, "limit": limit}


@router.post("/checkout")
async def create_checkout(user: CurrentUser) -> dict:
    if not settings.stripe_secret_key or not settings.stripe_price_pro:
        raise HTTPException(status_code=400, detail="Billing not configured")
    session = stripe.checkout.Session.create(
        mode="subscription",
        customer_email=user.email,
        line_items=[{"price": settings.stripe_price_pro, "quantity": 1}],
        success_url=f"{settings.frontend_base_url}/app/billing?status=success",
        cancel_url=f"{settings.frontend_base_url}/app/billing?status=cancel",
        metadata={"user_id": user.id},
    )
    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Db) -> dict:
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig, settings.stripe_webhook_secret
        )
    except Exception as exc:
        log.warning("stripe_webhook_invalid", error=str(exc))
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = (session.get("metadata") or {}).get("user_id")
        if user_id:
            await db.user.update(
                where={"id": user_id},
                data={
                    "plan": PlanTier.pro,
                    "stripe_customer_id": session.get("customer"),
                },
            )
    elif event["type"] == "customer.subscription.deleted":
        customer = event["data"]["object"].get("customer")
        u = await db.user.find_first(where={"stripe_customer_id": customer})
        if u:
            await db.user.update(where={"id": u.id}, data={"plan": PlanTier.free})

    return {"status": "ok"}
