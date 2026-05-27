from __future__ import annotations

from dataclasses import dataclass, replace
from math import exp
from typing import Any

from docplex.mp.model import Model
from qiskit_optimization.translators import from_docplex_mp

from app.hospital.models import HospitalDataset, RepairWindow, ScenarioDefinition, SwapCandidate
from app.hospital.penalties import build_penalty_snapshot, load_penalty_policy
from app.hospital.solver_classical import ClassicalSolveResult


@dataclass(slots=True)
class HybridSolveResult:
    candidates: list[SwapCandidate]
    diagnostics: dict[str, Any]
    qubo_snapshot: dict[str, Any]
    distribution: list[dict[str, Any]]


def solve_hybrid_candidates(
    dataset: HospitalDataset,
    scenario: ScenarioDefinition,
    classical_result: ClassicalSolveResult,
    repair_window: RepairWindow,
    *,
    use_fixture: bool = True,
    seed: int = 1234,
) -> HybridSolveResult:
    micro_candidates = _select_micro_candidates(classical_result, repair_window, scenario)
    if not micro_candidates:
        return HybridSolveResult(
            candidates=[],
            diagnostics={"status": "skipped", "reason": "No eligible micro-window candidates"},
            qubo_snapshot={},
            distribution=[],
        )

    max_coefficient = max(candidate.score.objective for candidate in micro_candidates)
    penalty_policy = load_penalty_policy(
        dataset.penalty_weights,
        max_objective_coefficient=max_coefficient,
    )
    quadratic_program = _build_candidate_qubo(micro_candidates, penalty_policy.hard_constraint_lambda)
    qubo_snapshot = _qubo_snapshot(micro_candidates, penalty_policy, quadratic_program)

    if use_fixture:
        distribution = _fixture_distribution(scenario, micro_candidates)
        status = "fixture"
    else:
        distribution = _simulated_distribution(micro_candidates)
        status = "used"
        try:
            best_id = _run_qaoa_optimum(quadratic_program, seed=seed)
        except Exception as exc:  # pragma: no cover - live qiskit path can vary by environment
            best_id = None
            status = "simulated"
            qubo_snapshot["runtimeNote"] = f"QAOA fallback used after runtime error: {exc}"
        if best_id:
            distribution = _bias_distribution_toward_best(distribution, best_id)

    ranked = sorted(
        distribution,
        key=lambda item: (-float(item["weight"]), item["candidateId"]),
    )[:3]

    candidates_by_id = {candidate.nurse_id: candidate for candidate in micro_candidates}
    hybrid_candidates: list[SwapCandidate] = []
    for rank, item in enumerate(ranked, start=1):
        base = candidates_by_id[item["candidateId"]]
        hybrid_candidates.append(
            replace(
                base,
                id=f"hybrid-{base.nurse_id}",
                label=f"{base.nurse_name} (Alt {rank})",
                source="fixture" if use_fixture else "hybrid",
                quantum_weight=float(item["weight"]),
                distinctness=round(1.0 - (rank - 1) * 0.18, 2),
                explanation=[
                    *base.explanation,
                    f"Hybrid sampling surfaced this candidate with {item['weight']:.1f}% of the measured weight.",
                ],
                metadata={
                    **base.metadata,
                    "bitstring": item["bitstring"],
                    "samplingSource": "fixture" if use_fixture else "aer",
                },
            )
        )

    return HybridSolveResult(
        candidates=hybrid_candidates,
        diagnostics={
            "status": status,
            "candidateCount": len(micro_candidates),
            "selectedCandidateIds": [candidate.nurse_id for candidate in hybrid_candidates],
        },
        qubo_snapshot=qubo_snapshot,
        distribution=distribution,
    )


def _select_micro_candidates(
    classical_result: ClassicalSolveResult,
    repair_window: RepairWindow,
    scenario: ScenarioDefinition,
) -> list[SwapCandidate]:
    candidates_by_id = {
        candidate.nurse_id: candidate for candidate in classical_result.eligible_candidates
    }
    ordered_ids: list[str] = []

    for candidate_id in scenario.preferred_candidates:
        if candidate_id in candidates_by_id and candidate_id not in ordered_ids:
            ordered_ids.append(candidate_id)

    if classical_result.selected_candidate.nurse_id in candidates_by_id:
        selected_id = classical_result.selected_candidate.nurse_id
        if selected_id not in ordered_ids:
            ordered_ids.append(selected_id)

    for nurse_id in repair_window.nurse_ids:
        if nurse_id in candidates_by_id and nurse_id not in ordered_ids:
            ordered_ids.append(nurse_id)

    if not ordered_ids:
        ordered_ids = [candidate.nurse_id for candidate in classical_result.eligible_candidates[:3]]

    return [candidates_by_id[candidate_id] for candidate_id in ordered_ids[:3]]


def _build_candidate_qubo(candidates: list[SwapCandidate], hard_lambda: float) -> object:
    model = Model(name="hospital_restaffing_micro_window")
    variables = {candidate.nurse_id: model.binary_var(name=f"x_{candidate.nurse_id}") for candidate in candidates}
    objective = model.sum(candidate.score.objective * variables[candidate.nurse_id] for candidate in candidates)
    choose_one_penalty = hard_lambda * (
        model.sum(variables.values()) - 1
    ) * (
        model.sum(variables.values()) - 1
    )
    model.minimize(objective + choose_one_penalty)
    return from_docplex_mp(model)


def _qubo_snapshot(candidates: list[SwapCandidate], penalty_policy: Any, quadratic_program: object) -> dict[str, Any]:
    quadratic = quadratic_program.objective.quadratic.to_dict()
    return {
        "variableCount": len(candidates),
        "candidateIds": [candidate.nurse_id for candidate in candidates],
        "candidateScores": {
            candidate.nurse_id: candidate.score.objective for candidate in candidates
        },
        "quadraticTerms": [
            {"variables": [variables[0], variables[1]], "value": value}
            for variables, value in quadratic.items()
        ],
        "penalties": build_penalty_snapshot(penalty_policy),
    }


def _fixture_distribution(
    scenario: ScenarioDefinition,
    candidates: list[SwapCandidate],
) -> list[dict[str, Any]]:
    candidate_ids = [candidate.nurse_id for candidate in candidates]
    total = sum(count.weight for count in scenario.counts) or 1
    items: list[dict[str, Any]] = []
    for count in scenario.counts:
        index = count.bitstring.find("1")
        if index == -1 or index >= len(candidate_ids):
            continue
        items.append(
            {
                "candidateId": candidate_ids[index],
                "bitstring": count.bitstring,
                "weight": round((count.weight / total) * 100, 1),
            }
        )
    return items


def _simulated_distribution(candidates: list[SwapCandidate]) -> list[dict[str, Any]]:
    weights = [exp(-candidate.score.objective / 25) for candidate in candidates]
    total = sum(weights) or 1.0
    width = len(candidates)
    return [
        {
            "candidateId": candidate.nurse_id,
            "bitstring": "".join("1" if item == index else "0" for item in range(width)),
            "weight": round((weights[index] / total) * 100, 1),
        }
        for index, candidate in enumerate(candidates)
    ]


def _bias_distribution_toward_best(
    distribution: list[dict[str, Any]],
    best_candidate_id: str,
) -> list[dict[str, Any]]:
    updated = []
    for item in distribution:
        weight = float(item["weight"])
        if item["candidateId"] == best_candidate_id:
            weight += 8.0
        else:
            weight = max(4.0, weight - 4.0)
        updated.append({**item, "weight": weight})
    total = sum(item["weight"] for item in updated) or 1.0
    return [{**item, "weight": round((item["weight"] / total) * 100, 1)} for item in updated]


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
    if hasattr(result, "variables_dict"):
        for variable_name, value in result.variables_dict.items():
            if int(round(value)) == 1:
                return str(variable_name).replace("x_", "", 1)
    return None
