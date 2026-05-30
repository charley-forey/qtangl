from __future__ import annotations

import unittest

from app.pqc.risk import assess_mosca


class PqcRiskTest(unittest.TestCase):
    def test_mosca_inequality_default_holds(self) -> None:
        mosca = assess_mosca(
            {"dataShelfLifeYears": 10, "migrationTimeYears": 5, "yearsToQDay": 12}
        )
        self.assertTrue(mosca.inequality_holds)

    def test_readiness_assessment_returns_band(self) -> None:
        from app.pqc.data import load_dataset
        from app.pqc.pipeline import run_pqc_scan
        from app.pqc.risk import readiness_assessment

        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        result = readiness_assessment(bundle.assets)
        self.assertIn(result["band"], {"Pre-migration baseline", "Partial readiness", "In progress", "PQC-ready"})
        self.assertGreater(result["score"], 0)


if __name__ == "__main__":
    unittest.main()
