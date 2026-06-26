"""Build the active LLM client from settings.

To switch to Claude later: implement `app/llm/claude_client.py` (the same interface),
add a branch here, and set LLM_PROVIDER=anthropic. Nothing in the agent changes.
"""
from __future__ import annotations

from functools import lru_cache

from app.config import settings
from app.llm.base import LLMClient


@lru_cache
def get_llm_client() -> LLMClient:
    provider = settings.llm_provider.lower()
    if provider == "openai":
        from app.llm.openai_client import OpenAIClient

        return OpenAIClient()
    # elif provider == "anthropic":
    #     from app.llm.claude_client import ClaudeClient
    #     return ClaudeClient()
    raise ValueError(f"Unsupported LLM_PROVIDER: {settings.llm_provider}")
