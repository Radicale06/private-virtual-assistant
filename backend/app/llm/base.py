"""Provider-agnostic LLM interface.

The agent runtime depends ONLY on these types  never on `openai` or `anthropic`
directly. Swapping providers (OpenAI ↔ Claude) is implementing this interface and
flipping `LLM_PROVIDER`. This is the single seam that keeps "I'll try Claude later"
a one-file change instead of a rewrite.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Protocol


class Tier(str, Enum):
    """Model tiers  the runtime asks for a capability level, not a model id."""

    router = "router"        # cheap intent routing / classification
    main = "main"            # the workhorse tool-calling loop
    reasoning = "reasoning"  # hard multi-step requests


@dataclass
class LLMMessage:
    role: str                                    # system | user | assistant | tool
    content: str | None = None
    tool_calls: list["ToolCall"] | None = None   # assistant turn requesting tools
    tool_call_id: str | None = None              # tool result turn
    name: str | None = None                      # tool name (for tool results)


@dataclass
class ToolSpec:
    name: str
    description: str
    parameters: dict[str, Any]  # JSON schema for the tool's input


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict[str, Any]


@dataclass
class LLMResponse:
    content: str | None
    tool_calls: list[ToolCall] = field(default_factory=list)
    finish_reason: str | None = None
    input_tokens: int = 0
    output_tokens: int = 0
    model: str | None = None

    @property
    def wants_tools(self) -> bool:
        return bool(self.tool_calls)


class LLMClient(Protocol):
    """What the agent runtime needs from any provider."""

    async def complete(
        self,
        messages: list[LLMMessage],
        *,
        tier: Tier = Tier.main,
        tools: list[ToolSpec] | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> LLMResponse:
        ...

    async def transcribe(self, audio_bytes: bytes, *, filename: str = "audio.ogg") -> str:
        """Voice note → text."""
        ...

    def count_tokens(self, text: str) -> int:
        ...
