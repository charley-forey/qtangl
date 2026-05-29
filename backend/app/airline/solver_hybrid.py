from __future__ import annotations

import os
from dataclasses import dataclass, replace
from math import exp
from typing import Any

from docplex.mp.model import Model
from qiskit_optimization.translators import from_docplex_mp

from app.airline.models import (
    AirlineDataset,
    LegAssignment,
    OpenLeg,
    RecoveryPlan,
    RepairWindow,
    RoutingResult,
    ScenarioDefinition,
)
from app.airline.objective import (
    aggregate_plan_score,
    assignment_explanation,
    crew_average_hours,
    crew_is_eligible,
    score_assignment,
)
from app.airline.penalties import build_penalty_snapshot, load_penalty_policy
from app.airline.solver_classical import RESERVE_CREW_ID, ClassicalSolveResult, EligiblePair

QAOA_MAX_VARIABLES = int(os.getenv("QTANGL_AIRLINE_QAOA_MAX_VARIABLES", "20"))


@dataclass(slots=True)
class HybridSolveResult:
    plans: list[RecoveryPlan]
    diagnostics: dict[str, Any]
    qubo_snapshot: dict[str, Any]
    distribution: list[dict[str, Any]]


def estimate_qubo_size(crew_count: int, leg_count: int) -> int:
    return crew_count * leg_count


def solve_hybrid_plans(
    dataset: AirlineDataset,
    scenario: ScenarioDefinition,
    routing: RoutingResult,
    classical_result: ClassicalSolveResult,
    repair_window: RepairWindow,
    *,
    use_fixture: bool = True,
    seed: int = 1234,
) -> HybridSolveResult:
    micro_pairs = _select_micro_pairs(classical_result, repair_window, scenario)
    if not micro_pairs:
        return HybridSolveResult(
            plans=[],
            diagnostics={"status": "skipped", "reason": "No eligible micro-window pairs"},
            qubo_snapshot={},
            distribution=[],
        )

    crew_ids = sorted({pair.crew.id for pair in micro_pairs})
    leg_ids = sorted({pair.leg.leg_id for pair in micro_pairs}, key=lambda leg_id: leg_ids_order(routing, leg_id))
    pair_by_key = {(pair.crew.id, pair.leg.leg_id): pair for pair in micro_pairs}

    max_coefficient = max(pair.cost for pair in micro_pairs)
    penalty_policy = load_penalty_policy(
        dataset.penalty_weights,
        max_objective_coefficient=max_coefficient,
    )
    quadratic_program = _build_plan_qubo(
        micro_pairs,
        crew_ids,
        leg_ids,
        penalty_policy.hard_constraint_lambda,
        penalty_policy.no_double_booking_lambda,
    )
    qubo_snapshot = _qubo_snapshot(micro_pairs, crew_ids, leg_ids, penalty_policy, quadratic_program)
    var_count = len(crew_ids) * len(leg_ids)

    if use_fixture:
        distribution = _fixture_distribution(scenario, crew_ids, leg_ids)
        status = "fixture"
    else:
        distribution = _simulated_distribution(micro_pairs, crew_ids, leg_ids)
        status = "simulated"
        if var_count <= QAOA_MAX_VARIABLES:
            try:
                best_bitstring = _run_qaoa_optimum(quadratic_program, seed=seed)
            except Exception as exc:  # pragma: no cover
                best_bitstring = None
                status = "simulated"
                qubo_snapshot["runtimeNote"] = f"QAOA fallback: {exc}"
            else:
                status = "used"
                if best_bitstring:
                    distribution = _bias_distribution_toward_best(
                        distribution, crew_ids, leg_ids, best_bitstring
                    )

    ranked = sorted(
        distribution,
        key=lambda item: (-float(item["weight"]), item["planId"]),
    )[:3]

    plans: list[RecoveryPlan] = []
    cost_ladder = dataset.far117.cost_ladder
    soft_weights = dataset.penalty_weights["softWeights"]
    average_hours = crew_average_hours(dataset.crew)
    legs_by_id = {leg.leg_id: leg for leg in routing.open_legs}

    for rank, item in enumerate(ranked, start=1):
        plan = _decode_plan(
            item["bitstring"],
            crew_ids,
            leg_ids,
            pair_by_key,
            legs_by_id,
            scenario,
            cost_ladder=cost_ladder,
            soft_weights=soft_weights,
            average_hours=average_hours,
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
            "pairCount": len(micro_pairs),
            "variableCount": var_count,
            "selectedPlanIds": [plan.id for plan in plans],
        },
        qubo_snapshot=qubo_snapshot,
        distribution=distribution,
    )


def leg_ids_order(routing: RoutingResult, leg_id: str) -> int:
    for index, leg in enumerate(routing.open_legs):
        if leg.leg_id == leg_id:
            return index
    return 99


def _select_micro_pairs(
    classical_result: ClassicalSolveResult,
    repair_window: RepairWindow,
    scenario: ScenarioDefinition,
) -> list[EligiblePair]:
    pairs_by_key = {
        (pair.crew.id, pair.leg.leg_id): pair for pair in classical_result.eligible_pairs
    }
    ordered: list[EligiblePair] = []

    for crew_id in scenario.preferred_candidates:
        for leg_id in repair_window.leg_ids:
            key = (crew_id, leg_id)
            if key in pairs_by_key and pairs_by_key[key] not in ordered:
                ordered.append(pairs_by_key[key])

    for pair in sorted(classical_result.eligible_pairs, key=lambda item: item.cost):
        if pair not in ordered:
            ordered.append(pair)

    for crew_id in repair_window.crew_ids:
        for leg_id in repair_window.leg_ids:
            key = (crew_id, leg_id)
            if key in pairs_by_key and pairs_by_key[key] not in ordered:
                ordered.append(pairs_by_key[key])

    return ordered[: min(24, len(ordered))]


def _build_plan_qubo(
    pairs: list[EligiblePair],
    crew_ids: list[str],
    leg_ids: list[str],
    hard_lambda: float,
    double_booking_lambda: float,
) -> object:
    model = Model(name="airline_occ_micro_window")
    variables: dict[tuple[str, str], Any] = {}
    cost_by_key = {(pair.crew.id, pair.leg.leg_id): pair.cost for pair in pairs}

    for crew_id in crew_ids:
        for leg_id in leg_ids:
            if (crew_id, leg_id) in cost_by_key:
                variables[(crew_id, leg_id)] = model.binary_var(
                    name=f"x_{crew_id}_{leg_id}"
                )

    objective = model.sum(
        cost_by_key.get((crew_id, leg_id), 50.0) * variables[(crew_id, leg_id)]
        for (crew_id, leg_id) in variables
    )

    for leg_id in leg_ids:
        leg_vars = [variables[key] for key in variables if key[1] == leg_id]
        if leg_vars:
            choose_one = model.sum(leg_vars) - 1
            objective += hard_lambda * choose_one * choose_one

    for crew_id in crew_ids:
        crew_vars = [variables[key] for key in variables if key[0] == crew_id]
        if len(crew_vars) > 1:
            total = model.sum(crew_vars)
            objective += double_booking_lambda * total * (total - 1)

    model.minimize(objective)
    return from_docplex_mp(model)


def _qubo_snapshot(
    pairs: list[EligiblePair],
    crew_ids: list[str],
    leg_ids: list[str],
    penalty_policy: Any,
    quadratic_program: object,
) -> dict[str, Any]:
    quadratic = quadratic_program.objective.quadratic.to_dict()
    return {
        "variableCount": len(crew_ids) * len(leg_ids),
        "crewIds": crew_ids,
        "legIds": leg_ids,
        "pairCosts": {
            f"{pair.crew.id}:{pair.leg.leg_id}": pair.cost for pair in pairs
        },
        "quadraticTerms": [
            {"variables": [variables[0], variables[1]], "value": value}
            for variables, value in quadratic.items()
        ],
        "penalties": build_penalty_snapshot(penalty_policy),
    }


def _bitstring_for_keys(crew_ids: list[str], leg_ids: list[str]) -> list[tuple[str, str]]:
    ordering: list[tuple[str, str]] = []
    for crew_id in crew_ids:
        for leg_id in leg_ids:
            ordering.append((crew_id, leg_id))
    return ordering


def _fixture_distribution(
    scenario: ScenarioDefinition,
    crew_ids: list[str],
    leg_ids: list[str],
) -> list[dict[str, Any]]:
    ordering = _bitstring_for_keys(crew_ids, leg_ids)
    total = sum(count.weight for count in scenario.counts) or 1
    items: list[dict[str, Any]] = []
    for index, count in enumerate(scenario.counts):
        plan_id = f"hybrid-plan-{index + 1}"
        bitstring = count.bitstring
        if len(bitstring) < len(ordering):
            bitstring = bitstring.ljust(len(ordering), "0")
        items.append(
            {
                "planId": plan_id,
                "bitstring": bitstring[: len(ordering)],
                "weight": round((count.weight / total) * 100, 1),
            }
        )
    return items


def _simulated_distribution(
    pairs: list[EligiblePair],
    crew_ids: list[str],
    leg_ids: list[str],
) -> list[dict[str, Any]]:
    ordering = _bitstring_for_keys(crew_ids, leg_ids)
    pair_costs = {(p.crew.id, p.leg.leg_id): p.cost for p in pairs}
    weights = []
    for crew_id, leg_id in ordering:
        cost = pair_costs.get((crew_id, leg_id), 40.0)
        weights.append(exp(-cost / 30.0))
    total = sum(weights) or 1.0
    items = []
    for index, (crew_id, leg_id) in enumerate(ordering):
        bitstring = "".join("1" if item == index else "0" for item in range(len(ordering)))
        items.append(
            {
                "planId": f"hybrid-plan-{crew_id}-{leg_id}",
                "bitstring": bitstring,
                "weight": round((weights[index] / total) * 100, 1),
            }
        )
    return items[:3]


def _bias_distribution_toward_best(
    distribution: list[dict[str, Any]],
    crew_ids: list[str],
    leg_ids: list[str],
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
    crew_ids: list[str],
    leg_ids: list[str],
    pair_by_key: dict[tuple[str, str], EligiblePair],
    legs_by_id: dict[str, OpenLeg],
    scenario: ScenarioDefinition,
    *,
    cost_ladder: dict[str, float],
    soft_weights: dict[str, float],
    average_hours: float,
    rank: int,
    weight: float,
    use_fixture: bool,
) -> RecoveryPlan | None:
    ordering = _bitstring_for_keys(crew_ids, leg_ids)
    if len(bitstring) < len(ordering):
        bitstring = bitstring.ljust(len(ordering), "0")

    leg_assignments: list[LegAssignment] = []
    leg_scores = []
    used_legs: set[str] = set()

    for index, (crew_id, leg_id) in enumerate(ordering):
        if index >= len(bitstring) or bitstring[index] != "1":
            continue
        if leg_id in used_legs:
            continue
        pair = pair_by_key.get((crew_id, leg_id))
        leg = legs_by_id.get(leg_id)
        if not pair or not leg:
            continue
        used_legs.add(leg_id)
        score = score_assignment(
            pair.crew,
            leg,
            scenario,
            cost_ladder=cost_ladder,
            soft_weights=soft_weights,
            crew_average_hours=average_hours,
        )
        leg_scores.append(score)
        leg_assignments.append(
            LegAssignment(
                leg_id=leg.leg_id,
                crew_id=pair.crew.id,
                crew_name=pair.crew.name,
                role=pair.crew.role,
                home_base=pair.crew.base,
                source="internal",
                explanation=assignment_explanation(pair.crew, leg, score),
            )
        )

    if not leg_assignments:
        return None

    aggregate = aggregate_plan_score(leg_scores)
    return RecoveryPlan(
        id=f"hybrid-plan-{rank}",
        label=f"Hybrid plan {rank}",
        assignments=leg_assignments,
        score=aggregate,
        source="fixture" if use_fixture else "hybrid",
        distinctness=round(1.0 - (rank - 1) * 0.15, 2),
        seniority_preserved=any(
            assignment.crew_id in scenario.preferred_candidates for assignment in leg_assignments
        ),
        far117_compliant=True,
        summary=(
            f"Hybrid sampling surfaced a {len(leg_assignments)}-leg recovery plan "
            f"with {weight:.1f}% measured weight."
        ),
        explanation=[
            "Hybrid micro-window explored alternate crew-leg assignments not retained by the greedy classical path.",
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
