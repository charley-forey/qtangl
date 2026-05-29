from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timedelta
from math import ceil
from statistics import mean

from app.ev_fleet.models import (
    CandidateScore,
    ChargeSlot,
    Charger,
    DeliveryStop,
    ScenarioDefinition,
    TouPeriodName,
    TouTariff,
    Vehicle,
)

TIME_FORMAT = "%Y-%m-%dT%H:%M:%S"
SLOT_MINUTES = 30


def parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


def distance_km(
    matrix: dict[str, dict[str, float]], origin: str, dest: str, fallback: float = 8.0
) -> float:
    if origin == dest:
        return 0.0
    if origin in matrix and dest in matrix[origin]:
        return float(matrix[origin][dest])
    if dest in matrix and origin in matrix[dest]:
        return float(matrix[dest][origin])
    return fallback


def energy_for_route_km(km: float, efficiency: float) -> float:
    return round(km * efficiency, 3)


def charge_minutes(kwh: float, charger_kw: float, vehicle_max_kw: float) -> int:
    effective_kw = max(0.1, min(charger_kw, vehicle_max_kw))
    return max(1, int(ceil((kwh / effective_kw) * 60)))


def period_for_time(tariff: TouTariff, when: datetime) -> TouPeriodName:
    clock = when.strftime("%H:%M")
    for period in tariff.periods:
        if period.start <= clock < period.end or (
            period.start > period.end and (clock >= period.start or clock < period.end)
        ):
            return period.name
    return "offpeak"


def price_for_period(tariff: TouTariff, period: TouPeriodName) -> float:
    for item in tariff.periods:
        if item.name == period:
            return item.price_per_kwh
    return tariff.periods[-1].price_per_kwh if tariff.periods else 0.15


def vehicle_is_eligible(
    vehicle: Vehicle,
    charger: Charger,
    slot_start: str,
    slot_end: str,
    *,
    kwh_needed: float,
) -> tuple[bool, list[str]]:
    reasons: list[str] = []
    if vehicle.connector_type != charger.connector_type:
        reasons.append("connector mismatch")
    if charger.status != "available":
        reasons.append("charger unavailable")
    if vehicle.status not in {"available", "returning"}:
        reasons.append("vehicle not available for charging")
    if parse_dt(slot_end) > parse_dt(vehicle.dispatch_deadline):
        reasons.append("charge would finish after dispatch deadline")
    if kwh_needed <= 0:
        reasons.append("no energy required")
    return not reasons, reasons


def vehicle_average_soc(vehicles: list[Vehicle]) -> float:
    return mean(vehicle.start_soc_kwh for vehicle in vehicles) if vehicles else 0.0


def score_assignment(
    vehicle: Vehicle,
    charger: Charger,
    *,
    slot_start: str,
    slot_end: str,
    kwh_delivered: float,
    tariff: TouTariff,
    soft_weights: dict[str, float],
    vehicle_average_soc: float,
    scenario: ScenarioDefinition | None = None,
) -> CandidateScore:
    period = period_for_time(tariff, parse_dt(slot_start))
    energy_cost = round(kwh_delivered * price_for_period(tariff, period), 2)
    effective_kw = min(charger.power_kw, vehicle.max_charge_kw)
    peak_kw = effective_kw if period == "peak" else effective_kw * 0.35
    demand_charge_cost = round(tariff.demand_charge_per_kw * peak_kw * 0.02, 2)
    readiness_slack = (
        parse_dt(vehicle.dispatch_deadline) - parse_dt(slot_end)
    ).total_seconds() / 60
    on_time = 0.72 if readiness_slack < 30 else min(0.98, 0.75 + readiness_slack / 400)
    fairness_delta = abs(vehicle.start_soc_kwh - vehicle_average_soc) / max(
        vehicle_average_soc, 1.0
    )
    offpeak_fraction = 1.0 if period != "peak" else 0.0
    objective = (
        energy_cost
        + demand_charge_cost
        + soft_weights.get("fairnessDelta", 0.5) * fairness_delta * 10
        + soft_weights.get("peakPenalty", 1.0) * (1 - offpeak_fraction) * 5
    )
    if scenario and vehicle.id in scenario.preferred_candidates:
        objective *= 0.94

    return CandidateScore(
        objective=round(objective, 4),
        energy_cost=energy_cost,
        demand_charge_cost=demand_charge_cost,
        total_cost=round(energy_cost + demand_charge_cost, 2),
        peak_kw=round(peak_kw, 2),
        offpeak_kwh_fraction=offpeak_fraction,
        on_time_probability=round(on_time, 3),
        fairness_delta=round(fairness_delta, 4),
        readiness_slack_minutes=round(readiness_slack, 1),
    )


def aggregate_plan_score(scores: list[CandidateScore], *, peak_kw_override: float | None = None) -> CandidateScore:
    if not scores:
        return CandidateScore(
            objective=9999.0,
            energy_cost=0.0,
            demand_charge_cost=0.0,
            total_cost=0.0,
            peak_kw=0.0,
            offpeak_kwh_fraction=0.0,
            on_time_probability=0.0,
            fairness_delta=0.0,
            readiness_slack_minutes=0.0,
        )
    peak_kw = peak_kw_override if peak_kw_override is not None else max(s.peak_kw for s in scores)
    return CandidateScore(
        objective=round(sum(s.objective for s in scores), 4),
        energy_cost=round(sum(s.energy_cost for s in scores), 2),
        demand_charge_cost=round(sum(s.demand_charge_cost for s in scores), 2),
        total_cost=round(sum(s.total_cost for s in scores), 2),
        peak_kw=round(peak_kw, 2),
        offpeak_kwh_fraction=round(sum(s.offpeak_kwh_fraction for s in scores) / len(scores), 3),
        on_time_probability=round(sum(s.on_time_probability for s in scores) / len(scores), 3),
        fairness_delta=round(sum(s.fairness_delta for s in scores) / len(scores), 4),
        readiness_slack_minutes=round(min(s.readiness_slack_minutes for s in scores), 1),
    )


def compute_peak_kw(slots: list[ChargeSlot], chargers_by_id: dict[str, Charger], vehicles_by_id: dict[str, Vehicle]) -> float:
    if not slots:
        return 0.0
    events: list[tuple[datetime, float]] = []
    for slot in slots:
        charger = chargers_by_id[slot.charger_id]
        vehicle = vehicles_by_id[slot.vehicle_id]
        kw = min(charger.power_kw, vehicle.max_charge_kw)
        events.append((parse_dt(slot.start), kw))
        events.append((parse_dt(slot.end), -kw))
    events.sort(key=lambda item: item[0])
    current = 0.0
    peak = 0.0
    for _, delta in events:
        current += delta
        peak = max(peak, current)
    return round(peak, 2)


def build_evening_slots(
    peak_start: str,
    peak_end: str,
    *,
    slot_count: int = 8,
) -> list[tuple[str, str, str]]:
    """Return (slot_id, start, end) tuples covering evening charging."""
    start = parse_dt(peak_start) - timedelta(hours=1)
    slots: list[tuple[str, str, str]] = []
    for index in range(slot_count):
        slot_start = start + timedelta(minutes=SLOT_MINUTES * index)
        slot_end = slot_start + timedelta(minutes=SLOT_MINUTES)
        slots.append(
            (
                f"slot-{index:02d}",
                slot_start.strftime(TIME_FORMAT),
                slot_end.strftime(TIME_FORMAT),
            )
        )
    return slots


def assignment_explanation(
    vehicle: Vehicle, charger: Charger, slot: ChargeSlot, score: CandidateScore
) -> list[str]:
    return [
        f"{vehicle.name} on {charger.name} ({charger.power_kw:.1f} kW) "
        f"{slot.start[11:16]}–{slot.end[11:16]} — {slot.kwh_delivered:.1f} kWh @ {slot.period}.",
        f"Energy ${score.energy_cost:.2f}; readiness slack {score.readiness_slack_minutes:.0f} min.",
    ]


def score_as_dict(score: CandidateScore) -> dict[str, float]:
    return asdict(score)
