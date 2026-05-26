from __future__ import annotations

import os
from collections import defaultdict

from ortools.sat.python import cp_model

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult, TaskAssignment


def solve_schedule_classically(problem: CanonicalProblem) -> SolverRunResult:
    model = cp_model.CpModel()
    horizon = max(sum(task.duration for task in problem.tasks), 1)

    starts: dict[str, cp_model.IntVar] = {}
    ends: dict[str, cp_model.IntVar] = {}
    intervals: dict[str, cp_model.IntervalVar] = {}
    tasks_by_resource: dict[str, list[cp_model.IntervalVar]] = defaultdict(list)

    for task in problem.tasks:
        start = model.new_int_var(0, horizon, f"start_{task.id}")
        end = model.new_int_var(0, horizon, f"end_{task.id}")
        interval = model.new_interval_var(start, task.duration, end, f"interval_{task.id}")
        starts[task.id] = start
        ends[task.id] = end
        intervals[task.id] = interval

        if task.resource:
            tasks_by_resource[task.resource].append(interval)

    for constraint in problem.constraints:
        if constraint.kind == "precedence" and constraint.subject and constraint.target:
            model.add(starts[constraint.target] >= ends[constraint.subject])

        if constraint.kind == "resource_unavailable" and constraint.subject and constraint.day:
            unavailable_start = max(constraint.day - 1, 0)
            unavailable_interval = model.new_fixed_size_interval_var(
                unavailable_start,
                1,
                f"blocked_{constraint.subject}_{constraint.day}",
            )
            tasks_by_resource[constraint.subject].append(unavailable_interval)

    for resource_intervals in tasks_by_resource.values():
        if len(resource_intervals) > 1:
            model.add_no_overlap(resource_intervals)

    makespan = model.new_int_var(0, horizon, "makespan")
    model.add_max_equality(makespan, list(ends.values()))
    model.minimize(makespan)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(os.getenv("QTANGL_CLASSICAL_TIMEOUT_SECONDS", "5"))
    solver.parameters.num_search_workers = int(os.getenv("QTANGL_SOLVER_WORKERS", "8"))

    status = solver.solve(model)
    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return SolverRunResult(
            feasible=False,
            method="classical",
            solver="cp-sat",
            backend="local",
            summary="Qtangl could not produce a feasible schedule from the supplied constraints.",
            metrics={"constraintViolations": 1},
            diagnostics={"status": solver.status_name(status)},
        )

    assignments = sorted(
        [
            TaskAssignment(
                task=task.id,
                start_day=solver.value(starts[task.id]) + 1,
                end_day=solver.value(ends[task.id]) + 1,
                resource=task.resource,
            )
            for task in problem.tasks
        ],
        key=lambda item: (item.start_day, item.task),
    )
    makespan_value = solver.value(makespan)

    unavailable_constraints = [
        constraint for constraint in problem.constraints if constraint.kind == "resource_unavailable"
    ]
    precedence_constraints = [
        constraint for constraint in problem.constraints if constraint.kind == "precedence"
    ]

    summary_parts = [
        f"All {len(problem.tasks)} tasks were scheduled with no resource conflicts.",
    ]
    if precedence_constraints:
        summary_parts.append(
            f"{len(precedence_constraints)} dependency rule{'s' if len(precedence_constraints) != 1 else ''} remained satisfied."
        )
    if unavailable_constraints:
        summary_parts.append("Blocked resource windows were respected in the final plan.")

    metrics = {
        "makespanDays": makespan_value,
        "constraintViolations": 0,
        "savingsEstimate": _estimate_schedule_savings(problem, makespan_value),
    }

    visualization = {
        "kind": "schedule",
        "title": "Ranked plan",
        "summary": " ".join(summary_parts),
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

    return SolverRunResult(
        feasible=True,
        method="classical",
        solver="cp-sat",
        backend="local",
        summary=" ".join(summary_parts),
        assignments=assignments,
        metrics=metrics,
        visualization=visualization,
        score=makespan_value,
        diagnostics={"status": solver.status_name(status)},
    )


def _estimate_schedule_savings(problem: CanonicalProblem, makespan_days: int) -> str:
    blocked_days = sum(
        1 for constraint in problem.constraints if constraint.kind == "resource_unavailable"
    )
    rule_count = len(problem.constraints)

    estimated_hours = max(2, blocked_days * 6 + max(rule_count - 1, 0))
    return (
        f"Estimated {estimated_hours} hours saved versus manual resequencing for a "
        f"{makespan_days}-day plan."
    )
