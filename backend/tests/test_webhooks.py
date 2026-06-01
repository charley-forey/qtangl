from __future__ import annotations

import unittest
from unittest.mock import patch

from app.notifications.webhooks import _slack_payload, notify_scan_complete_v2


class WebhookV2Test(unittest.TestCase):
    def test_slack_payload_uses_alert_message(self) -> None:
        payload = {
            "event": "scan.complete",
            "scanId": "scan-123",
            "alerts": [{"message": "2 new quantum-vulnerable endpoints"}],
        }
        slack = _slack_payload(payload)
        self.assertIn("2 new quantum-vulnerable", slack["text"])
        self.assertIn("scan-123", slack["text"])

    def test_notify_scan_complete_v2_structure(self) -> None:
        with patch("app.notifications.webhooks.deliver_webhook") as mock_deliver:
            mock_deliver.return_value = {"sent": True, "statusCode": 200}
            results = notify_scan_complete_v2(
                webhooks=["https://example.com/hook"],
                scan_id="scan-abc",
                target_domain="api.example.com",
                readiness_score=61.8,
                readiness_band="at_risk",
                scan_diff={"readinessDelta": -4.2, "newQuantumVulnerable": [{"label": "x", "severity": "high"}]},
                alerts=[{"severity": "high", "message": "Regression detected"}],
                tenant_id="tenant-test",
            )
            self.assertEqual(len(results), 1)
            payload = mock_deliver.call_args[0][1]
            self.assertEqual(payload["schemaVersion"], "qtangl-webhook-v2")
            self.assertEqual(payload["tenantId"], "tenant-test")
            self.assertEqual(len(payload["topFindings"]), 1)


if __name__ == "__main__":
    unittest.main()
