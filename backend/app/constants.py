"""String constants mirroring the Prisma schema enums.

Prisma's generated enums live in `prisma.enums` (only after `prisma generate`).
We use these plain string values in application code so modules import cleanly
regardless of generation state. Values are identical to the schema enum members.
"""
from __future__ import annotations


class UserRole:
    user = "user"        # the customer who owns one assistant
    admin = "admin"      # the platform operator (monitoring / back office)


class UserStatus:
    active = "active"
    suspended = "suspended"


class PlanTier:
    free = "free"
    pro = "pro"
    team = "team"


class AgentStatus:
    draft = "draft"
    active = "active"
    error = "error"


class IntegrationProvider:
    google_calendar = "google_calendar"
    gmail = "gmail"
    calendly = "calendly"
    zoom = "zoom"
    google_meet = "google_meet"
    # Microsoft 365 (one Microsoft Graph consent grants calendar + mail + Teams)
    outlook_calendar = "outlook_calendar"
    outlook_mail = "outlook_mail"
    microsoft_teams = "microsoft_teams"


class IntegrationStatus:
    connected = "connected"
    disconnected = "disconnected"
    error = "error"


class MessageDirection:
    inbound = "inbound"
    outbound = "outbound"


class MessageRole:
    user = "user"
    assistant = "assistant"
    tool = "tool"
    system = "system"


class MessageType:
    text = "text"
    voice = "voice"
    action = "action"
    template = "template"


class JobType:
    reminder = "reminder"
    briefing = "briefing"


class JobStatus:
    pending = "pending"
    sent = "sent"
    failed = "failed"
    cancelled = "cancelled"
