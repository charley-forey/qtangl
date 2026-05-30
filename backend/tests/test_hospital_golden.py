from __future__ import annotations

import json
import unittest
from pathlib import Path

from app.hospital.data import load_dataset
from app.hospital.pipeline import run_hospital_solve

GOLDEN_PATH = Path(__file__).resolve().parent / "fixtures" / "hospital_scoreboard_golden.json"


class HospitalGoldenSnapshotTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if not GOLDEN_PATH.exists():
            dataset = load_dataset()
            bundle = run_hospital_solve(
                dataset,
                scenario_id="callout-cath-acls",
                use_fixture=True,
                seed=1234,
            )
            payload = {
                "scenarioId": bundle.scenario.id,
                "classicalObjective": bundle.scoreboard.classical.objective,
                "hybridObjective": bundle.scoreboard.hybrid.objective,
                "hybridDistinctPlans": bundle.scoreboard.hybrid.distinct_plans,
                "hybridDiversityScore": bundle.scoreboard.hybrid.diversity_score,
                "successMetric": bundle.details["successMetric"]["successMetric"],
            }
            GOLDEN_PATH.parent.mkdir(parents=True, exist_ok=True)
            GOLDEN_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    def test_fixture_hybrid_scoreboard_matches_golden(self) -> None:
        golden = json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))
        dataset = load_dataset()
        bundle = run_hospital_solve(
            dataset,
            scenario_id=golden["scenarioId"],
            use_fixture=True,
            seed=1234,
        )
        self.assertEqual(bundle.scoreboard.hybrid.distinct_plans, golden["hybridDistinctPlans"])
        self.assertAlmostEqual(
            bundle.scoreboard.hybrid.diversity_score,
            golden["hybridDiversityScore"],
            places=3,
        )
        self.assertEqual(
            bundle.details["successMetric"]["successMetric"],
            golden["successMetric"],
        )


if __name__ == "__main__":
    unittest.main()
