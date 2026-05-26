from __future__ import annotations

from app.models.canonical import CanonicalProblem
from app.models.results import SolverRunResult
from app.solvers.classical import solve_schedule_classically
from app.solvers.qaoa import solve_schedule_with_qaoa


def run_optimization(problem: CanonicalProblem) -> SolverRunResult:
    if problem.type != "schedule":
        raise NotImplementedError(
            "This pilot API currently supports live schedule jobs. Routing and allocation are scaffolded next."
        )

    classical_result = solve_schedule_classically(problem)
    if not classical_result.feasible:
        return classical_result

    should_try_qaoa = len(problem.tasks) <= 3
    if not should_try_qaoa:
        return classical_result

    quantum_result = solve_schedule_with_qaoa(problem)
    if not quantum_result.feasible:
        return classical_result

    if quantum_result.score <= classical_result.score:
        return quantum_result

    return classical_result
