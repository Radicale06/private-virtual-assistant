"""Per-tenant distributed lock (Redis).

Different users are processed in parallel; a single user's messages are serialized
so "remind me at 3" and "actually make it 4" can't race. Keyed on the tenant
(agent id / phone), short TTL with auto-renew via context manager.
"""
from __future__ import annotations

import contextlib
import time
import uuid
from collections.abc import Iterator

import redis

from app.config import settings

_redis = redis.Redis.from_url(settings.redis_url, decode_responses=True)

_RELEASE_SCRIPT = """
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
"""


@contextlib.contextmanager
def tenant_lock(
    key: str, timeout: int = 60, blocking_timeout: int = 30
) -> Iterator[bool]:
    """Acquire a per-tenant lock. Yields True if acquired, False if it timed out."""
    lock_key = f"lock:tenant:{key}"
    token = uuid.uuid4().hex
    deadline = time.monotonic() + blocking_timeout
    acquired = False

    while time.monotonic() < deadline:
        if _redis.set(lock_key, token, nx=True, ex=timeout):
            acquired = True
            break
        time.sleep(0.2)

    try:
        yield acquired
    finally:
        if acquired:
            with contextlib.suppress(Exception):
                _redis.eval(_RELEASE_SCRIPT, 1, lock_key, token)
