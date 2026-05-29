from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter
from typing import Any

from ortools.sat.python import cp_model

from app.ev_fleet.models import (
    ChargePlan,
    ChargeSlot,
    Charger,
    EvFleetDataset,
    RouteAssignment,
    RoutingResult,
    ScenarioDefinition,
    Vehicle,
)
from app.ev_fleet.objective import (
    aggregate_plan_score,
    assignment_explanation,
    build_evening_slots,
    charge_minutes,
    compute_peak_kw,
    period_for_time,
    price_for_period,
    score_assignment,
    vehicle_average_soc,
    vehicle_is_eligible,
)
from app.ev_fleet.solver_routing import RoutingSolveResult, kwh_needed_for_vehicle


@dataclass(slots=True)
class EligibleTriple:
    vehicle: Vehicle
    charger: Charger
    slot_id: str
    slot_start: str
    slot_end: str
    kwh_needed: float
    cost: float


@dataclass(slots=True)
class ClassicalSolveResult:
    selected_plan: ChargePlan
    eligible_triples: list[EligibleTriple]
    ineligible_reasons: dict[str, list[str]]
    wall_time_seconds: float
    solver_status: str
    objective_value: float
    diagnostics: dict[str, Any]


def solve_charging_classically(
    dataset: EvFleetDataset,
    scenario: ScenarioDefinition,
    routing: RoutingResult,
    routing_bundle: RoutingSolveResult,
) -> ClassicalSolveResult:
    started = perf_counter()
    tariff = dataset.tariff
    soft_weights = dataset.penalty_weights["softWeights"]
    assignments_by_vehicle = {item.vehicle_id: item for item in routing.assignments}
    chargers = [charger for charger in dataset.chargers if charger.status == "available"]
    slots = build_evening_slots(
        scenario.window.peak_window_start,
        scenario.window.peak_window_end,
    )
    avg_soc = vehicle_average_soc(routing_bundle.active_vehicles)

    eligible: list[EligibleTriple] = []
    ineligible: dict[str, list[str]] = {}

    for vehicle in routing_bundle.active_vehicles:
        route = assignments_by_vehicle.get(vehicle.id)
        kwh_needed = kwh_needed_for_vehicle(vehicle, route)
        for charger in chargers:
            for slot_id, slot_start, slot_end in slots:
                ok, reasons = vehicle_is_eligible(
                    vehicle,
                    charger,
                    slot_start,
                    slot_end,
                    kwh_needed=kwh_needed,
                )
                key = f"{vehicle.id}:{charger.id}:{slot_id}"
                if not ok:
                    ineligible[key] = reasons
                    continue
                score = score_assignment(
                    vehicle,
                    charger,
                    slot_start=slot_start,
                    slot_end=slot_end,
                    kwh_delivered=kwh_needed,
                    tariff=tariff,
                    soft_weights=soft_weights,
                    vehicle_average_soc=avg_soc,
                    scenario=scenario,
                )
                eligible.append(
                    EligibleTriple(
                        vehicle=vehicle,
                        charger=charger,
                        slot_id=slot_id,
                        slot_start=slot_start,
                        slot_end=slot_end,
                        kwh_needed=kwh_needed,
                        cost=score.objective,
                    )
                )

    model = cp_model.CpModel()
    decision_vars: dict[tuple[str, str, str], cp_model.IntVar] = {}
    for triple in eligible:
        key = (triple.vehicle.id, triple.charger.id, triple.slot_id)
        decision_vars[key] = model.new_bool_var(f"x_{key[0]}_{key[1]}_{key[2]}")

    for vehicle in routing_bundle.active_vehicles:
        vehicle_vars = [var for (vid, _, _), var in decision_vars.items() if vid == vehicle.id]
        if vehicle_vars:
            model.add(sum(vehicle_vars) == 1)

    for charger in chargers:
        for slot_id, _, _ in slots:
            charger_vars = [
                var
                for (vid, cid, sid), var in decision_vars.items()
                if cid == charger.id and sid == slot_id
            ]
            if len(charger_vars) > 1:
                model.add(sum(charger_vars) <= 1)

    scale = 1000
    objective_terms = []
    for triple in eligible:
        key = (triple.vehicle.id, triple.charger.id, triple.slot_id)
        objective_terms.append(int(round(triple.cost * scale)) * decision_vars[key])
    model.minimize(sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 3.0
    solver.parameters.num_search_workers = 8
    status = solver.solve(model)

    charge_slots: list[ChargeSlot] = []
    leg_scores = []
    chargers_by_id = {charger.id: charger for charger in chargers}
    vehicles_by_id = {vehicle.id: vehicle for vehicle in routing_bundle.active_vehicles}

    for triple in eligible:
        key = (triple.vehicle.id, triple.charger.id, triple.slot_id)
        var = decision_vars.get(key)
        if var is None or not solver.boolean_value(var):
            continue
        minutes = charge_minutes(
            triple.kwh_needed, triple.charger.power_kw, triple.vehicle.max_charge_kw
        )
        end_time = triple.slot_start
        from app.ev_fleet.objective import parse_dt, TIME_FORMAT
        from datetime import timedelta

        end_dt = parse_dt(triple.slot_start) + timedelta(minutes=minutes)
        period = period_for_time(tariff, parse_dt(triple.slot_start))
        score = score_assignment(
            triple.vehicle,
            triple.charger,
            slot_start=triple.slot_start,
            slot_end=end_dt.strftime(TIME_FORMAT),
            kwh_delivered=triple.kwh_needed,
            tariff=tariff,
            soft_weights=soft_weights,
            vehicle_average_soc=avg_soc,
            scenario=scenario,
        )
        leg_scores.append(score)
        charge_slots.append(
            ChargeSlot(
                vehicle_id=triple.vehicle.id,
                charger_id=triple.charger.id,
                start=triple.slot_start,
                end=end_dt.strftime(TIME_FORMAT),
                kwh_delivered=round(triple.kwh_needed, 2),
                period=period,
                cost=score.total_cost,
            )
        )

    peak_kw = compute_peak_kw(charge_slots, chargers_by_id, vehicles_by_id)
    aggregate = aggregate_plan_score(leg_scores, peak_kw_override=peak_kw)
    aggregate.demand_charge_cost = round(tariff.demand_charge_per_kw * peak_kw * 0.15, 2)
    aggregate.total_cost = round(aggregate.energy_cost + aggregate.demand_charge_cost, 2)
    aggregate.objective = round(aggregate.total_cost + aggregate.fairness_delta * 5, 4)

    plan = ChargePlan(
        id="classical-plan",
        label="Classical charge plan",
        slots=charge_slots,
        score=aggregate,
        source="classical",
        distinctness=0.0,
        all_ready_by_deadline=all(slot.end <= vehicles_by_id[slot.vehicle_id].dispatch_deadline for slot in charge_slots),
        summary=(
            f"CP-SAT scheduled {len(charge_slots)} charge sessions with "
            f"${aggregate.total_cost:.2f}/day and {peak_kw:.1f} kW peak."
        ),
        explanation=[
            "Classical assignment minimized TOU energy and demand exposure while respecting site cap.",
        ],
        metadata={"solverStatus": solver.status_name(status)},
    )

    wall_time = round(perf_counter() - started, 4)
    return ClassicalSolveResult(
        selected_plan=plan,
        eligible_triples=sorted(eligible, key=lambda item: item.cost),
        ineligible_reasons=ineligible,
        wall_time_seconds=wall_time,
        solver_status=solver.status_name(status),
        objective_value=aggregate.objective,
        diagnostics={
            "eligibleTripleCount": len(eligible),
            "slotCount": len(slots),
            "selectedPlanId": plan.id,
        },
    )
