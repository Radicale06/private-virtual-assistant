"""Download WhatsApp media (voice notes) for transcription.

With Twilio, inbound media arrives as a `MediaUrl` on the webhook; downloading it
needs Twilio Basic auth (handled in the client).
"""
from __future__ import annotations

from app.whatsapp.client import download_media

__all__ = ["download_media"]
