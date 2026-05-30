from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from app.models.canonical import CanonicalConstraint, CanonicalProblem, CanonicalTask
from app.models.results import TaskAssignment, SolverRunResult
from app.pipeline import (
    build_local_quantum_candidate,
    detect_local_repair_window,
    merge_local_repair,
    run_global_classical,
)
from app.repair_window.scheduling import extract_scheduling_repair_window
from app.solvers.classical import solve_schedule_classically


def _ten_task_problem(*, blocked_day: int | None = 3) -> CanonicalProblem:
    tasks = [
        CanonicalTask(id=f"task-{index}", duration=1, resource=f"crew-{index % 3}")
        for index in range(10)
    ]
    constraints: list[CanonicalConstraint] = []
    for index in range(9):
        constraints.append(
            CanonicalConstraint(
                kind="precedence",
                text=f"task-{index} before task-{index + 1}",
                subject=f"task-{index}",
                target=f"task-{index + 1}",
            )
        )
    if blocked_day is not None:
        constraints.append(
            CanonicalConstraint(
                kind="resource_unavailable",
                text=f"crew-1 unavailable on day {blocked_day}",
                subject="crew-1",
                day=blocked_day,
            )
        )
    return CanonicalProblem(type="schedule", tasks=tasks, constraints=constraints)


class SchedulingRepairWindowExtractorTest(unittest.TestCase):
    def test_extracts_bounded_window_for_ten_task_fixture(self) -> None:
        problem = _ten_task_problem()
        classical = solve_schedule_classically(problem)
        self.assertTrue(classical.feasible)

        with patch.dict(
            os.environ,
            {
                "QTANGL_ENABLE_QAOA": "true",
                "QTANGL_QAOA_MAX_BINARY_VARIABLES": "12",
                "QTANGL_QAOA_MAX_HORIZON": "12",
                "QTANGL_QAOA_MAX_OVERLAP_CONSTRAINTS": "24",
            },
        ):
            extracted = extract_scheduling_repair_window(problem, classical)

        self.assertIsNotNone(extracted)
        assert extracted is not None
        self.assertLessEqual(len(extracted.task_ids), 8)
        self.assertEqual(extracted.strategy, "critical_path_neighborhood")
        self.assertLessEqual(
            extracted.qubo_diagnostics.binary_variable_count,
            12,
        )

    def test_large_job_uses_extractor_not_whole_problem_smoke(self) -> None:
        problem = CanonicalProblem(
            type="schedule",
            tasks=[
                CanonicalTask(id="foundation", duration=3, resource="crew-a"),
                CanonicalTask(id="framing", duration=4, resource="crew-b"),
                CanonicalTask(id="inspection", duration=1, resource="inspector"),
            ],
            constraints=[
                CanonicalConstraint(
                    kind="precedence",
                    text="foundation before framing",
                    subject="foundation",
                    target="framing",
                ),
                CanonicalConstraint(
                    kind="precedence",
                    text="framing before inspection",
                    subject="framing",
                    target="inspection",
                ),
            ],
        )
        classical = run_global_classical(problem)

        with patch.dict(os.environ, {"QTANGL_ENABLE_QAOA": "true"}):
            window = detect_local_repair_window(problem, classical)

        if window is not None:
            self.assertNotEqual(window.strategy, "whole_problem_smoke")
            self.assertIn(
                window.strategy,
                {"critical_path_neighborhood", "whole_job_research"},
            )
            self.assertIn("qubo", window.diagnostics)
            self.assertIn("windowTaskCount", window.diagnostics)
        else:
            orchestration = classical.diagnostics["orchestration"]
            self.assertEqual(orchestration["localRepairWindow"], "not_found")

    def test_merge_pins_non_window_assignments(self) -> None:
        from app.pipeline import LocalQuantumCandidate, LocalRepairWindow
        from app.qubo.scheduling import estimate_scheduling_qubo_size
        from app.solvers.qaoa import assess_qaoa_candidate

        classical = SolverRunResult(
            feasible=True,
            method="classical",
            solver="cp-sat",
            backend="local",
            summary="classical",
            assignments=[
                TaskAssignment(task="a", start_day=1, end_day=2, resource="crew-a"),
                TaskAssignment(task="b", start_day=2, end_day=4, resource="crew-b"),
                TaskAssignment(task="c", start_day=4, end_day=5, resource="crew-c"),
            ],
            score=4,
        )
        quantum = SolverRunResult(
            feasible=True,
            method="hybrid",
            solver="qaoa",
            backend="simulator",
            summary="quantum",
            assignments=[
                TaskAssignment(task="b", start_day=3, end_day=5, resource="crew-b"),
            ],
            score=4,
            diagnostics={"qaoa": {"status": "used"}},
        )
        problem = CanonicalProblem(
            type="schedule",
            tasks=[
                CanonicalTask(id="b", duration=2, resource="crew-b"),
            ],
            constraints=[],
        )
        qubo = estimate_scheduling_qubo_size(problem)
        candidate = LocalQuantumCandidate(
            problem=problem,
            repair_window=LocalRepairWindow(
                strategy="critical_path_neighborhood",
                summary="test window",
                task_ids=["b"],
                diagnostics={"qubo": qubo.as_dict()},
            ),
            qubo_diagnostics=qubo,
            assessment=assess_qaoa_candidate(problem, qubo_diagnostics=qubo),
        )
        merged = merge_local_repair(classical, quantum, candidate)

        assignment_map = {item.task: item for item in merged.assignments}
        self.assertEqual(assignment_map["a"].start_day, 1)
        self.assertEqual(assignment_map["c"].start_day, 4)
        self.assertEqual(assignment_map["b"].start_day, 3)
        self.assertTrue(
            merged.diagnostics["orchestration"]["nonWindowAssignmentsPinned"]
        )


if __name__ == "__main__":
    unittest.main()
