"""Pydantic request/response schemas for the HTTP API."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

_HHMM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


# ---------------------------------------------------------------- auth
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None
    timezone: str = "UTC"
    assistant_name: str = "Assistant"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str]
    role: str
    status: str
    plan: str
    timezone: str


# ---------------------------------------------------------------- agent
class AgentOut(BaseModel):
    id: str
    name: str
    tone: str
    status: str
    confirm_before_send: bool
    morning_briefing_enabled: bool
    morning_briefing_time: Optional[str]  # "HH:MM"
    work_start: Optional[str]
    work_end: Optional[str]


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    tone: Optional[str] = None
    confirm_before_send: Optional[bool] = None
    morning_briefing_enabled: Optional[bool] = None
    morning_briefing_time: Optional[str] = None  # "HH:MM"
    work_start: Optional[str] = None
    work_end: Optional[str] = None

    @field_validator("morning_briefing_time", "work_start", "work_end")
    @classmethod
    def _valid_hhmm(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not _HHMM.match(v):
            raise ValueError("must be HH:MM (24h)")
        return v


class LinkOut(BaseModel):
    token: str
    wa_link: str
    expires_at: str


class LinkStatusOut(BaseModel):
    linked: bool
    phone_number: Optional[str] = None


# ---------------------------------------------------------------- integrations
class IntegrationOut(BaseModel):
    provider: str
    status: str
    account_email: Optional[str]
    last_error: Optional[str]


class ConnectUrlOut(BaseModel):
    authorization_url: str


# ---------------------------------------------------------------- reminders
class ReminderOut(BaseModel):
    id: str
    title: Optional[str]
    run_at: datetime
    status: str


# ---------------------------------------------------------------- memory
class MemoryOut(BaseModel):
    id: str
    key: str
    value: str
    source: str


class MemoryCreate(BaseModel):
    key: str
    value: str


# ---------------------------------------------------------------- activity
class ActivityOut(BaseModel):
    id: str
    direction: str
    role: str
    type: str
    content: Optional[str]
    payload: Optional[dict[str, Any]]
    created_at: datetime


# ---------------------------------------------------------------- admin
class AdminOverview(BaseModel):
    total_users: int
    active_agents: int
    messages_today: int
    pending_jobs: int
    integrations_errored: int


class AdminUserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str]
    role: str
    status: str
    plan: str
    created_at: datetime
