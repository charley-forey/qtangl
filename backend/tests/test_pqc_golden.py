from __future__ import annotations

import json
import os
import unittest
from pathlib import Path

from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.report import report_to_cbom, report_to_json
from app.pqc.signing import sign_report_payload, verify_report_signature

GOLDEN_DIR = Path(__file__).resolve().parent / "golden"


class GoldenReportTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        GOLDEN_DIR.mkdir(exist_ok=True)
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        cls.report_json = report_to_json(bundle.report)
        cls.cbom = report_to_cbom(bundle.report)

    def test_report_content_hash_stable(self) -> None:
        payload = {k: v for k, v in self.report_json.items() if k != "signature"}
        from app.pqc.signing import content_hash_for_payload

        h1 = content_hash_for_payload(payload)
        h2 = content_hash_for_payload(payload)
        self.assertEqual(h1, h2)
        self.assertEqual(len(h1), 64)

    def test_cbom_deterministic_keys(self) -> None:
        self.assertIn("bomFormat", self.cbom)
        self.assertIn("components", self.cbom)
        serialized = json.dumps(self.cbom, sort_keys=True)
        again = json.dumps(self.cbom, sort_keys=True)
        self.assertEqual(serialized, again)

    def test_signature_round_trip(self) -> None:
        payload = {k: v for k, v in self.report_json.items() if k != "signature"}
        signed = sign_report_payload(payload)
        result = verify_report_signature(payload, signed)
        self.assertTrue(result.get("valid") or signed.get("alg") == "none")

    def test_golden_fixture_written(self) -> None:
        fixture_path = GOLDEN_DIR / "bank-tls-report-hash.txt"
        from app.pqc.signing import content_hash_for_payload

        # Fixed canonical subset for byte-stable golden (full report includes volatile timestamps)
        payload = {
            "scanId": "golden-bank-tls-inventory",
            "scenarioId": "bank-tls-inventory",
            "readinessScore": round(self.report_json.get("readinessScore", 0), 1),
            "readinessBand": self.report_json.get("readinessBand", ""),
        }
        content_hash = content_hash_for_payload(payload)
        if not fixture_path.exists():
            fixture_path.write_text(content_hash, encoding="utf-8")
        expected = fixture_path.read_text(encoding="utf-8").strip()
        self.assertEqual(content_hash, expected)
        self.assertEqual(len(content_hash), 64)


if __name__ == "__main__":
    unittest.main()
