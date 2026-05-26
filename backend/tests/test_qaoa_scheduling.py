from __future__ import annotations

import importlib.util
import os
import unittest
from unittest.mock import patch

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
            ],
            constraints=[
                "a must happen before b",
            ],
        )

        problem = parse_schedule_request(request)

        with patch.dict(
            os.environ,
            {
                "QTANGL_ENABLE_QAOA": "true",
                "QTANGL_QAOA_MAX_BINARY_VARIABLES": "8",
                "QTANGL_QAOA_MAX_HORIZON": "4",
                "QTANGL_QAOA_MAX_OVERLAP_CONSTRAINTS": "8",
                "QTANGL_QAOA_REPS": "1",
                "QTANGL_QAOA_MAXITER": "4",
                "QTANGL_QAOA_SHOTS": "64",
            },
        ):
            result = solve_schedule_with_qaoa(problem)

        self.assertIsNotNone(result.summary)
        self.assertEqual(result.method, "hybrid")
        self.assertTrue(result.feasible)
        self.assertEqual(result.diagnostics["qaoa"]["status"], "used")


if __name__ == "__main__":
    unittest.main()
