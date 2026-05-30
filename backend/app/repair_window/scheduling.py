from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass

from app.models.canonical import CanonicalConstraint, CanonicalProblem
from app.models.results import SolverRunResult, TaskAssignment
from app.qubo.scheduling import SchedulingQuboDiagnostics, estimate_scheduling_qubo_size
from app.solvers.qaoa import assess_qaoa_candidate


@dataclass(slots=True)
class ExtractedSchedulingWindow:
    task_ids: list[str]
    strategy: str
    summary: str
    subproblem: CanonicalProblem
    qubo_diagnostics: SchedulingQuboDiagnostics
    assessment: dict
    reasons: list[str]


def extract_scheduling_repair_window(
    problem: CanonicalProblem,
    classical_result: SolverRunResult,
) -> ExtractedSchedulingWindow | None:
    """Find a QAOA-sized sub-problem around the classical critical path."""
    if not classical_result.feasible or not classical_result.assignments:
        return None

    full_diagnostics = estimate_scheduling_qubo_size(problem)
    full_assessment = assess_qaoa_candidate(problem, qubo_diagnostics=full_diagnostics)
    if full_assessment["status"] == "eligible":
        return ExtractedSchedulingWindow(
            task_ids=[task.id for task in problem.tasks],
            strategy="whole_job_research",
            summary=(
                "Full uploaded job is within QAOA research limits and is used as the quantum candidate."
            ),
            subproblem=problem,
            qubo_diagnostics=full_diagnostics,
            assessment=full_assessment,
            reasons=["Entire job fits configured QAOA binary-variable and horizon limits."],
        )

    assignment_map = {assignment.task: assignment for assignment in classical_result.assignments}
    critical_path = _critical_path_task_ids(problem, assignment_map)
    blocked_resources = _resources_with_blocked_days(problem)
    resource_to_tasks = _tasks_by_resource(problem)

    selected: set[str] = set(critical_path)
    for resource in blocked_resources:
        selected.update(resource_to_tasks.get(resource, []))

    selected = _expand_neighborhood(problem, selected, resource_to_tasks)
    selected = _shrink_to_qaoa_limits(problem, classical_result, selected, critical_path)
    if not selected:
        return None

    task_ids = sorted(selected, key=lambda task_id: assignment_map[task_id].start_day)
    subproblem = build_window_subproblem(problem, classical_result, task_ids)
    qubo_diagnostics = estimate_scheduling_qubo_size(subproblem)
    assessment = assess_qaoa_candidate(subproblem, qubo_diagnostics=qubo_diagnostics)
    if assessment["status"] != "eligible":
        return None

    return ExtractedSchedulingWindow(
        task_ids=task_ids,
        strategy="critical_path_neighborhood",
        summary=(
            f"Extracted a {len(task_ids)}-task local repair window from the classical plan "
            f"({len(critical_path)} critical-path tasks, QUBO binary vars="
            f"{qubo_diagnostics.binary_variable_count})."
        ),
        subproblem=subproblem,
        qubo_diagnostics=qubo_diagnostics,
        assessment=assessment,
        reasons=[
            "Seeded from the classical critical path and tasks tied to blocked resource days.",
            "Expanded one precedence hop and shared-resource neighbors, then shrunk to QAOA limits.",
        ],
    )


def build_window_subproblem(
    problem: CanonicalProblem,
    classical_result: SolverRunResult,
    window_task_ids: list[str],
) -> CanonicalProblem:
    """Build a sub-problem for QAOA; pin non-window tasks as resource blocks."""
    window_set = set(window_task_ids)
    tasks = [task for task in problem.tasks if task.id in window_set]
    constraints: list[CanonicalConstraint] = []

    for constraint in problem.constraints:
        if constraint.kind == "precedence":
            if constraint.subject in window_set and constraint.target in window_set:
                constraints.append(constraint)
        elif constraint.kind == "resource_unavailable":
            if constraint.subject and _resource_used_by_window(problem, constraint.subject, window_set):
                constraints.append(constraint)

    assignment_map = {assignment.task: assignment for assignment in classical_result.assignments}
    for task in problem.tasks:
        if task.id in window_set:
            continue
        assignment = assignment_map.get(task.id)
        if assignment is None or not task.resource:
            continue
        for day in range(assignment.start_day, assignment.end_day):
            constraints.append(
                CanonicalConstraint(
                    kind="resource_unavailable",
                    text=f"pinned assignment for {task.id}",
                    subject=task.resource,
                    day=day,
                    metadata={"pinnedTaskId": task.id},
                )
            )

    return CanonicalProblem(
        type="schedule",
        tasks=tasks,
        constraints=constraints,
        raw=problem.raw,
    )


def merge_window_assignments(
    classical_assignments: list[TaskAssignment],
    quantum_assignments: list[TaskAssignment],
    window_task_ids: list[str],
) -> list[TaskAssignment]:
    """Keep classical assignments outside the window; overlay quantum inside it."""
    window_set = set(window_task_ids)
    quantum_map = {assignment.task: assignment for assignment in quantum_assignments}
    merged: list[TaskAssignment] = []

    for assignment in classical_assignments:
        if assignment.task in window_set:
            replacement = quantum_map.get(assignment.task)
            if replacement is not None:
                merged.append(replacement)
            else:
                merged.append(assignment)
        else:
            merged.append(assignment)

    return sorted(merged, key=lambda item: (item.start_day, item.task))


def _critical_path_task_ids(
    problem: CanonicalProblem,
    assignment_map: dict[str, TaskAssignment],
) -> set[str]:
    predecessors = _predecessor_map(problem)
    makespan = max(assignment.end_day for assignment in assignment_map.values())

    critical: set[str] = {
        task_id
        for task_id, assignment in assignment_map.items()
        if assignment.end_day == makespan
    }

    if not critical:
        latest = max(assignment_map, key=lambda tid: assignment_map[tid].end_day)
        critical.add(latest)

    queue = deque(critical)
    seen = set(critical)
    while queue:
        task_id = queue.popleft()
        for pred in predecessors[task_id]:
            if pred_assignment := assignment_map.get(pred):
                if pred_assignment.end_day <= assignment_map[task_id].start_day and pred not in seen:
                    seen.add(pred)
                    critical.add(pred)
                    queue.append(pred)

    return critical


def _predecessor_map(problem: CanonicalProblem) -> dict[str, list[str]]:
    predecessors: dict[str, list[str]] = {task.id: [] for task in problem.tasks}
    for constraint in problem.constraints:
        if constraint.kind == "precedence" and constraint.subject and constraint.target:
            predecessors[constraint.target].append(constraint.subject)
    return predecessors


def _successor_map(problem: CanonicalProblem) -> dict[str, list[str]]:
    successors: dict[str, list[str]] = {task.id: [] for task in problem.tasks}
    for constraint in problem.constraints:
        if constraint.kind == "precedence" and constraint.subject and constraint.target:
            successors[constraint.subject].append(constraint.target)
    return successors


def _tasks_by_resource(problem: CanonicalProblem) -> dict[str, list[str]]:
    grouped: dict[str, list[str]] = defaultdict(list)
    for task in problem.tasks:
        if task.resource:
            grouped[task.resource].append(task.id)
    return grouped


def _resources_with_blocked_days(problem: CanonicalProblem) -> set[str]:
    return {
        constraint.subject
        for constraint in problem.constraints
        if constraint.kind == "resource_unavailable" and constraint.subject
    }


def _resource_used_by_window(
    problem: CanonicalProblem,
    resource: str,
    window_set: set[str],
) -> bool:
    return any(task.id in window_set and task.resource == resource for task in problem.tasks)


def _expand_neighborhood(
    problem: CanonicalProblem,
    selected: set[str],
    resource_to_tasks: dict[str, list[str]],
) -> set[str]:
    predecessors = _predecessor_map(problem)
    successors = _successor_map(problem)
    expanded = set(selected)

    for task_id in list(selected):
        for neighbor in predecessors[task_id] + successors[task_id]:
            expanded.add(neighbor)
        task = next(task for task in problem.tasks if task.id == task_id)
        if task.resource:
            for shared in resource_to_tasks.get(task.resource, []):
                expanded.add(shared)

    return expanded


def _shrink_to_qaoa_limits(
    problem: CanonicalProblem,
    classical_result: SolverRunResult,
    selected: set[str],
    critical_path: set[str],
) -> set[str]:
    assignment_map = {assignment.task: assignment for assignment in classical_result.assignments}
    candidates = set(selected)

    while candidates:
        task_ids = sorted(candidates, key=lambda task_id: assignment_map[task_id].start_day)
        subproblem = build_window_subproblem(problem, classical_result, task_ids)
        assessment = assess_qaoa_candidate(
            subproblem,
            qubo_diagnostics=estimate_scheduling_qubo_size(subproblem),
        )
        if assessment["status"] == "eligible":
            return candidates

        removable = [task_id for task_id in candidates if task_id not in critical_path]
        if not removable:
            if len(candidates) <= 1:
                return set()
            drop = min(candidates, key=lambda task_id: assignment_map[task_id].start_day)
        else:
            drop = max(
                removable,
                key=lambda task_id: (
                    _task_slack(task_id, assignment_map, _predecessor_map(problem)),
                    -assignment_map[task_id].start_day,
                ),
            )
        candidates.remove(drop)

    return set()


def _task_slack(
    task_id: str,
    assignment_map: dict[str, TaskAssignment],
    predecessors: dict[str, list[str]],
) -> int:
    assignment = assignment_map[task_id]
    earliest = 1
    for pred in predecessors[task_id]:
        earliest = max(earliest, assignment_map[pred].end_day)
    return max(0, assignment.start_day - earliest)
