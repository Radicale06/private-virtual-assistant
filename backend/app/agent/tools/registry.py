"""Tool base class + per-agent tool collection.

A Tool is one capability the model can call (create_event, set_reminder, …). Tools
are gated by which integrations the agent has connected  a user without Gmail simply
never sees `send_email`. Some tools are destructive/outbound and require confirmation.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

from prisma import Prisma
from prisma.models import Agent

from app.llm.base import ToolSpec


@dataclass
class ToolContext:
    """Everything a tool needs to act, strictly scoped to one tenant."""

    db: Prisma
    agent: Agent
    user_timezone: str
    connected: set[str] = field(default_factory=set)  # IntegrationProvider values


@dataclass
class ToolResult:
    ok: bool
    data: dict[str, Any] | str
    requires_confirmation: bool = False  # agent must get user YES before committing
    summary: str | None = None           # one-line activity-feed entry


class Tool(ABC):
    name: str
    description: str
    parameters: dict[str, Any]   # JSON schema for inputs
    requires: str | None = None  # IntegrationProvider value required; None = always on
    destructive: bool = False    # outbound/destructive → echo-confirm first

    def available_for(self, connected: set[str]) -> bool:
        return self.requires is None or self.requires in connected

    def spec(self) -> ToolSpec:
        return ToolSpec(name=self.name, description=self.description, parameters=self.parameters)

    @abstractmethod
    async def run(self, ctx: ToolContext, **kwargs: Any) -> ToolResult:
        ...


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> Tool:
        self._tools[tool.name] = tool
        return tool

    def get(self, name: str) -> Tool | None:
        return self._tools.get(name)

    def specs_for(self, connected: set[str]) -> list[ToolSpec]:
        return [t.spec() for t in self._tools.values() if t.available_for(connected)]

    def available(self, connected: set[str]) -> list[Tool]:
        return [t for t in self._tools.values() if t.available_for(connected)]


registry = ToolRegistry()


def build_registry() -> ToolRegistry:
    """Import + register all tool modules. Idempotent."""
    from app.agent.tools import (  # noqa: F401
        calendar,
        calendly,
        email,
        meet,
        memory,
        outlook_calendar,
        outlook_mail,
        reminders,
        teams,
    )

    return registry
