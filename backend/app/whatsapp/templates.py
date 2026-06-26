"""Twilio Content templates for proactive (outside-24h-window) messages.

With Twilio, approved templates are referenced by a Content SID (HX...). Create them
in the Twilio Console (Content Template Builder), submit for WhatsApp approval, then
put the SIDs in the env (TWILIO_CONTENT_REMINDER / TWILIO_CONTENT_BRIEFING).

If a SID isn't configured, callers fall back to free-form text (which only delivers
inside the 24h window).
"""
from __future__ import annotations

from app.config import settings


def reminder_sid() -> str:
    return settings.twilio_content_reminder


def briefing_sid() -> str:
    return settings.twilio_content_briefing


def body_vars(text: str) -> dict:
    """Single positional variable {{1}} for a one-line template body."""
    return {"1": text}
