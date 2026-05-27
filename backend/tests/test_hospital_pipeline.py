from __future__ import annotations

import unittest

from app.hospital.data import load_dataset
from app.hospital.pipeline import run_hospital_solve


class HospitalPipelineTest(unittest.TestCase):
    def test_pipeline_returns_three_hybrid_alternates_with_fixture(self) -> None:
        dataset = load_dataset()

        result = run_hospital_solve(dataset, scenario_id="callout-cath-acls", use_fixture=True)

        self.assertEqual(result.scenario.id, "callout-cath-acls")
        self.assertEqual(len(result.hybrid_candidates), 3)
        self.assertEqual(result.scoreboard.hybrid.objective, result.scoreboard.classical.objective)
        self.assertEqual(result.scoreboard.manual.distinct_plans, 1)
        self.assertGreaterEqual(len(result.audit_packs), 3)


if __name__ == "__main__":
    unittest.main()
