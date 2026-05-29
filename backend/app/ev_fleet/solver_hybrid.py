from __future__ import annotations

import os
from dataclasses import dataclass
from math import exp
from typing import Any

from docplex.mp.model import Model
from qiskit_optimization.translators import from_docplex_mp

from app.ev_fleet.models import (
    ChargePlan,
    ChargeSlot,
    EvFleetDataset,
    RepairWindow,
    RoutingResult,
    ScenarioDefinition,
)
from app.ev_fleet.objective import (
    aggregate_plan_score,
    assignment_explanation,
    charge_minutes,
    compute_peak_kw,
    period_for_time,
    score_assignment,
    vehicle_average_soc,
)
from app.ev_fleet.penalties import build_penalty_snapshot, load_penalty_policy
from app.ev_fleet.solver_classical import ClassicalSolveResult, EligibleTriple

QAOA_MAX_VARIABLES = int(os.getenv("QTANGL_EVFLEET_QAOA_MAX_VARIABLES", "24"))


@dataclass(slots=True)
class HybridSolveResult:
    plans: list[ChargePlan]
    diagnostics: dict[str, Any]
    qubo_snapshot: dict[str, Any]
    distribution: list[dict[str, Any]]


def solve_hybrid_plans(
    dataset: EvFleetDataset,
    scenario: ScenarioDefinition,
    routing: RoutingResult,
    classical_result: ClassicalSolveResult,
    repair_window: RepairWindow,
    *,
    use_fixture: bool = True,
    seed: int = 1234,
) -> HybridSolveResult:
    micro_triples = _select_micro_triples(classical_result, repair_window, scenario)
    if not micro_triples:
        return HybridSolveResult(
            plans=[],
            diagnostics={"status": "skipped", "reason": "No eligible micro-window triples"},
            qubo_snapshot={},
            distribution=[],
        )

    vehicle_ids = sorted({triple.vehicle.id for triple in micro_triples})
    charger_ids = sorted({triple.charger.id for triple in micro_triples})
    slot_ids = sorted({triple.slot_id for triple in micro_triples}, key=lambda slot_id: slot_id)
    triple_by_key = {
        (triple.vehicle.id, triple.charger.id, triple.slot_id): triple for triple in micro_triples
    }

    max_coefficient = max(triple.cost for triple in micro_triples)
    penalty_policy = load_penalty_policy(
        dataset.penalty_weights,
        max_objective_coefficient=max_coefficient,
    )
    quadratic_program = _build_charge_qubo(
        micro_triples,
        vehicle_ids,
        charger_ids,
        slot_ids,
        penalty_policy.hard_constraint_lambda,
        penalty_policy.no_double_booking_lambda,
        penalty_policy.peak_concurrency_lambda,
    )
    qubo_snapshot = _qubo_snapshot(
        micro_triples, vehicle_ids, charger_ids, slot_ids, penalty_policy, quadratic_program
    )
    var_count = len(micro_triples)

    if use_fixture:
        distribution = _fixture_distribution(scenario, micro_triples)
        status = "fixture"
    else:
        distribution = _simulated_distribution(micro_triples)
        status = "simulated"
        if var_count <= QAOA_MAX_VARIABLES:
            try:
                best_bitstring = _run_qaoa_optimum(quadratic_program, seed=seed)
            except Exception as exc:  # pragma: no cover
                best_bitstring = None
                qubo_snapshot["runtimeNote"] = f"QAOA fallback: {exc}"
            else:
                status = "used"
                if best_bitstring:
                    distribution = _bias_distribution_toward_best(distribution, best_bitstring)

    ranked = sorted(distribution, key=lambda item: (-float(item["weight"]), item["planId"]))[:3]
    tariff = dataset.tariff
    soft_weights = dataset.penalty_weights["softWeights"]
    avg_soc = vehicle_average_soc(dataset.vehicles)
    chargers_by_id = {charger.id: charger for charger in dataset.chargers}
    vehicles_by_id = {vehicle.id: vehicle for vehicle in dataset.vehicles}

    plans: list[ChargePlan] = []
    for rank, item in enumerate(ranked, start=1):
        plan = _decode_plan(
            item["bitstring"],
            micro_triples,
            triple_by_key,
            scenario,
            tariff=tariff,
            soft_weights=soft_weights,
            average_soc=avg_soc,
            chargers_by_id=chargers_by_id,
            vehicles_by_id=vehicles_by_id,
            rank=rank,
            weight=float(item["weight"]),
            use_fixture=use_fixture,
        )
        if plan:
            plans.append(plan)

    return HybridSolveResult(
        plans=plans,
        diagnostics={
            "status": status,
            "tripleCount": len(micro_triples),
            "variableCount": var_count,
            "selectedPlanIds": [plan.id for plan in plans],
        },
        qubo_snapshot=qubo_snapshot,
        distribution=distribution,
    )


def _select_micro_triples(
    classical_result: ClassicalSolveResult,
    repair_window: RepairWindow,
    scenario: ScenarioDefinition,
) -> list[EligibleTriple]:
    triples_by_key = {
        (triple.vehicle.id, triple.charger.id, triple.slot_id): triple
        for triple in classical_result.eligible_triples
    }
    ordered: list[EligibleTriple] = []

    for vehicle_id in scenario.preferred_candidates:
        for slot_id in repair_window.peak_slot_ids:
            for charger_id in repair_window.charger_ids:
                key = (vehicle_id, charger_id, slot_id)
                if key in triples_by_key and triples_by_key[key] not in ordered:
                    ordered.append(triples_by_key[key])

    for triple in sorted(classical_result.eligible_triples, key=lambda item: item.cost):
        if triple not in ordered:
            ordered.append(triple)

    for vehicle_id in repair_window.vehicle_ids:
        for charger_id in repair_window.charger_ids:
            for slot_id in repair_window.peak_slot_ids:
                key = (vehicle_id, charger_id, slot_id)
                if key in triples_by_key and triples_by_key[key] not in ordered:
                    ordered.append(triples_by_key[key])

    return ordered[: min(24, len(ordered))]


def _build_charge_qubo(
    triples: list[EligibleTriple],
    vehicle_ids: list[str],
    charger_ids: list[str],
    slot_ids: list[str],
    hard_lambda: float,
    double_booking_lambda: float,
    peak_lambda: float,
) -> object:
    model = Model(name="ev_fleet_charger_micro_window")
    variables: dict[tuple[str, str, str], Any] = {}
    cost_by_key = {
        (triple.vehicle.id, triple.charger.id, triple.slot_id): triple.cost for triple in triples
    }

    for triple in triples:
        key = (triple.vehicle.id, triple.charger.id, triple.slot_id)
        variables[key] = model.binary_var(name=f"x_{key[0]}_{key[1]}_{key[2]}")

    objective = model.sum(
        cost_by_key.get(key, 40.0) * variables[key] for key in variables
    )

    for vehicle_id in vehicle_ids:
        vehicle_vars = [variables[key] for key in variables if key[0] == vehicle_id]
        if vehicle_vars:
            choose_one = model.sum(vehicle_vars) - 1
            objective += hard_lambda * choose_one * choose_one

    for charger_id in charger_ids:
        for slot_id in slot_ids:
            slot_vars = [
                variables[key] for key in variables if key[1] == charger_id and key[2] == slot_id
            ]
            if len(slot_vars) > 1:
                total = model.sum(slot_vars)
                objective += double_booking_lambda * total * (total - 1)

    peak_vars = [variables[key] for key in variables if key[2] in slot_ids[:3]]
    if len(peak_vars) > 1:
        peak_total = model.sum(peak_vars)
        objective += peak_lambda * peak_total * (peak_total - 1)

    model.minimize(objective)
    return from_docplex_mp(model)


def _qubo_snapshot(
    triples: list[EligibleTriple],
    vehicle_ids: list[str],
    charger_ids: list[str],
    slot_ids: list[str],
    penalty_policy: Any,
    quadratic_program: object,
) -> dict[str, Any]:
    quadratic = quadratic_program.objective.quadratic.to_dict()
    return {
        "variableCount": len(triples),
        "vehicleIds": vehicle_ids,
        "chargerIds": charger_ids,
        "slotIds": slot_ids,
        "assignmentCosts": {
            f"{triple.vehicle.id}:{triple.charger.id}:{triple.slot_id}": triple.cost
            for triple in triples
        },
        "quadraticTerms": [
            {"variables": [variables[0], variables[1]], "value": value}
            for variables, value in quadratic.items()
        ],
        "penalties": build_penalty_snapshot(penalty_policy),
    }


def _ordering(triples: list[EligibleTriple]) -> list[tuple[str, str, str]]:
    return [(triple.vehicle.id, triple.charger.id, triple.slot_id) for triple in triples]


def _fixture_distribution(
    scenario: ScenarioDefinition,
    triples: list[EligibleTriple],
) -> list[dict[str, Any]]:
    ordering = _ordering(triples)
    total = sum(count.weight for count in scenario.counts) or 1
    items: list[dict[str, Any]] = []
    for index, count in enumerate(scenario.counts):
        bitstring = count.bitstring
        if len(bitstring) < len(ordering):
            bitstring = bitstring.ljust(len(ordering), "0")
        items.append(
            {
                "planId": f"hybrid-plan-{index + 1}",
                "bitstring": bitstring[: len(ordering)],
                "weight": round((count.weight / total) * 100, 1),
            }
        )
    return items


def _simulated_distribution(triples: list[EligibleTriple]) -> list[dict[str, Any]]:
    ordering = _ordering(triples)
    costs = {key: triple.cost for key, triple in zip(ordering, triples, strict=False)}
    weights = [exp(-costs.get(key, 40.0) / 30.0) for key in ordering]
    total = sum(weights) or 1.0
    items = []
    for index, key in enumerate(ordering):
        bitstring = "".join("1" if item == index else "0" for item in range(len(ordering)))
        items.append(
            {
                "planId": f"hybrid-plan-{key[0]}-{key[1]}",
                "bitstring": bitstring,
                "weight": round((weights[index] / total) * 100, 1),
            }
        )
    return items[:3]


def _bias_distribution_toward_best(
    distribution: list[dict[str, Any]],
    best_bitstring: str,
) -> list[dict[str, Any]]:
    updated = []
    for item in distribution:
        weight = float(item["weight"])
        if item["bitstring"] == best_bitstring:
            weight += 8.0
        else:
            weight = max(4.0, weight - 4.0)
        updated.append({**item, "weight": weight})
    total = sum(entry["weight"] for entry in updated) or 1.0
    return [{**entry, "weight": round((entry["weight"] / total) * 100, 1)} for entry in updated]


def _decode_plan(
    bitstring: str,
    ordering_triples: list[EligibleTriple],
    triple_by_key: dict[tuple[str, str, str], EligibleTriple],
    scenario: ScenarioDefinition,
    *,
    tariff: Any,
    soft_weights: dict[str, float],
    average_soc: float,
    chargers_by_id: dict[str, Any],
    vehicles_by_id: dict[str, Any],
    rank: int,
    weight: float,
    use_fixture: bool,
) -> ChargePlan | None:
    ordering = _ordering(ordering_triples)
    if len(bitstring) < len(ordering):
        bitstring = bitstring.ljust(len(ordering), "0")

    slots: list[ChargeSlot] = []
    scores = []
    used_vehicles: set[str] = set()

    for index, key in enumerate(ordering):
        if index >= len(bitstring) or bitstring[index] != "1":
            continue
        if key[0] in used_vehicles:
            continue
        triple = triple_by_key.get(key)
        if not triple:
            continue
        used_vehicles.add(key[0])
        minutes = charge_minutes(
            triple.kwh_needed, triple.charger.power_kw, triple.vehicle.max_charge_kw
        )
        from datetime import timedelta
        from app.ev_fleet.objective import TIME_FORMAT, parse_dt

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
            vehicle_average_soc=average_soc,
            scenario=scenario,
        )
        scores.append(score)
        slot = ChargeSlot(
            vehicle_id=triple.vehicle.id,
            charger_id=triple.charger.id,
            start=triple.slot_start,
            end=end_dt.strftime(TIME_FORMAT),
            kwh_delivered=round(triple.kwh_needed, 2),
            period=period,
            cost=score.total_cost,
        )
        slots.append(slot)

    if not slots:
        return None

    peak_kw = compute_peak_kw(slots, chargers_by_id, vehicles_by_id)
    aggregate = aggregate_plan_score(scores, peak_kw_override=peak_kw)
    aggregate.demand_charge_cost = round(tariff.demand_charge_per_kw * peak_kw * 0.12, 2)
    aggregate.total_cost = round(aggregate.energy_cost + aggregate.demand_charge_cost, 2)
    aggregate.objective = aggregate.total_cost

    return ChargePlan(
        id=f"hybrid-plan-{rank}",
        label=f"Hybrid plan {rank}",
        slots=slots,
        score=aggregate,
        source="fixture" if use_fixture else "hybrid",
        distinctness=round(1.0 - (rank - 1) * 0.15, 2),
        all_ready_by_deadline=all(
            slot.end <= vehicles_by_id[slot.vehicle_id].dispatch_deadline for slot in slots
        ),
        summary=(
            f"Hybrid staggering surfaced a plan with {weight:.1f}% measured weight "
            f"and {peak_kw:.1f} kW peak."
        ),
        explanation=[
            assignment_explanation(
                vehicles_by_id[slot.vehicle_id],
                chargers_by_id[slot.charger_id],
                slot,
                scores[index],
            )[0]
            for index, slot in enumerate(slots[:2])
        ],
        quantum_weight=weight,
        bitstring=bitstring[: len(ordering)],
        metadata={"samplingSource": "fixture" if use_fixture else "aer"},
    )


def _run_qaoa_optimum(quadratic_program: object, *, seed: int) -> str | None:
    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
    from qiskit_aer import AerSimulator
    from qiskit_aer.primitives import SamplerV2
    from qiskit_optimization.algorithms import MinimumEigenOptimizer
    from qiskit_optimization.minimum_eigensolvers import QAOA
    from qiskit_optimization.optimizers import SPSA
    from qiskit_optimization.utils import algorithm_globals

    algorithm_globals.random_seed = seed
    simulator = AerSimulator(method="statevector")
    sampler = SamplerV2(seed=seed, default_shots=256)
    pass_manager = generate_preset_pass_manager(
        optimization_level=1,
        backend=simulator,
        seed_transpiler=seed,
    )
    qaoa = QAOA(
        sampler=sampler,
        optimizer=SPSA(maxiter=8),
        reps=1,
        pass_manager=pass_manager,
    )
    result = MinimumEigenOptimizer(qaoa).solve(quadratic_program)
    if hasattr(result, "x") and result.x is not None:
        return "".join("1" if int(round(value)) == 1 else "0" for value in result.x)
    return None
