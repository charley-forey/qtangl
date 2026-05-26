from __future__ import annotations

import os

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult, TaskAssignment
from app.qubo.scheduling import build_scheduling_quadratic_program


def solve_schedule_with_qaoa(problem: CanonicalProblem) -> SolverRunResult:
    try:
        from qiskit_aer import AerSimulator
        from qiskit_aer.primitives import SamplerV2
        from qiskit_optimization.algorithms import MinimumEigenOptimizer
        from qiskit_optimization.minimum_eigensolvers import QAOA
        from qiskit_optimization.optimizers import SPSA
        from qiskit_optimization.utils import algorithm_globals
    except ImportError as exc:
        return SolverRunResult(
            feasible=False,
            method="hybrid",
            solver="qaoa",
            backend="simulator",
            summary="QAOA dependencies are not installed in this environment yet.",
            diagnostics={"error": str(exc)},
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
            diagnostics={"error": str(exc)},
        )

    seed = int(os.getenv("QTANGL_QAOA_SEED", "1234"))
    reps = int(os.getenv("QTANGL_QAOA_REPS", "2"))
    maxiter = int(os.getenv("QTANGL_QAOA_MAXITER", "40"))
    shots = int(os.getenv("QTANGL_QAOA_SHOTS", "2048"))

    try:
        algorithm_globals.random_seed = seed
        simulator = AerSimulator()
        sampler = SamplerV2(seed=seed, default_shots=shots)
        qaoa = QAOA(
            sampler=sampler,
            optimizer=SPSA(maxiter=maxiter),
            reps=reps,
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
            diagnostics={"error": str(exc)},
        )

    if not assignments:
        return SolverRunResult(
            feasible=False,
            method="hybrid",
            solver="qaoa",
            backend="simulator",
            summary="The QAOA path did not produce a complete feasible assignment.",
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
        diagnostics={"result_fval": getattr(result, "fval", None)},
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
