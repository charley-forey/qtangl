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

    def test_icu_scenario_prefers_internal_ccrn_coverage(self) -> None:
        dataset = load_dataset()
        scenario = load_scenario("callout-icu-mass")

        result = solve_callout_classically(dataset, scenario)

        self.assertGreaterEqual(len(result.eligible_candidates), 3)
        self.assertEqual(result.selected_candidate.source, "classical")
        self.assertNotEqual(result.selected_candidate.nurse_id, "agency-backfill")

    def test_cath_local_scope_limits_search_to_home_ward(self) -> None:
        dataset = load_dataset()
        scenario = load_scenario("callout-cath-acls")

        self.assertEqual(scenario.classical_search_scope, "local")
        result = solve_callout_classically(dataset, scenario)

        self.assertEqual(result.selected_candidate.home_ward, "Cath Lab 2")
        self.assertTrue(
            all(candidate.home_ward == "Cath Lab 2" for candidate in result.eligible_candidates)
        )

    def test_or_scenario_prefers_internal_scrub_coverage(self) -> None:
        dataset = load_dataset()
        scenario = load_scenario("callout-or-late-add")

        result = solve_callout_classically(dataset, scenario)

        self.assertGreaterEqual(len(result.eligible_candidates), 3)
        self.assertEqual(result.selected_candidate.source, "classical")
        self.assertNotEqual(result.selected_candidate.nurse_id, "agency-backfill")


if __name__ == "__main__":
    unittest.main()
