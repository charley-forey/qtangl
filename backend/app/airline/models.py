from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

ConstraintKind = Literal["hard", "soft"]
SolverSource = Literal["classical", "hybrid", "fixture", "reserve", "manual"]
AssignmentSource = Literal["internal", "reserve", "deadhead"]
ClassicalSearchScope = Literal["global", "local"]


@dataclass(slots=True)
class PairingAssignment:
    leg_id: str
    flight_no: str
    origin: str
    dest: str
    sched_dep: str
    sched_arr: str
    required_quals: list[str] = field(default_factory=list)
    kind: str = "scheduled"
    crew_id: str | None = None


@dataclass(slots=True)
class CrewMember:
    id: str
    name: str
    role: str
    base: str
    qualifications: list[str]
    qualified_fleets: list[str]
    seniority_date: str
    hourly_rate: float
    block_hours_week: int
    max_fdp_hours: int
    cba_group: str
    duty_start: str
    last_duty_end: str
    assignments: list[PairingAssignment] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class FlightLeg:
    id: str
    flight_no: str
    origin: str
    dest: str
    sched_dep: str
    sched_arr: str
    block_minutes: int
    fleet_type: str
    tail_id: str
    required_quals: list[str]
    pax: int
    connection_pax: int
    priority: str
    min_crew: int


@dataclass(slots=True)
class Aircraft:
    id: str
    fleet_type: str
    seats: int
    current_station: str
    status: str
    available_from: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class Far117Rule:
    id: str
    label: str
    description: str
    kind: ConstraintKind


@dataclass(slots=True)
class Far117Profile:
    source: str
    rules: list[Far117Rule]
    cost_ladder: dict[str, float]


@dataclass(slots=True)
class DisruptionEvent:
    id: str
    aircraft_id: str
    station: str
    start: str
    mx_hold_hours: float
    affected_leg_ids: list[str]
    crew_affected: int
    urgency_minutes: int
    channel: str
    reason: str
    required_quals: list[str]


@dataclass(slots=True)
class ManualBaseline:
    decision_minutes: int
    recovery_cost: float
    summary: str


@dataclass(slots=True)
class ScenarioCount:
    bitstring: str
    weight: int


@dataclass(slots=True)
class ScenarioDefinition:
    id: str
    title: str
    summary: str
    disruption: DisruptionEvent
    manual_baseline: ManualBaseline
    preferred_candidates: list[str]
    counts: list[ScenarioCount]
    classical_search_scope: ClassicalSearchScope = "global"


@dataclass(slots=True)
class OpenLeg:
    leg_id: str
    flight_no: str
    origin: str
    dest: str
    sched_dep: str
    sched_arr: str
    required_quals: list[str]
    tail_id: str


@dataclass(slots=True)
class TailAssignment:
    leg_id: str
    tail_id: str
    fleet_type: str


@dataclass(slots=True)
class RoutingResult:
    tail_assignments: list[TailAssignment]
    open_legs: list[OpenLeg]
    wall_time_seconds: float
    diagnostics: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class CandidateScore:
    objective: float
    premium_pay_cost: float
    reserve_cost: float
    fatigue_score: float
    fairness_delta: float
    seniority_score: float
    off_base_penalty: float
    duty_overage_hours: float
    on_time_probability: float


@dataclass(slots=True)
class LegAssignment:
    leg_id: str
    crew_id: str
    crew_name: str
    role: str
    home_base: str
    source: AssignmentSource
    explanation: list[str] = field(default_factory=list)


@dataclass(slots=True)
class RecoveryPlan:
    id: str
    label: str
    assignments: list[LegAssignment]
    score: CandidateScore
    source: SolverSource
    distinctness: float
    seniority_preserved: bool
    far117_compliant: bool
    summary: str
    explanation: list[str] = field(default_factory=list)
    quantum_weight: float | None = None
    bitstring: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class RepairWindow:
    crew_ids: list[str]
    base_ids: list[str]
    leg_ids: list[str]
    reasons: list[str]
    edge_count: int


@dataclass(slots=True)
class ScoreboardColumn:
    label: str
    solve_wall_time_seconds: float
    objective: float
    distinct_plans: int
    audit_pack_available: bool
    summary: str
    on_time_probability: float | None = None
    recovery_cost: float | None = None
    far117_compliant: bool = True
    hybrid_beats_classical_objective: bool = False
    hybrid_beats_classical_fairness: bool = False
    diversity_score: float = 0.0


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
class QpuTraceDistributionItem:
    bitstring: str
    count: int
    decoded_plan_id: str


@dataclass(slots=True)
class QpuTrace:
    backend: dict[str, Any]
    run: dict[str, Any]
    distribution: list[QpuTraceDistributionItem]
    summary: str


@dataclass(slots=True)
class AuditPack:
    candidate_id: str
    qubo_snapshot: dict[str, Any]
    binding_constraints: list[dict[str, Any]]
    cost_breakdown: dict[str, Any]
    qpu_trace: dict[str, Any]
    reproducibility: dict[str, Any]


@dataclass(slots=True)
class AirlineDataset:
    crew: list[CrewMember]
    flights: list[FlightLeg]
    aircraft: list[Aircraft]
    far117: Far117Profile
    scenarios: list[ScenarioDefinition]
    qpu_trace: QpuTrace
    penalty_weights: dict[str, Any]


@dataclass(slots=True)
class SolveBundle:
    scenario: ScenarioDefinition
    routing: RoutingResult
    repair_window: RepairWindow
    classical_plan: RecoveryPlan
    hybrid_plans: list[RecoveryPlan]
    scoreboard: Scoreboard
    audit_packs: list[AuditPack]
    timeline: list[TimelineEvent]
    details: dict[str, Any] = field(default_factory=dict)
