from __future__ import annotations

import json
import unittest

from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.report import report_to_json, report_to_pdf

SCENARIO_IDS = (
    "bank-tls-inventory",
    "gov-contractor-cmmc",
    "healthcare-insurer-hndl",
)


class PqcComplianceReportTest(unittest.TestCase):
    def test_all_scenarios_include_compliance_pack(self) -> None:
        dataset = load_dataset()
        for scenario_id in SCENARIO_IDS:
            with self.subTest(scenario=scenario_id):
                bundle = run_pqc_scan(dataset, scenario_id=scenario_id, use_fixture=True)
                body = report_to_json(bundle.report)
                self.assertEqual(body["scenarioId"], scenario_id)
                pack = body["compliancePack"]
                self.assertEqual(pack["packId"], scenario_id)
                self.assertGreaterEqual(len(pack["primaryFrameworks"]), 2)
                self.assertGreaterEqual(len(pack["controlThemes"]), 2)
                self.assertGreaterEqual(len(pack["mappedStandardsFromScan"]), 1)

    def test_mosca_assessment_prominent_in_json(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="healthcare-insurer-hndl", use_fixture=True)
        body = report_to_json(bundle.report)
        mosca = body["moscaAssessment"]
        self.assertIn("headline", mosca)
        self.assertIn("formula", mosca)
        self.assertIn("hndlRiskLevel", mosca)
        self.assertIn("interpretation", mosca)
        self.assertIn("inequalityHolds", mosca)
        self.assertIn("summary", body["mosca"])

    def test_handshake_appendix_in_json_and_pdf(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        body = report_to_json(bundle.report)
        appendix = body["handshakeAppendix"]
        self.assertIn("title", appendix)
        self.assertIn("clientHelloExcerpt", appendix)
        self.assertIn("hybridGroup", appendix)
        self.assertEqual(appendix["mode"], "fixture")
        self.assertIn("readinessBand", body)
        self.assertIn("scanCoverage", body)

        pdf_bytes = report_to_pdf(bundle.report)
        self.assertGreater(len(pdf_bytes), 100)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))


if __name__ == "__main__":
    unittest.main()
