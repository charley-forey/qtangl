from __future__ import annotations

import os
from typing import Any

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult, TaskAssignment
from app.qubo.scheduling import (
    SchedulingQuboDiagnostics,
    build_scheduling_quadratic_program,
    estimate_scheduling_qubo_size,
)


def is_qaoa_enabled_for_runtime() -> bool:
    raw_value = os.getenv("QTANGL_ENABLE_QAOA")
    if raw_value is not None:
        return raw_value.strip().lower() in {"1", "true", "yes", "on"}

    # Production-safe default: disable on Railway unless explicitly re-enabled.
    return not (
        os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("RAILWAY_PROJECT_ID")
    )


def assess_qaoa_candidate(
    problem: CanonicalProblem,
    *,
    qubo_diagnostics: SchedulingQuboDiagnostics | None = None,
    check_environment: bool = True,
) -> dict[str, Any]:
    diagnostics = qubo_diagnostics or estimate_scheduling_qubo_size(problem)
    limits = {
        "maxBinaryVariables": int(
            os.getenv("QTANGL_QAOA_MAX_BINARY_VARIABLES", "12")
        ),
        "maxHorizon": int(os.getenv("QTANGL_QAOA_MAX_HORIZON", "6")),
        "maxOverlapConstraints": int(
            os.getenv("QTANGL_QAOA_MAX_OVERLAP_CONSTRAINTS", "24")
        ),
    }

    assessment: dict[str, Any] = {
        "enabled": is_qaoa_enabled_for_runtime(),
        "quboDiagnostics": diagnostics.as_dict(),
        "limits": limits,
        "status": "eligible",
        "reason": "QAOA candidate is within the configured research-size limits.",
    }

    if check_environment and not assessment["enabled"]:
        assessment["status"] = "disabled"
        assessment["reason"] = (
            "QAOA disabled by environment. Railway production stays classical-first "
            "unless QTANGL_ENABLE_QAOA is explicitly turned on."
        )
        return assessment

    if diagnostics.binary_variable_count > limits["maxBinaryVariables"]:
        assessment["status"] = "too_large"
        assessment["reason"] = (
            "QAOA skipped because the candidate exceeds the binary-variable limit "
            "for safe simulator execution."
        )
        return assessment

    if diagnostics.horizon > limits["maxHorizon"]:
        assessment["status"] = "too_large"
        assessment["reason"] = (
            "QAOA skipped because the candidate horizon is too large for the "
            "configured simulator budget."
        )
        return assessment

    if diagnostics.overlap_constraint_count > limits["maxOverlapConstraints"]:
        assessment["status"] = "too_large"
        assessment["reason"] = (
            "QAOA skipped because the resource-overlap search space is too large "
            "for the configured simulator budget."
        )
        return assessment

    return assessment


def solve_schedule_with_qaoa(
    problem: CanonicalProblem,
    *,
    qubo_diagnostics: SchedulingQuboDiagnostics | None = None,
    candidate_assessment: dict[str, Any] | None = None,
) -> SolverRunResult:
    diagnostics = qubo_diagnostics or estimate_scheduling_qubo_size(problem)
    assessment = candidate_assessment or assess_qaoa_candidate(
        problem,
        qubo_diagnostics=diagnostics,
    )

    if assessment["status"] != "eligible":
        return SolverRunResult(
            feasible=False,
            method="hybrid",
            solver="qaoa",
            backend="simulator",
            summary=assessment["reason"],
            diagnostics={"qaoa": assessment},
        )

    try:
        from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
        from qiskit_aer import AerSimulator
        from qiskit_aer.primitives import SamplerV2
        from qiskit_optimization.algorithms import MinimumEigenOptimizer
        from qiskit_optimization.minimum_eigensolvers import QAOA
        from qiskit_optimization.optimizers import SPSA
        from qiskit_optimization.utils import algorithm_globals
    except Exception as exc:
        return SolverRunResult(
            feasible=False,
            method="hybrid",
            solver="qaoa",
            backend="simulator",
            summary="QAOA dependencies are not installed in this environment yet.",
            diagnostics={"qaoa": assessment, "error": str(exc)},
        )

    try:
        quadratic_program, variable_map = build_scheduling_quadratic_program(problem)
    except Exception as exc:  # pragma: no cover - defensive path
        return SolverRunResult(
            feasible=False,
            method="hybrid",
            solver="qaoa",
            backend="simulator",
            summary="Qtangl could not translate the schedule into a QUBO model.",
            diagnostics={"qaoa": assessment, "error": str(exc)},
        )

    seed = int(os.getenv("QTANGL_QAOA_SEED", "1234"))
    reps = int(os.getenv("QTANGL_QAOA_REPS", "1"))
    maxiter = int(os.getenv("QTANGL_QAOA_MAXITER", "12"))
    shots = int(os.getenv("QTANGL_QAOA_SHOTS", "256"))
    simulator_method = os.getenv(
        "QTANGL_QAOA_SIMULATOR_METHOD", "matrix_product_state"
    )

    try:
        algorithm_globals.random_seed = seed
        simulator = AerSimulator(method=simulator_method)
        sampler = SamplerV2(seed=seed, default_shots=shots)
        pass_manager = generate_preset_pass_manager(
            optimization_level=1,
            backend=simulator,
            seed_transpiler=seed,
        )
        qaoa = QAOA(
            sampler=sampler,
            optimizer=SPSA(maxiter=maxiter),
            reps=reps,
            pass_manager=pass_manager,
        )
        result = MinimumEigenOptimizer(qaoa).solve(quadratic_program)
        assignments = _decode_assignments(problem, quadratic_program, variable_map, result)
    except Exception as exc:  # pragma: no cover - exercised only with installed deps
        return SolverRunResult(
            feasible=False,
            method="hybrid",
            solver="qaoa",
            backend="simulator",
            summary="The QAOA path did not return a usable result before the fallback window expired.",
            diagnostics={
                "qaoa": {
                    **assessment,
                    "status": "failed",
                    "simulatorMethod": simulator_method,
                    "seed": seed,
                    "shots": shots,
                    "reps": reps,
                    "maxiter": maxiter,
                },
                "error": str(exc),
            },
        )

    if not assignments:
        return SolverRunResult(
            feasible=False,
            method="hybrid",
            solver="qaoa",
            backend="simulator",
            summary="The QAOA path did not produce a complete feasible assignment.",
            diagnostics={"qaoa": assessment},
        )

    makespan_value = max(assignment.end_day - 1 for assignment in assignments)
    summary = (
        f"QAOA produced a feasible {len(problem.tasks)}-task schedule on the simulator "
        f"with no decoded task collisions."
    )

    return SolverRunResult(
        feasible=True,
        method="hybrid",
        solver="qaoa",
        backend="simulator",
        summary=summary,
        assignments=assignments,
        metrics={
            "makespanDays": makespan_value,
            "constraintViolations": 0,
            "savingsEstimate": "Research-only result: compare against the classical baseline before using in a pilot.",
        },
        visualization={
            "kind": "schedule",
            "title": "QAOA candidate plan",
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
        },
        score=makespan_value,
        diagnostics={
            "qaoa": {
                **assessment,
                "status": "used",
                "simulatorMethod": simulator_method,
                "seed": seed,
                "shots": shots,
                "reps": reps,
                "maxiter": maxiter,
                "resultFval": getattr(result, "fval", None),
            }
        },
    )


def _decode_assignments(
    problem: CanonicalProblem,
    quadratic_program: object,
    variable_map: dict[str, tuple[str, int, int | None]],
    result: object,
) -> list[TaskAssignment]:
    values: dict[str, int] = {}

    if hasattr(result, "variables_dict"):
        values = {
            str(name): int(round(value))
            for name, value in getattr(result, "variables_dict").items()
        }
    elif hasattr(result, "x"):
        raw_values = getattr(result, "x")
        variables = getattr(quadratic_program, "variables")
        values = {
            variable.name: int(round(raw_values[index]))
            for index, variable in enumerate(variables)
        }

    decoded: dict[str, TaskAssignment] = {}
    task_resources = {task.id: task.resource for task in problem.tasks}

    for variable_name, active_value in values.items():
        if active_value != 1 or variable_name not in variable_map:
            continue

        task_id, start, duration = variable_map[variable_name]
        decoded[task_id] = TaskAssignment(
            task=task_id,
            start_day=start + 1,
            end_day=start + (duration or 0) + 1,
            resource=task_resources.get(task_id),
        )

    if len(decoded) != len(problem.tasks):
        return []

    return sorted(decoded.values(), key=lambda assignment: (assignment.start_day, assignment.task))
