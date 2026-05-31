from __future__ import annotations

import unittest

from app.pqc.compliance_packs import SCENARIO_PACKS
from app.pqc.report import report_to_executive


class ExecutiveExportTest(unittest.TestCase):
    def test_vertical_compliance_packs_defined(self) -> None:
        self.assertIn("bank-tls-inventory", SCENARIO_PACKS)
        self.assertIn("gov-contractor-cmmc", SCENARIO_PACKS)
        self.assertIn("healthcare-insurer-hndl", SCENARIO_PACKS)

    def test_report_to_executive_shape(self) -> None:
        from app.pqc.models import MigrationReport, MoscaAssessment

        report = MigrationReport(
            scan_id="scan-test",
            scenario_id="bank-tls-inventory",
            target_domain="api.example.com",
            generated_at="2026-01-01T00:00:00Z",
            readiness_score=72,
            readiness_band="Moderate",
            coverage_confidence=0.9,
            mosca=MoscaAssessment(
                data_shelf_life_years=10,
                migration_time_years=5,
                years_to_q_day=12,
                inequality_holds=True,
                summary="Migration runway exceeds shelf life.",
            ),
            assets=[],
            remediation_backlog=[],
            standards_summary=[],
            honesty_notes=[],
            compliance_pack={"title": "Bank pack"},
        )
        payload = report_to_executive(report)
        self.assertEqual(payload["scanId"], "scan-test")
        self.assertIn("verifyUrl", payload)
        self.assertEqual(payload["readinessScore"], 72)


if __name__ == "__main__":
    unittest.main()
