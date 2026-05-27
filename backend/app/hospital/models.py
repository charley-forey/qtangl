from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal


ConstraintKind = Literal["hard", "soft"]
SolverSource = Literal["classical", "hybrid", "fixture", "agency", "manual"]


@dataclass(slots=True)
class ShiftAssignment:
    shift_id: str
    ward: str
    shift_name: str
    start: str
    end: str
    required_certifications: list[str] = field(default_factory=list)
    kind: str = "scheduled"
    nurse_id: str | None = None


@dataclass(slots=True)
class Nurse:
    id: str
    name: str
    home_ward: str
    certifications: list[str]
    cross_trained_wards: list[str]
    seniority_date: str
    base_hourly_rate: float
    weekly_hours: int
    max_hours_week: int
    cba_group: str
    role: str
    last_shift_end: str
    assignments: list[ShiftAssignment] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class ShiftRequirement:
    id: str
    day_index: int
    shift_name: str
    ward: str
    start: str
    end: str
    duration_hours: int
    priority: str
    required_certifications: list[str]
    min_staff: int


@dataclass(slots=True)
class CbaRule:
    id: str
    label: str
    description: str
    kind: ConstraintKind


@dataclass(slots=True)
class CbaProfile:
    source: str
    rules: list[CbaRule]
    cost_ladder: dict[str, float]


@dataclass(slots=True)
class CallOutEvent:
    id: str
    nurse_id: str
    nurse_name: str
    ward: str
    shift_id: str
    start: str
    end: str
    urgency_minutes: int
    required_certifications: list[str]
    channel: str
    reason: str


@dataclass(slots=True)
class ManualBaseline:
    decision_minutes: int
    agency_cost: float
    summary: str


@dataclass(slots=True)
class ScenarioCount:
    bitstring: str
    weight: int


ClassicalSearchScope = Literal["global", "local"]


@dataclass(slots=True)
class ScenarioDefinition:
    id: str
    title: str
    summary: str
    callout: CallOutEvent
    manual_baseline: ManualBaseline
    preferred_candidates: list[str]
    counts: list[ScenarioCount]
    classical_search_scope: ClassicalSearchScope = "global"


@dataclass(slots=True)
class QpuTraceDistributionItem:
    bitstring: str
    count: int
    decoded_candidate_id: str


@dataclass(slots=True)
class QpuTrace:
    backend: dict[str, Any]
    run: dict[str, Any]
    distribution: list[QpuTraceDistributionItem]
    summary: str


@dataclass(slots=True)
class RepairWindow:
    nurse_ids: list[str]
    ward_ids: list[str]
    reasons: list[str]
    edge_count: int


@dataclass(slots=True)
class CandidateScore:
    objective: float
    overtime_cost: float
    agency_cost: float
    fatigue_score: float
    fairness_delta: float
    seniority_score: float
    cross_ward_penalty: float
    overtime_hours: float


@dataclass(slots=True)
class SwapCandidate:
    id: str
    label: str
    nurse_id: str
    nurse_name: str
    home_ward: str
    target_ward: str
    shift_id: str
    start: str
    end: str
    score: CandidateScore
    source: SolverSource
    explanation: list[str]
    summary: str
    distinctness: float
    seniority_preserved: bool
    requires_backfill: bool
    quantum_weight: float | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class ScoreboardColumn:
    label: str
    solve_wall_time_seconds: float
    objective: float
    distinct_plans: int
    audit_pack_available: bool
    summary: str
    fairness_delta: float | None = None
    agency_cost: float | None = None
    hybrid_beats_classical_objective: bool = False
    hybrid_beats_classical_fairness: bool = False


@dataclass(slots=True)
class Scoreboard:
    manual: ScoreboardColumn
    classical: ScoreboardColumn
    hybrid: ScoreboardColumn


@dataclass(slots=True)
class TimelineEvent:
    key: str
    label: str
    duration_ms: int
    status: Literal["done", "replayed", "skipped"]


@dataclass(slots=True)
class AuditPack:
    candidate_id: str
    qubo_snapshot: dict[str, Any]
    binding_constraints: list[dict[str, Any]]
    cost_breakdown: dict[str, Any]
    qpu_trace: dict[str, Any]
    reproducibility: dict[str, Any]


@dataclass(slots=True)
class HospitalDataset:
    roster: list[Nurse]
    shifts: list[ShiftRequirement]
    cba: CbaProfile
    scenarios: list[ScenarioDefinition]
    qpu_trace: QpuTrace
    penalty_weights: dict[str, Any]


@dataclass(slots=True)
class SolveBundle:
    scenario: ScenarioDefinition
    repair_window: RepairWindow
    classical_candidate: SwapCandidate
    hybrid_candidates: list[SwapCandidate]
    scoreboard: Scoreboard
    audit_packs: list[AuditPack]
    timeline: list[TimelineEvent]
    details: dict[str, Any] = field(default_factory=dict)
