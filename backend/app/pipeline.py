from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult
from app.qubo.scheduling import SchedulingQuboDiagnostics, estimate_scheduling_qubo_size
from app.solvers.classical import solve_schedule_classically
from app.solvers.qaoa import assess_qaoa_candidate, solve_schedule_with_qaoa


@dataclass(slots=True)
class LocalRepairWindow:
    strategy: str
    summary: str
    task_ids: list[str]
    diagnostics: dict[str, Any]


@dataclass(slots=True)
class LocalQuantumCandidate:
    problem: CanonicalProblem
    repair_window: LocalRepairWindow
    qubo_diagnostics: SchedulingQuboDiagnostics
    assessment: dict[str, Any]


def run_optimization(problem: CanonicalProblem) -> SolverRunResult:
    if problem.type != "schedule":
        raise NotImplementedError(
            "This pilot API currently supports live schedule jobs. Routing and allocation are scaffolded next."
        )

    classical_result = run_global_classical(problem)
    if not classical_result.feasible:
        return classical_result

    repair_window = detect_local_repair_window(problem, classical_result)
    if repair_window is None:
        return classical_result

    quantum_candidate = build_local_quantum_candidate(problem, repair_window)
    quantum_result = solve_schedule_with_qaoa(
        quantum_candidate.problem,
        qubo_diagnostics=quantum_candidate.qubo_diagnostics,
        candidate_assessment=quantum_candidate.assessment,
    )
    return merge_local_repair(classical_result, quantum_result, quantum_candidate)


def run_global_classical(problem: CanonicalProblem) -> SolverRunResult:
    classical_result = solve_schedule_classically(problem)
    classical_result.diagnostics = {
        **classical_result.diagnostics,
        "orchestration": {
            "path": "full_job_upload",
            "stage": "global_classical",
            "summary": "Qtangl solved the full uploaded job classically before considering any local quantum candidate.",
        },
    }
    return classical_result


def detect_local_repair_window(
    problem: CanonicalProblem,
    classical_result: SolverRunResult,
) -> LocalRepairWindow | None:
    qubo_diagnostics = estimate_scheduling_qubo_size(problem)
    assessment = assess_qaoa_candidate(problem, qubo_diagnostics=qubo_diagnostics)

    if assessment["status"] == "disabled":
        classical_result.diagnostics = _merge_diagnostics(
            classical_result.diagnostics,
            {
                "orchestration": {
                    "path": "full_job_upload",
                    "localRepairWindow": "not_used",
                    "summary": "QAOA was disabled by environment, so the full job remained classical-only.",
                },
                "qaoa": assessment,
            },
        )
        return None

    if assessment["status"] != "eligible":
        classical_result.diagnostics = _merge_diagnostics(
            classical_result.diagnostics,
            {
                "orchestration": {
                    "path": "full_job_upload",
                    "localRepairWindow": "not_found",
                    "summary": (
                        "No suitable local repair window found. Local repair extraction is "
                        "not implemented yet and the full uploaded job exceeds the current "
                        "micro-problem limits."
                    ),
                },
                "qaoa": {
                    **assessment,
                    "status": "no_local_window",
                },
            },
        )
        return None

    return LocalRepairWindow(
        strategy="whole_problem_smoke",
        summary=(
            "No separate local repair extractor is implemented yet, so the full job is "
            "temporarily reused as a bounded research-sized candidate."
        ),
        task_ids=[task.id for task in problem.tasks],
        diagnostics={
            "qubo": qubo_diagnostics.as_dict(),
            "qaoa": assessment,
        },
    )


def build_local_quantum_candidate(
    problem: CanonicalProblem,
    repair_window: LocalRepairWindow,
) -> LocalQuantumCandidate:
    qubo_diagnostics = estimate_scheduling_qubo_size(problem)
    assessment = assess_qaoa_candidate(
        problem,
        qubo_diagnostics=qubo_diagnostics,
    )
    return LocalQuantumCandidate(
        problem=problem,
        repair_window=repair_window,
        qubo_diagnostics=qubo_diagnostics,
        assessment=assessment,
    )


def merge_local_repair(
    classical_result: SolverRunResult,
    quantum_result: SolverRunResult,
    quantum_candidate: LocalQuantumCandidate,
) -> SolverRunResult:
    if quantum_result.feasible and quantum_result.score <= classical_result.score:
        quantum_result.diagnostics = _merge_diagnostics(
            quantum_result.diagnostics,
            {
                "orchestration": {
                    "path": "full_job_upload",
                    "localRepairWindow": "used",
                    "strategy": quantum_candidate.repair_window.strategy,
                    "summary": quantum_candidate.repair_window.summary,
                    "taskIds": quantum_candidate.repair_window.task_ids,
                }
            },
        )
        return quantum_result

    if quantum_result.feasible:
        classical_result.diagnostics = _merge_diagnostics(
            classical_result.diagnostics,
            {
                "orchestration": {
                    "path": "full_job_upload",
                    "localRepairWindow": "kept_classical",
                    "strategy": quantum_candidate.repair_window.strategy,
                    "summary": "Local repair window found but the classical result remained better than the QAOA candidate.",
                    "taskIds": quantum_candidate.repair_window.task_ids,
                },
                "qaoa": {
                    **quantum_result.diagnostics.get("qaoa", {}),
                    "status": "kept_classical",
                },
            },
        )
        return classical_result

    classical_result.diagnostics = _merge_diagnostics(
        classical_result.diagnostics,
        {
            "orchestration": {
                "path": "full_job_upload",
                "localRepairWindow": "classical_fallback",
                "strategy": quantum_candidate.repair_window.strategy,
                "summary": "QAOA attempted a bounded local candidate and the API fell back to the global classical plan.",
                "taskIds": quantum_candidate.repair_window.task_ids,
            },
            "qaoa": quantum_result.diagnostics.get("qaoa", quantum_candidate.assessment),
        },
    )
    return classical_result


def _merge_diagnostics(
    current: dict[str, Any],
    extra: dict[str, Any],
) -> dict[str, Any]:
    merged = dict(current)

    for key, value in extra.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = {**merged[key], **value}
        else:
            merged[key] = value

    return merged
