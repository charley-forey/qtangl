from __future__ import annotations

import unittest

from app.ev_fleet.data import load_dataset
from app.ev_fleet.pipeline import run_ev_fleet_solve


class EvFleetPipelineTest(unittest.TestCase):
    def test_default_scenario_produces_scoreboard(self) -> None:
        bundle = run_ev_fleet_solve(load_dataset(), scenario_id="tou-peak-ca", use_fixture=True)
        self.assertGreater(len(bundle.classical_plan.slots), 0)
        self.assertGreaterEqual(len(bundle.hybrid_plans), 1)
        self.assertLess(
            bundle.scoreboard.hybrid.peak_kw or 999,
            bundle.scoreboard.manual.peak_kw or 0,
        )


if __name__ == "__main__":
    unittest.main()
