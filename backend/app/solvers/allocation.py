from __future__ import annotations

from ortools.sat.python import cp_model

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult


def solve_allocation_classically(problem: CanonicalProblem) -> SolverRunResult:
    raw = problem.raw
    staff = list(raw.get("staff", []))
    shifts = list(raw.get("shifts", []))
    if not staff or not shifts:
        return SolverRunResult(
            feasible=False,
            method="classical",
            solver="cp-sat",
            backend="local",
            summary="Allocation requires at least one staff member and one shift.",
            metrics={"assignments": 0},
        )

    model = cp_model.CpModel()
    assignments: dict[tuple[int, int], cp_model.IntVar] = {}
    for s_index, _member in enumerate(staff):
        for h_index, _shift in enumerate(shifts):
            assignments[(s_index, h_index)] = model.new_bool_var(f"assign_{s_index}_{h_index}")

    for h_index, shift in enumerate(shifts):
        required_skill = shift.get("requiredSkill") or shift.get("required_skill")
        eligible = []
        for s_index, member in enumerate(staff):
            skills = set(member.get("skills", []))
            if required_skill is None or required_skill in skills:
                eligible.append(assignments[(s_index, h_index)])
        if eligible:
            model.add(sum(eligible) == 1)
        else:
            return SolverRunResult(
                feasible=False,
                method="classical",
                solver="cp-sat",
                backend="local",
                summary=f"No eligible staff for shift {shift.get('id', h_index)}.",
                metrics={"assignments": 0},
            )

    for s_index, member in enumerate(staff):
        max_hours = int(member.get("maxHours", raw.get("maxHoursPerStaff", 40)))
        max_shifts = max(1, max_hours // max(int(raw.get("shiftHours", 8)), 1))
        model.add(sum(assignments[(s_index, h_index)] for h_index in range(len(shifts))) <= max_shifts)

    model.maximize(sum(assignments.values()))

    solver = cp_model.CpSolver()
    status = solver.solve(model)
    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return SolverRunResult(
            feasible=False,
            method="classical",
            solver="cp-sat",
            backend="local",
            summary="CP-SAT could not assign staff to all shifts under the hour caps.",
            metrics={"assignments": 0},
            diagnostics={"status": solver.status_name(status)},
        )

    solution: list[dict[str, str]] = []
    for h_index, shift in enumerate(shifts):
        for s_index, member in enumerate(staff):
            if solver.value(assignments[(s_index, h_index)]) == 1:
                solution.append(
                    {
                        "shiftId": str(shift.get("id", f"shift-{h_index}")),
                        "staffName": str(member.get("name", f"staff-{s_index}")),
                        "requiredSkill": str(shift.get("requiredSkill") or ""),
                    }
                )

    summary = f"Assigned {len(solution)} shift(s) across {len(staff)} staff member(s)."
    return SolverRunResult(
        feasible=True,
        method="classical",
        solver="cp-sat",
        backend="local",
        summary=summary,
        solution=solution,
        metrics={"assignments": len(solution), "staffCount": len(staff), "shiftCount": len(shifts)},
        visualization={"kind": "allocation", "title": "Staff allocation", "summary": summary, "assignments": solution},
        score=len(solution),
        diagnostics={"status": solver.status_name(status)},
    )
