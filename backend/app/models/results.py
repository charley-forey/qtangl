from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class TaskAssignment:
    task: str
    start_day: int
    end_day: int
    resource: str | None = None


@dataclass(slots=True)
class DiversityMetrics:
    distinct_feasible_plans: int
    diversity_score: float


@dataclass(slots=True)
class SolverRunResult:
    feasible: bool
    method: str
    solver: str
    backend: str
    summary: str
    assignments: list[TaskAssignment] = field(default_factory=list)
    solution: list[dict[str, Any]] = field(default_factory=list)
    metrics: dict[str, Any] = field(default_factory=dict)
    visualization: dict[str, Any] = field(default_factory=dict)
    score: int | float = 0
    diagnostics: dict[str, Any] = field(default_factory=dict)
