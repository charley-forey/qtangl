from __future__ import annotations

import importlib.util
import unittest

from app.models.api import OptimizeRequest
from app.parsers.scheduling import parse_schedule_request
from app.solvers.qaoa import solve_schedule_with_qaoa


@unittest.skipUnless(
    importlib.util.find_spec("qiskit_optimization") is not None,
    "qiskit-optimization is not installed",
)
class QaoaSchedulingSmokeTest(unittest.TestCase):
    def test_qaoa_path_does_not_crash_on_small_problem(self) -> None:
        request = OptimizeRequest(
            type="schedule",
            tasks=[
                {"id": "a", "duration": 1, "crew": "Crew A"},
                {"id": "b", "duration": 1, "crew": "Crew B"},
                {"id": "c", "duration": 1, "crew": "Crew A"},
            ],
            constraints=[
                "a must happen before b",
                "b must happen before c",
            ],
        )

        problem = parse_schedule_request(request)
        result = solve_schedule_with_qaoa(problem)

        self.assertIsNotNone(result.summary)
        self.assertIn(result.method, {"hybrid"})


if __name__ == "__main__":
    unittest.main()
