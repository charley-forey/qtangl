from __future__ import annotations

import unittest

from app.airline.data import load_dataset
from app.airline.pipeline import run_airline_solve


class AirlinePipelineTest(unittest.TestCase):
    def test_pipeline_returns_plans_and_audit(self) -> None:
        bundle = run_airline_solve(
            load_dataset(),
            scenario_id="mx-hold-ord-0612",
            use_fixture=True,
        )
        self.assertEqual(bundle.classical_plan.source, "classical")
        self.assertGreaterEqual(len(bundle.classical_plan.assignments), 1)
        self.assertGreaterEqual(len(bundle.hybrid_plans), 1)
        self.assertGreaterEqual(len(bundle.audit_packs), 1)
        self.assertGreaterEqual(len(bundle.timeline), 4)


if __name__ == "__main__":
    unittest.main()
