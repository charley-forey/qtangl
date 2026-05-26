from __future__ import annotations

from app.models.api import OptimizeResponse
from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult


def build_optimize_response(
    problem: CanonicalProblem,
    result: SolverRunResult,
) -> OptimizeResponse:
    solution = [
        {
            "task": assignment.task,
            "startDay": assignment.start_day,
            "endDay": assignment.end_day,
            "resource": assignment.resource,
        }
        for assignment in result.assignments
    ]

    visualization = result.visualization or None
    if visualization and problem.type == "schedule":
        visualization.setdefault(
            "explanation",
            [
                "Dependencies are preserved in the returned order.",
                "Resource conflicts are removed before the plan is returned.",
                "The plan is shaped for a visual timeline as well as API consumers.",
            ],
        )
        visualization.setdefault("metrics", result.metrics)

    return OptimizeResponse(
        status="success",
        summary=result.summary,
        solution=solution if problem.type == "schedule" else result.assignments,
        metrics=result.metrics,
        method="hybrid" if result.method == "hybrid" else "classical",
        details={
            "solver": result.solver,
            "backend": result.backend,
            "diagnostics": result.diagnostics,
        },
        visualization=visualization,
    )
