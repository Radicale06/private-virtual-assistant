"""Twilio WhatsApp webhook — inbound messages (enqueue, fast 200).

Twilio POSTs form-encoded inbound messages and signs them with X-Twilio-Signature.
We optionally validate that signature, then hand the parsed form to Celery and return
an empty 200 (Twilio retries on non-2xx). Idempotency is enforced downstream on the
Twilio MessageSid (stored as wa_message_id).
"""
from __future__ import annotations

import base64
import hashlib
import hmac

from fastapi import APIRouter, Request, Response

from app.config import settings
from app.logging_config import get_logger
from app.tasks.inbound import process_webhook

router = APIRouter(prefix="/api/webhook", tags=["webhook"])
log = get_logger(__name__)


def _valid_twilio_signature(url: str, params: dict[str, str], signature: str) -> bool:
    """Validate X-Twilio-Signature: base64(HMAC-SHA1(url + sorted k+v, auth_token))."""
    if not signature or not settings.twilio_auth_token:
        return False
    payload = url + "".join(f"{k}{params[k]}" for k in sorted(params))
    digest = hmac.new(
        settings.twilio_auth_token.encode(), payload.encode("utf-8"), hashlib.sha1
    ).digest()
    expected = base64.b64encode(digest).decode()
    return hmac.compare_digest(expected, signature)


@router.get("")
async def health() -> dict:
    # Twilio uses POST only; this is a simple liveness check.
    return {"status": "ok", "provider": "twilio"}


@router.post("")
async def receive(request: Request) -> Response:
    form = dict((await request.form()))

    if settings.twilio_validate_signature:
        # Twilio signs the exact public URL it called; APP_BASE_URL must match it.
        url = f"{settings.app_base_url.rstrip('/')}/api/webhook"
        sig = request.headers.get("X-Twilio-Signature", "")
        if not _valid_twilio_signature(url, {k: str(v) for k, v in form.items()}, sig):
            log.warning("twilio_signature_invalid")
            return Response(status_code=403)

    try:
        process_webhook.delay(form)
    except Exception as exc:  # broker hiccup shouldn't trigger a Twilio retry storm
        log.error("enqueue_failed", error=str(exc))

    return Response(status_code=200)
