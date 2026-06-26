"""Timezone-aware datetime helpers.

The model is given the current time in the user's timezone (see agent.context) and
is instructed to pass absolute ISO-8601 datetimes to tools. These helpers normalize
those strings into aware datetimes for the integration clients.
"""
from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from dateutil import parser as dateparser


def user_zone(tz_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(tz_name)
    except Exception:
        return ZoneInfo("UTC")


def now_in(tz_name: str) -> datetime:
    return datetime.now(user_zone(tz_name))


def parse_dt(value: str, tz_name: str) -> datetime:
    """Parse an ISO-8601 (or loose) datetime string into an aware datetime.

    Naive inputs are interpreted in the user's timezone.
    """
    dt = dateparser.parse(value)
    if dt is None:
        raise ValueError(f"Could not parse datetime: {value!r}")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=user_zone(tz_name))
    return dt


def to_utc(dt: datetime) -> datetime:
    return dt.astimezone(ZoneInfo("UTC"))


def humanize(dt: datetime, tz_name: str) -> str:
    local = dt.astimezone(user_zone(tz_name))
    return local.strftime("%a %d %b, %H:%M")
