from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal


ProblemType = Literal["schedule", "routing", "allocation"]


@dataclass(slots=True)
class CanonicalTask:
    id: str
    duration: int
    resource: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class CanonicalConstraint:
    kind: Literal["precedence", "resource_unavailable", "generic"]
    text: str
    subject: str | None = None
    target: str | None = None
    day: int | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class CanonicalProblem:
    type: ProblemType
    tasks: list[CanonicalTask] = field(default_factory=list)
    constraints: list[CanonicalConstraint] = field(default_factory=list)
    raw: dict[str, Any] = field(default_factory=dict)
