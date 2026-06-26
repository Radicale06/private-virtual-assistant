"""Parse an inbound Twilio WhatsApp webhook (form-encoded) into a normalized event.

Twilio posts application/x-www-form-urlencoded fields, one message per request:
  From=whatsapp:+1555..., To=whatsapp:+1555..., Body=..., MessageSid=SM...,
  NumMedia=0|N, MediaUrl0=..., MediaContentType0=audio/ogg, ProfileName=..., WaId=...
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class InboundMessage:
    wa_message_id: str
    from_phone: str
    type: str                 # text | audio | other
    text: str | None = None
    media_url: str | None = None
    media_content_type: str | None = None
    profile_name: str | None = None


def parse_inbound(form: dict) -> list[InboundMessage]:
    """Build a one-element list (Twilio sends a single message per webhook call).

    Returns [] for delivery-status callbacks (which carry MessageStatus and no From/Body).
    """
    from_field = form.get("From")
    if not from_field:
        return []  # status callback or malformed

    sid = form.get("MessageSid") or form.get("SmsMessageSid") or ""
    profile = form.get("ProfileName")
    body = form.get("Body") or None

    try:
        num_media = int(form.get("NumMedia", "0"))
    except (TypeError, ValueError):
        num_media = 0

    if num_media > 0:
        media_url = form.get("MediaUrl0")
        ctype = form.get("MediaContentType0", "")
        mtype = "audio" if ctype.startswith("audio") else "other"
        return [
            InboundMessage(
                wa_message_id=sid,
                from_phone=from_field,
                type=mtype,
                text=body,  # WhatsApp voice notes have no caption, but keep any text
                media_url=media_url,
                media_content_type=ctype,
                profile_name=profile,
            )
        ]

    return [
        InboundMessage(
            wa_message_id=sid,
            from_phone=from_field,
            type="text",
            text=body,
            profile_name=profile,
        )
    ]
