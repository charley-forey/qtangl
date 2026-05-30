from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

ConstraintKind = Literal["hard", "soft"]
SolverSource = Literal["classical", "hybrid", "fixture", "naive", "manual"]
ClassicalSearchScope = Literal["global", "local"]
TouPeriodName = Literal["peak", "shoulder", "offpeak"]
ConnectorType = Literal["CCS", "J1772"]


@dataclass(slots=True)
class RouteStopVisit:
    stop_id: str
    arrival: str
    depart: str
    soc_after_kwh: float


@dataclass(slots=True)
class RouteAssignment:
    vehicle_id: str
    stop_ids: list[str]
    visits: list[RouteStopVisit]
    total_km: float
    energy_needed_kwh: float
    return_soc_kwh: float
    depot_return_time: str


@dataclass(slots=True)
class RoutingResult:
    assignments: list[RouteAssignment]
    unserved_stop_ids: list[str]
    wall_time_seconds: float
    diagnostics: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class Vehicle:
    id: str
    name: str
    battery_kwh: float
    usable_kwh: float
    efficiency_kwh_per_km: float
    start_soc_kwh: float
    connector_type: ConnectorType
    max_charge_kw: float
    depot: str
    status: str
    dispatch_deadline: str
    assignments: list[RouteStopVisit] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class DeliveryStop:
    id: str
    label: str
    zone: str
    demand_parcels: int
    service_minutes: int
    window_start: str
    window_end: str
    priority: str
    lat: float
    lon: float


@dataclass(slots=True)
class Charger:
    id: str
    name: str
    level: str
    power_kw: float
    connector_type: ConnectorType
    status: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class TouPeriod:
    name: TouPeriodName
    start: str
    end: str
    price_per_kwh: float


@dataclass(slots=True)
class TouTariff:
    id: str
    source: str
    periods: list[TouPeriod]
    demand_charge_per_kw: float
    site_power_cap_kw: float


@dataclass(slots=True)
class Depot:
    id: str
    name: str
    timezone: str
    charger_ids: list[str]
    site_power_cap_kw: float


@dataclass(slots=True)
class ChargingWindowEvent:
    id: str
    plan_date: str
    tariff_id: str
    depot_id: str
    fleet_size: int
    charger_count: int
    peak_window_start: str
    peak_window_end: str
    urgency_minutes: int
    channel: str
    reason: str


@dataclass(slots=True)
class ManualBaseline:
    decision_minutes: int
    naive_daily_cost: float
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
    window: ChargingWindowEvent
    manual_baseline: ManualBaseline
    preferred_candidates: list[str]
    counts: list[ScenarioCount]
    classical_search_scope: ClassicalSearchScope = "global"
    dropped_vehicle_id: str | None = None


@dataclass(slots=True)
class ChargeSlot:
    vehicle_id: str
    charger_id: str
    start: str
    end: str
    kwh_delivered: float
    period: TouPeriodName
    cost: float


@dataclass(slots=True)
class CandidateScore:
    objective: float
    energy_cost: float
    demand_charge_cost: float
    total_cost: float
    peak_kw: float
    offpeak_kwh_fraction: float
    on_time_probability: float
    fairness_delta: float
    readiness_slack_minutes: float


@dataclass(slots=True)
class ChargePlan:
    id: str
    label: str
    slots: list[ChargeSlot]
    score: CandidateScore
    source: SolverSource
    distinctness: float
    all_ready_by_deadline: bool
    summary: str
    explanation: list[str] = field(default_factory=list)
    quantum_weight: float | None = None
    bitstring: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class RepairWindow:
    vehicle_ids: list[str]
    charger_ids: list[str]
    peak_slot_ids: list[str]
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
    daily_cost: float | None = None
    peak_kw: float | None = None
    on_time_probability: float | None = None
    hybrid_beats_classical_objective: bool = False
    hybrid_beats_classical_cost: bool = False
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
class EvFleetDataset:
    vehicles: list[Vehicle]
    stops: list[DeliveryStop]
    chargers: list[Charger]
    depot: Depot
    tariff: TouTariff
    scenarios: list[ScenarioDefinition]
    qpu_trace: QpuTrace
    penalty_weights: dict[str, Any]
    distance_matrix: dict[str, dict[str, float]]


@dataclass(slots=True)
class SolveBundle:
    scenario: ScenarioDefinition
    routing: RoutingResult
    repair_window: RepairWindow
    classical_plan: ChargePlan
    hybrid_plans: list[ChargePlan]
    scoreboard: Scoreboard
    audit_packs: list[AuditPack]
    timeline: list[TimelineEvent]
    details: dict[str, Any] = field(default_factory=dict)
