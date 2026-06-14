from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from app.monitoring.post_complete import enrich_completed_scan
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.serialize import serialize_bundle
from app.pqc.signing import verify_report_signature


class PostCompleteIntegrationTest(unittest.TestCase):
    def test_failed_webhook_records_dlq(self) -> None:
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        bundle.report.target_domain = "example.com"

        with patch("app.monitoring.post_complete.find_previous_scan", return_value=None):
            with patch("app.monitoring.post_complete.active_webhook_urls", return_value=["https://bad.example/hook"]):
                with patch("app.tenant.settings.get_tenant_settings", return_value={}):
                    with patch("app.notifications.webhooks.deliver_webhook", return_value={"sent": False, "reason": "HTTP 500"}) as deliver:
                        enrich_completed_scan(bundle.scan_id, bundle, tenant_id="t1")
                        deliver.assert_called()
                        self.assertEqual(deliver.call_args.kwargs.get("tenant_id"), "t1")

    def test_enriched_report_verifies_after_storage_roundtrip(self) -> None:
        """Regression: the signed payload must equal the persisted report body so the
        public verify link recomputes a matching content hash. Previously enrichment
        signed an augmented payload (aggregatedCbomSummary / peerComparison) that was
        never stored, so dogfood verify failed with "Content hash mismatch"."""
        dataset = load_dataset()
        bundle = run_pqc_scan(
            dataset,
            scenario_id="bank-tls-inventory",
            use_fixture=True,
            target_override="www.qtangl.com",
        )
        aggregate = {
            "componentCount": 7,
            "totalStored": 7,
            "readiness": {"verifiedPct": 42.0},
            "sources": [{"id": "a"}],
            "openConflicts": 0,
        }
        with patch("app.monitoring.post_complete.find_previous_scan", return_value=None), \
            patch("app.cbom.service.get_aggregate", return_value=aggregate), \
            patch("app.tenant.settings.get_tenant_settings_raw", return_value={}), \
            patch("app.monitoring.post_complete.active_webhook_urls", return_value=[]):
            enrich_completed_scan(bundle.scan_id, bundle, tenant_id="dogfood")

        stored = serialize_bundle(bundle)
        report_json = stored["report"]
        signature = report_json.get("signature") or {}
        verify_payload = {k: v for k, v in report_json.items() if k != "signature"}
        result = verify_report_signature(verify_payload, signature)

        self.assertTrue(result.get("valid"), msg=f"verification failed: {result}")
        # Supplementary aggregate must live in the bundle envelope, not the signed body.
        self.assertNotIn("aggregatedCbomSummary", report_json)
        self.assertIn("aggregatedCbomSummary", bundle.details)

    def test_run_pqc_scan_honors_provided_scan_id(self) -> None:
        """The async worker passes the job id into run_pqc_scan so the bundle, report,
        persisted row, poll response, and verify link all share one id."""
        dataset = load_dataset()
        bundle = run_pqc_scan(
            dataset,
            scenario_id="bank-tls-inventory",
            use_fixture=True,
            scan_id="scan-fixed-test-id",
        )
        self.assertEqual(bundle.scan_id, "scan-fixed-test-id")
        self.assertEqual(bundle.report.scan_id, "scan-fixed-test-id")


if __name__ == "__main__":
    unittest.main()
