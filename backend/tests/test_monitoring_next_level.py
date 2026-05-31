from __future__ import annotations

import unittest

from app.monitoring.alerts import evaluate_scan_alerts, should_send_regression_email
from app.monitoring.diff import compare_scan_bundles
from app.pqc.cloud_import import parse_cloud_inventory
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan


class ScanDiffTest(unittest.TestCase):
    def test_compare_detects_new_assets(self) -> None:
        current = {
            "assets": [
                {"host": "a.example", "port": 443, "kind": "tls", "algorithm": "RSA-2048", "id": "1", "label": "A", "vulnerability": {"status": "at-risk", "severity": "high"}},
                {"host": "b.example", "port": 443, "kind": "tls", "algorithm": "RSA-2048", "id": "2", "label": "B", "vulnerability": {"status": "at-risk", "severity": "high"}},
            ],
            "report": {"readinessScore": 40},
        }
        previous = {
            "assets": [
                {"host": "a.example", "port": 443, "kind": "tls", "algorithm": "RSA-2048", "id": "1", "label": "A", "vulnerability": {"status": "at-risk", "severity": "high"}},
            ],
            "report": {"readinessScore": 50},
        }
        diff = compare_scan_bundles(current, previous, previous_scan_id="scan-prev")
        self.assertEqual(diff["previousScanId"], "scan-prev")
        self.assertEqual(len(diff["newAssets"]), 1)
        self.assertEqual(diff["readinessDelta"], -10)

    def test_alerts_on_readiness_drop(self) -> None:
        diff = {"readinessDelta": -8, "newQuantumVulnerableCount": 0, "certExpiringCount": 0}
        alerts = evaluate_scan_alerts(scan_diff=diff, readiness_score=42, readiness_band="At risk")
        self.assertTrue(any(a["rule"] == "readiness_drop" for a in alerts))
        self.assertTrue(should_send_regression_email(alerts))


class CloudImportTest(unittest.TestCase):
    def test_parse_acm_json(self) -> None:
        text = '{"CertificateSummaryList": [{"DomainName": "api.bank.com", "KeyAlgorithm": "RSA-2048"}]}'
        rows = parse_cloud_inventory(text, filename="acm.json")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["host"], "api.bank.com")
        self.assertEqual(rows[0]["source"], "aws-acm")


class DiffIntegrationTest(unittest.TestCase):
    def test_two_fixture_scans_produce_diff_fields(self) -> None:
        dataset = load_dataset()
        first = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        second = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        from app.pqc.serialize import serialize_bundle

        diff = compare_scan_bundles(
            serialize_bundle(second),
            serialize_bundle(first),
            previous_scan_id=first.scan_id,
        )
        self.assertIn("summary", diff)


if __name__ == "__main__":
    unittest.main()
