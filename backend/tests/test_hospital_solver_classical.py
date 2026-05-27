from __future__ import annotations

import unittest

from app.hospital.data import load_dataset, load_scenario
from app.hospital.solver_classical import solve_callout_classically


class HospitalClassicalSolverTest(unittest.TestCase):
    def test_classical_solver_returns_internal_candidate(self) -> None:
        dataset = load_dataset()
        scenario = load_scenario("callout-cath-acls")

        result = solve_callout_classically(dataset, scenario)

        self.assertEqual(result.solver_status, "OPTIMAL")
        self.assertGreaterEqual(len(result.eligible_candidates), 3)
        self.assertEqual(result.selected_candidate.source, "classical")
        self.assertEqual(result.selected_candidate.target_ward, "Cath Lab 2")
        self.assertLess(result.wall_time_seconds, 2.0)


if __name__ == "__main__":
    unittest.main()
