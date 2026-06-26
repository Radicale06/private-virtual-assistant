"""OpenAI implementation of the LLMClient interface (function calling + Whisper)."""
from __future__ import annotations

import json

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings
from app.llm.base import (
    LLMMessage,
    LLMResponse,
    Tier,
    ToolCall,
    ToolSpec,
)

try:
    import tiktoken

    _ENCODER = tiktoken.get_encoding("o200k_base")
except Exception:  # pragma: no cover
    _ENCODER = None


class OpenAIClient:
    def __init__(self) -> None:
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._tier_models = {
            Tier.router: settings.llm_router_model,
            Tier.main: settings.llm_main_model,
            Tier.reasoning: settings.llm_reasoning_model,
        }

    # ------------------------------------------------------------------ helpers
    @staticmethod
    def _to_openai_messages(messages: list[LLMMessage]) -> list[dict]:
        out: list[dict] = []
        for m in messages:
            if m.role == "assistant" and m.tool_calls:
                out.append(
                    {
                        "role": "assistant",
                        "content": m.content or "",
                        "tool_calls": [
                            {
                                "id": tc.id,
                                "type": "function",
                                "function": {
                                    "name": tc.name,
                                    "arguments": json.dumps(tc.arguments),
                                },
                            }
                            for tc in m.tool_calls
                        ],
                    }
                )
            elif m.role == "tool":
                out.append(
                    {
                        "role": "tool",
                        "tool_call_id": m.tool_call_id,
                        "content": m.content or "",
                    }
                )
            else:
                out.append({"role": m.role, "content": m.content or ""})
        return out

    @staticmethod
    def _to_openai_tools(tools: list[ToolSpec]) -> list[dict]:
        return [
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.parameters,
                },
            }
            for t in tools
        ]

    # ------------------------------------------------------------------ API
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def complete(
        self,
        messages: list[LLMMessage],
        *,
        tier: Tier = Tier.main,
        tools: list[ToolSpec] | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> LLMResponse:
        model = self._tier_models[tier]
        kwargs: dict = {"model": model, "messages": self._to_openai_messages(messages)}
        if tools:
            kwargs["tools"] = self._to_openai_tools(tools)
            kwargs["tool_choice"] = "auto"
        if temperature is not None:
            kwargs["temperature"] = temperature
        if max_tokens is not None:
            kwargs["max_completion_tokens"] = max_tokens

        resp = await self._client.chat.completions.create(**kwargs)
        choice = resp.choices[0]
        msg = choice.message

        tool_calls: list[ToolCall] = []
        for tc in msg.tool_calls or []:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            tool_calls.append(ToolCall(id=tc.id, name=tc.function.name, arguments=args))

        usage = resp.usage
        return LLMResponse(
            content=msg.content,
            tool_calls=tool_calls,
            finish_reason=choice.finish_reason,
            input_tokens=getattr(usage, "prompt_tokens", 0) if usage else 0,
            output_tokens=getattr(usage, "completion_tokens", 0) if usage else 0,
            model=model,
        )

    async def transcribe(self, audio_bytes: bytes, *, filename: str = "audio.ogg") -> str:
        resp = await self._client.audio.transcriptions.create(
            model=settings.whisper_model,
            file=(filename, audio_bytes),
        )
        return resp.text

    def count_tokens(self, text: str) -> int:
        if not text:
            return 0
        if _ENCODER is not None:
            return len(_ENCODER.encode(text))
        return max(1, len(text) // 4)  # rough fallback
