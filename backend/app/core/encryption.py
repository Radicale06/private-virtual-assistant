"""Token vault  symmetric encryption for OAuth tokens stored at rest.

All third-party access tokens/refresh tokens are encrypted before they touch the
database. One shared WhatsApp number means every tenant's Google/Calendly/Zoom
credentials live in one DB; this keeps them ciphertext at rest.
"""
from __future__ import annotations

import json
from typing import Any

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings


def _build_cipher() -> Fernet:
    key = settings.encryption_key
    if not key:
        if settings.is_production:
            raise RuntimeError("ENCRYPTION_KEY must be set in production")
        # Dev fallback: deterministic key derived from the secret so local runs work.
        import base64
        import hashlib

        digest = hashlib.sha256(settings.app_secret_key.encode()).digest()
        key = base64.urlsafe_b64encode(digest).decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


_cipher = _build_cipher()


def encrypt_str(plaintext: str) -> str:
    return _cipher.encrypt(plaintext.encode()).decode()


def decrypt_str(ciphertext: str) -> str:
    try:
        return _cipher.decrypt(ciphertext.encode()).decode()
    except InvalidToken as exc:  # pragma: no cover
        raise ValueError("Failed to decrypt vault payload") from exc


def encrypt_json(payload: dict[str, Any]) -> str:
    """Encrypt a token bundle (access_token, refresh_token, expiry, scopes…)."""
    return encrypt_str(json.dumps(payload, separators=(",", ":")))


def decrypt_json(ciphertext: str) -> dict[str, Any]:
    return json.loads(decrypt_str(ciphertext))
