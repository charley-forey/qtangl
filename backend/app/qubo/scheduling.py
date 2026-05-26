from __future__ import annotations

from collections import defaultdict
from dataclasses import asdict, dataclass

from docplex.mp.model import Model
from qiskit_optimization.translators import from_docplex_mp

from app.models.canonical import CanonicalProblem


@dataclass(slots=True)
class SchedulingQuboDiagnostics:
    task_count: int
    horizon: int
    precedence_count: int
    binary_variable_count: int
    overlap_constraint_count: int
    max_allowed_starts_per_task: int
    blocked_resource_days: int

    def as_dict(self) -> dict[str, int]:
        return asdict(self)


def build_scheduling_quadratic_program(problem: CanonicalProblem) -> tuple[object, dict[str, tuple[str, int, int | None]]]:
    horizon = max(sum(task.duration for task in problem.tasks), 1)
    model = Model(name="qtangl_schedule")

    blocked_days_by_resource, precedence_pairs = _collect_schedule_structure(problem)

    start_vars: dict[tuple[str, int], object] = {}
    variable_map: dict[str, tuple[str, int, int | None]] = {}
    makespan = model.integer_var(lb=0, ub=horizon, name="makespan")

    for task in problem.tasks:
        allowed_starts: list[int] = []
        latest_start = horizon - task.duration

        for start in range(latest_start + 1):
            if task.resource and _overlaps_blocked_day(
                start,
                task.duration,
                blocked_days_by_resource[task.resource],
            ):
                continue

            var = model.binary_var(name=f"x_{task.id}_{start}")
            start_vars[(task.id, start)] = var
            variable_map[var.name] = (task.id, start, task.duration)
            allowed_starts.append(start)

        if not allowed_starts:
            raise ValueError(
                f"No feasible start window exists for task '{task.id}'. Check duration or blocked-day constraints."
            )

        model.add_constraint(
            model.sum(start_vars[(task.id, start)] for start in allowed_starts) == 1,
            ctname=f"choose_{task.id}",
        )

        start_expr = model.sum(start * start_vars[(task.id, start)] for start in allowed_starts)
        model.add_constraint(makespan >= start_expr + task.duration, ctname=f"finish_{task.id}")

    for before_task, after_task in precedence_pairs:
        before = next(task for task in problem.tasks if task.id == before_task)
        before_starts = [start for task_id, start in start_vars if task_id == before_task]
        after_starts = [start for task_id, start in start_vars if task_id == after_task]

        before_expr = model.sum(
            start * start_vars[(before_task, start)] for start in before_starts
        )
        after_expr = model.sum(
            start * start_vars[(after_task, start)] for start in after_starts
        )
        model.add_constraint(after_expr >= before_expr + before.duration, ctname=f"precede_{before_task}_{after_task}")

    tasks_by_resource: dict[str, list[tuple[str, int]]] = defaultdict(list)
    for task in problem.tasks:
        if task.resource:
            task_starts = [start for task_id, start in start_vars if task_id == task.id]
            tasks_by_resource[task.resource].append((task.id, task.duration))

    for resource, task_entries in tasks_by_resource.items():
        del resource
        for index, (task_a, duration_a) in enumerate(task_entries):
            for task_b, duration_b in task_entries[index + 1 :]:
                starts_a = [start for task_id, start in start_vars if task_id == task_a]
                starts_b = [start for task_id, start in start_vars if task_id == task_b]

                for start_a in starts_a:
                    for start_b in starts_b:
                        overlap = start_a < start_b + duration_b and start_b < start_a + duration_a
                        if overlap:
                            model.add_constraint(
                                start_vars[(task_a, start_a)] + start_vars[(task_b, start_b)] <= 1,
                                ctname=f"no_overlap_{task_a}_{start_a}_{task_b}_{start_b}",
                            )

    model.minimize(makespan)
    return from_docplex_mp(model), variable_map


def estimate_scheduling_qubo_size(problem: CanonicalProblem) -> SchedulingQuboDiagnostics:
    horizon = max(sum(task.duration for task in problem.tasks), 1)
    blocked_days_by_resource, precedence_pairs = _collect_schedule_structure(problem)

    binary_variable_count = 0
    max_allowed_starts_per_task = 0
    overlap_constraint_count = 0
    tasks_by_resource: dict[str, list[tuple[str, int, list[int]]]] = defaultdict(list)

    for task in problem.tasks:
        allowed_starts = [
            start
            for start in range(horizon - task.duration + 1)
            if not (
                task.resource
                and _overlaps_blocked_day(
                    start,
                    task.duration,
                    blocked_days_by_resource[task.resource],
                )
            )
        ]

        binary_variable_count += len(allowed_starts)
        max_allowed_starts_per_task = max(max_allowed_starts_per_task, len(allowed_starts))

        if task.resource:
            tasks_by_resource[task.resource].append((task.id, task.duration, allowed_starts))

    for task_entries in tasks_by_resource.values():
        for index, (_, duration_a, starts_a) in enumerate(task_entries):
            for _, duration_b, starts_b in task_entries[index + 1 :]:
                overlap_constraint_count += sum(
                    1
                    for start_a in starts_a
                    for start_b in starts_b
                    if start_a < start_b + duration_b and start_b < start_a + duration_a
                )

    return SchedulingQuboDiagnostics(
        task_count=len(problem.tasks),
        horizon=horizon,
        precedence_count=len(precedence_pairs),
        binary_variable_count=binary_variable_count,
        overlap_constraint_count=overlap_constraint_count,
        max_allowed_starts_per_task=max_allowed_starts_per_task,
        blocked_resource_days=sum(len(days) for days in blocked_days_by_resource.values()),
    )


def _overlaps_blocked_day(start: int, duration: int, blocked_days: set[int]) -> bool:
    if not blocked_days:
        return False

    task_days = set(range(start, start + duration))
    return any(day in task_days for day in blocked_days)


def _collect_schedule_structure(
    problem: CanonicalProblem,
) -> tuple[dict[str, set[int]], list[tuple[str, str]]]:
    blocked_days_by_resource: dict[str, set[int]] = defaultdict(set)
    precedence_pairs: list[tuple[str, str]] = []

    for constraint in problem.constraints:
        if constraint.kind == "resource_unavailable" and constraint.subject and constraint.day:
            blocked_days_by_resource[constraint.subject].add(max(constraint.day - 1, 0))
        if constraint.kind == "precedence" and constraint.subject and constraint.target:
            precedence_pairs.append((constraint.subject, constraint.target))

    return blocked_days_by_resource, precedence_pairs
