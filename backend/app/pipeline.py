from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult, TaskAssignment
from app.qubo.scheduling import SchedulingQuboDiagnostics, estimate_scheduling_qubo_size
from app.repair_window.scheduling import (
    build_window_subproblem,
    extract_scheduling_repair_window,
    merge_window_assignments,
)
from app.solvers.classical import solve_schedule_classically
from app.solvers.qaoa import assess_qaoa_candidate, solve_schedule_with_qaoa
from app.metrics.diversity import assignment_signature, diversity_metrics_from_signatures
from app.metrics.success_metric import compute_success_metric


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
    if problem.type == "schedule":
        return _run_schedule_optimization(problem)
    if problem.type == "routing":
        from app.solvers.routing import solve_routing_classically

        result = solve_routing_classically(problem)
        return _attach_generic_metrics(result)
    if problem.type == "allocation":
        from app.solvers.allocation import solve_allocation_classically

        result = solve_allocation_classically(problem)
        return _attach_generic_metrics(result)
    raise NotImplementedError(f"Unsupported optimization type: {problem.type}")


def _run_schedule_optimization(problem: CanonicalProblem) -> SolverRunResult:
    classical_result = run_global_classical(problem)
    if not classical_result.feasible:
        return classical_result

    repair_window = detect_local_repair_window(problem, classical_result)
    if repair_window is None:
        return _attach_diversity_metrics(classical_result, classical_result)

    quantum_candidate = build_local_quantum_candidate(problem, classical_result, repair_window)
    quantum_result = solve_schedule_with_qaoa(
        quantum_candidate.problem,
        qubo_diagnostics=quantum_candidate.qubo_diagnostics,
        candidate_assessment=quantum_candidate.assessment,
    )
    result = merge_local_repair(classical_result, quantum_result, quantum_candidate)
    return _attach_diversity_metrics(classical_result, result)


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
    full_diagnostics = estimate_scheduling_qubo_size(problem)
    disabled_assessment = assess_qaoa_candidate(
        problem,
        qubo_diagnostics=full_diagnostics,
        check_environment=True,
    )

    if disabled_assessment["status"] == "disabled":
        classical_result.diagnostics = _merge_diagnostics(
            classical_result.diagnostics,
            {
                "orchestration": {
                    "path": "full_job_upload",
                    "localRepairWindow": "not_used",
                    "summary": "QAOA was disabled by environment, so the full job remained classical-only.",
                },
                "qaoa": disabled_assessment,
            },
        )
        return None

    extracted = extract_scheduling_repair_window(problem, classical_result)
    if extracted is None:
        classical_result.diagnostics = _merge_diagnostics(
            classical_result.diagnostics,
            {
                "orchestration": {
                    "path": "full_job_upload",
                    "localRepairWindow": "not_found",
                    "summary": (
                        "No suitable local repair window could be bounded to the current "
                        "QAOA research limits."
                    ),
                },
                "qaoa": {
                    **disabled_assessment,
                    "status": "no_local_window",
                    "reason": (
                        "Local repair extraction could not produce a sub-problem within "
                        "configured QAOA limits."
                    ),
                    "fullJobQuboDiagnostics": full_diagnostics.as_dict(),
                },
            },
        )
        return None

    return LocalRepairWindow(
        strategy=extracted.strategy,
        summary=extracted.summary,
        task_ids=extracted.task_ids,
        diagnostics={
            "qubo": extracted.qubo_diagnostics.as_dict(),
            "fullJobQuboDiagnostics": full_diagnostics.as_dict(),
            "qaoa": extracted.assessment,
            "reasons": extracted.reasons,
            "windowTaskCount": len(extracted.task_ids),
            "totalTaskCount": len(problem.tasks),
        },
    )


def build_local_quantum_candidate(
    problem: CanonicalProblem,
    classical_result: SolverRunResult,
    repair_window: LocalRepairWindow,
) -> LocalQuantumCandidate:
    subproblem = build_window_subproblem(problem, classical_result, repair_window.task_ids)
    qubo_diagnostics = estimate_scheduling_qubo_size(subproblem)
    assessment = assess_qaoa_candidate(
        subproblem,
        qubo_diagnostics=qubo_diagnostics,
    )
    return LocalQuantumCandidate(
        problem=subproblem,
        repair_window=repair_window,
        qubo_diagnostics=qubo_diagnostics,
        assessment=assessment,
    )


def merge_local_repair(
    classical_result: SolverRunResult,
    quantum_result: SolverRunResult,
    quantum_candidate: LocalQuantumCandidate,
) -> SolverRunResult:
    orchestration_base = {
        "path": "full_job_upload",
        "strategy": quantum_candidate.repair_window.strategy,
        "summary": quantum_candidate.repair_window.summary,
        "taskIds": quantum_candidate.repair_window.task_ids,
        "windowTaskCount": len(quantum_candidate.repair_window.task_ids),
        "quboDiagnostics": quantum_candidate.qubo_diagnostics.as_dict(),
    }

    if quantum_result.feasible:
        merged_assignments = merge_window_assignments(
            classical_result.assignments,
            quantum_result.assignments,
            quantum_candidate.repair_window.task_ids,
        )
        merged_score = max(assignment.end_day - 1 for assignment in merged_assignments)
        non_window_unchanged = _non_window_assignments_unchanged(
            classical_result.assignments,
            merged_assignments,
            quantum_candidate.repair_window.task_ids,
        )

        if merged_score <= classical_result.score:
            merged_result = SolverRunResult(
                feasible=True,
                method="hybrid",
                solver=quantum_result.solver,
                backend=quantum_result.backend,
                summary=quantum_result.summary,
                assignments=merged_assignments,
                metrics={
                    **quantum_result.metrics,
                    "makespanDays": merged_score,
                    "localRepairWindowTaskCount": len(quantum_candidate.repair_window.task_ids),
                },
                visualization=_visualization_from_assignments(
                    merged_assignments,
                    title="Hybrid plan (local repair window)",
                    summary=quantum_result.summary,
                ),
                score=merged_score,
                diagnostics=quantum_result.diagnostics,
            )
            merged_result.diagnostics = _merge_diagnostics(
                merged_result.diagnostics,
                {
                    "orchestration": {
                        **orchestration_base,
                        "localRepairWindow": "used",
                        "nonWindowAssignmentsPinned": non_window_unchanged,
                    }
                },
            )
            return merged_result

        classical_result.diagnostics = _merge_diagnostics(
            classical_result.diagnostics,
            {
                "orchestration": {
                    **orchestration_base,
                    "localRepairWindow": "kept_classical",
                    "summary": (
                        "Local repair window found but the classical result remained "
                        "better than the merged QAOA candidate."
                    ),
                    "nonWindowAssignmentsPinned": non_window_unchanged,
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
                **orchestration_base,
                "localRepairWindow": "classical_fallback",
                "summary": (
                    "QAOA attempted a bounded local repair window and the API fell back "
                    "to the global classical plan."
                ),
            },
            "qaoa": quantum_result.diagnostics.get("qaoa", quantum_candidate.assessment),
        },
    )
    return classical_result


def _attach_generic_metrics(result: SolverRunResult) -> SolverRunResult:
    distinct = max(1, len(result.solution)) if result.solution else 1
    result.metrics = {
        **result.metrics,
        "distinctFeasiblePlans": distinct,
        "diversityScore": 0.0 if distinct <= 1 else round(min(1.0, (distinct - 1) / distinct), 3),
    }
    return result


def _attach_diversity_metrics(
    classical_result: SolverRunResult,
    result: SolverRunResult,
) -> SolverRunResult:
    classical_signature = assignment_signature(classical_result.assignments)
    if result.method == "hybrid":
        hybrid_signature = assignment_signature(result.assignments)
        signatures = (
            [classical_signature, hybrid_signature]
            if hybrid_signature != classical_signature
            else [hybrid_signature]
        )
    else:
        signatures = [classical_signature]

    diversity = diversity_metrics_from_signatures(signatures if result.method == "hybrid" else [classical_signature])
    distinct = diversity.distinct_feasible_plans if result.method == "hybrid" else 1
    result.metrics = {
        **result.metrics,
        "distinctFeasiblePlans": distinct,
        "diversityScore": diversity.diversity_score,
    }
    if result.method == "hybrid":
        result.metrics["successMetric"] = compute_success_metric(
            hybrid_distinct=distinct,
            classical_distinct=1,
            hybrid_objective=float(result.score),
            classical_objective=float(classical_result.score),
        )
    return result


def _non_window_assignments_unchanged(
    classical_assignments: list[TaskAssignment],
    merged_assignments: list[TaskAssignment],
    window_task_ids: list[str],
) -> bool:
    window_set = set(window_task_ids)
    classical_map = {assignment.task: assignment for assignment in classical_assignments}
    merged_map = {assignment.task: assignment for assignment in merged_assignments}
    for task_id, assignment in classical_map.items():
        if task_id in window_set:
            continue
        other = merged_map.get(task_id)
        if other is None or other.start_day != assignment.start_day or other.end_day != assignment.end_day:
            return False
    return True


def _visualization_from_assignments(
    assignments: list[TaskAssignment],
    *,
    title: str,
    summary: str,
) -> dict[str, Any]:
    return {
        "kind": "schedule",
        "title": title,
        "summary": summary,
        "horizonLabel": "Project days",
        "blocks": [
            {
                "id": assignment.task,
                "label": assignment.task.replace("-", " ").title(),
                "resource": assignment.resource or "Unassigned",
                "start": assignment.start_day - 1,
                "duration": assignment.end_day - assignment.start_day,
            }
            for assignment in assignments
        ],
    }


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
