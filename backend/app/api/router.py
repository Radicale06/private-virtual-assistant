"""Aggregate all route modules into one APIRouter."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import (
    activity,
    admin,
    agents,
    auth,
    billing,
    integrations,
    memory,
    reminders,
    webhook,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(agents.router)
api_router.include_router(integrations.router)
api_router.include_router(reminders.router)
api_router.include_router(activity.router)
api_router.include_router(memory.router)
api_router.include_router(billing.router)
api_router.include_router(webhook.router)
api_router.include_router(admin.router)
