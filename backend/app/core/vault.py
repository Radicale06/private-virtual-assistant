"""Token-blob helpers  encrypt/decrypt the OAuth token bundle stored on an
AgentIntegration row. Prisma models are plain data objects, so encryption lives
here rather than on a model property.
"""
from __future__ import annotations

from typing import Any

from app.core.encryption import decrypt_json, encrypt_json


def read_tokens(token_blob: str | None) -> dict[str, Any]:
    return decrypt_json(token_blob) if token_blob else {}


def write_tokens(tokens: dict[str, Any]) -> str | None:
    return encrypt_json(tokens) if tokens else None
