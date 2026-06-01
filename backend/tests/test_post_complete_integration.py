from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from app.monitoring.post_complete import enrich_completed_scan
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan


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


if __name__ == "__main__":
    unittest.main()
