from __future__ import annotations

import unittest
from unittest.mock import patch

from app.monitoring.service import due_schedules, scheduler_enabled
from app.notifications.email import send_report_email, smtp_configured
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.references import framework_url, glossary_for_report
from app.remediation.service import completion_pct, upsert_remediation_status
from app.pqc.signing import sign_report_payload, verify_report_signature
from app.pqc.report import report_to_json
from app.pqc.migration_roadmap import build_migration_roadmap
from app.pqc.explain import explain_asset
from app.pqc.report_bundle import build_evidence_bundle


class ReferencesTest(unittest.TestCase):
    def test_framework_url_nist_ir_8547(self) -> None:
        url = framework_url("nist-ir-8547")
        self.assertIn("nist.gov", url)

    def test_glossary_not_empty(self) -> None:
        self.assertGreater(len(glossary_for_report()), 5)


class SigningTest(unittest.TestCase):
    def test_sign_and_verify_round_trip(self) -> None:
        payload = {"scanId": "scan-test", "readinessScore": 42}
        signed = sign_report_payload(payload)
        self.assertIn("contentHash", signed)
        result = verify_report_signature(payload, signed)
        self.assertTrue(result.get("valid") or signed.get("alg") == "none")


class EmailTest(unittest.TestCase):
    def test_email_noop_when_unconfigured(self) -> None:
        with patch.dict("os.environ", {}, clear=True):
            self.assertFalse(smtp_configured())
            result = send_report_email(
                to_email="test@example.com",
                scan_id="scan-1",
                target_domain="example.com",
                report_url="https://example.com/report",
            )
            self.assertFalse(result["sent"])
            self.assertEqual(result["reason"], "smtp_unconfigured")


class RemediationTest(unittest.TestCase):
    def test_completion_pct(self) -> None:
        statuses = [{"status": "done"}, {"status": "open"}]
        self.assertEqual(completion_pct(statuses, 2), 50.0)

    def test_upsert_in_memory_mode(self) -> None:
        item = upsert_remediation_status(
            tenant_id="sandbox",
            scan_id="scan-1",
            remediation_id="rem-1",
            status="in_progress",
        )
        self.assertEqual(item["status"], "in_progress")


class SchedulerTest(unittest.TestCase):
    def test_scheduler_disabled_by_default(self) -> None:
        with patch.dict("os.environ", {}, clear=True):
            self.assertFalse(scheduler_enabled())


class ReportSignatureIntegrationTest(unittest.TestCase):
    def test_fixture_report_has_signature(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        self.assertIsNotNone(bundle.report.signature)
        json_payload = report_to_json(bundle.report)
        self.assertIn("signature", json_payload)

    def test_lite_scan_caps_findings(self) -> None:
        dataset = load_dataset()
        full = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True, depth="standard")
        lite = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True, depth="lite")
        self.assertLessEqual(len(lite.assets), len(full.assets))
        self.assertEqual(lite.report.scan_depth, "lite")

    def test_migration_roadmap_from_backlog(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        roadmap = build_migration_roadmap(
            bundle.assets,
            bundle.remediation_backlog,
            dataset.deadlines,
        )
        self.assertGreater(len(roadmap), 0)

    def test_explain_asset_returns_plain_language(self) -> None:
        dataset = load_dataset()
        asset = dataset.inventory[0]
        line = explain_asset(asset)
        self.assertIsInstance(line, str)
        self.assertGreater(len(line), 10)

    def test_evidence_bundle_is_zip(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        content = build_evidence_bundle(bundle.report)
        self.assertGreater(len(content), 100)
        self.assertEqual(content[:2], b"PK")

    def test_verify_post_round_trip(self) -> None:
        payload = {"scanId": "scan-post", "readinessScore": 55}
        signed = sign_report_payload(payload)
        report_json = {**payload, "signature": signed}
        result = verify_report_signature(payload, signed)
        self.assertTrue(result.get("valid") or signed.get("alg") == "none")
        self.assertEqual(report_json["signature"]["contentHash"], signed["contentHash"])

    def test_signing_key_stable_across_calls(self) -> None:
        p1 = sign_report_payload({"scanId": "k1", "readinessScore": 1})
        p2 = sign_report_payload({"scanId": "k2", "readinessScore": 2})
        if p1.get("alg") == "none":
            self.skipTest("signing unavailable")
        self.assertEqual(p1.get("keyFingerprint"), p2.get("keyFingerprint"))


if __name__ == "__main__":
    unittest.main()
