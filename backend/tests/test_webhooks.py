from __future__ import annotations

import hashlib
import hmac
import json
import unittest
from unittest.mock import patch

from app.notifications.webhooks import _slack_payload, deliver_webhook, is_slack_webhook, notify_scan_complete_v2


class WebhookV2Test(unittest.TestCase):
    def test_slack_webhook_requires_exact_https_host(self) -> None:
        for url in (
            "https://hooks.slack.com/services/test",
            "https://hooks.slack-gov.com/services/test",
            "https://HOOKS.SLACK.COM:443/services/test",
        ):
            with self.subTest(url=url):
                self.assertTrue(is_slack_webhook(url))
        for url in (
            "http://hooks.slack.com/services/test",
            "https://hooks.slack.com.evil.example/test",
            "https://evil.example/?hook=hooks.slack.com",
            "https://hooks.slack.com@evil.example/test",
            "https://user@hooks.slack.com/test",
            "https://hooks.slack.com:8443/test",
            "https://hooks.slack.com:invalid/test",
            "https://hooks.slack.\ncom/test",
            "https://[bad",
            "https:///hooks.slack.com",
            "hooks.slack.com/services/test",
            "",
        ):
            with self.subTest(url=url):
                self.assertFalse(is_slack_webhook(url))

    def test_briefing_transport_formats_slack_and_signs_actual_body(self) -> None:
        payload = {
            "event": "qros_morning_briefing",
            "headline": "Readiness improved.",
            "bullets": ["Review two alerts.", "Validate evidence.", None],
            "methodNote": "Inventory aid, not a formal audit.",
        }
        expected_text = (
            "Readiness improved.\nReview two alerts.\nValidate evidence.\n"
            "Inventory aid, not a formal audit."
        )
        for url, expected_body in (
            ("https://hooks.slack.com/services/test", {"text": expected_text}),
            ("https://hooks.slack-gov.com/services/test", {"text": expected_text}),
            ("https://example.com/?hook=hooks.slack.com", payload),
        ):
            with self.subTest(url=url), patch("app.notifications.webhooks.urllib.request.urlopen") as transport, patch(
                "app.notifications.webhooks.time.time", return_value=1234
            ):
                transport.return_value.__enter__.return_value.status = 200
                result = deliver_webhook(url, payload, signing_secret="test-secret", tenant_id="tenant-test")
                self.assertTrue(result["sent"])
                transport.assert_called_once()
                request = transport.call_args.args[0]
                self.assertEqual(request.full_url, url)
                self.assertEqual(json.loads(request.data), expected_body)
                self.assertEqual(request.get_method(), "POST")
                self.assertEqual(request.get_header("X-qtangl-timestamp"), "1234")
                signature = hmac.new(b"test-secret", b"1234." + request.data, hashlib.sha256).hexdigest()
                self.assertEqual(request.get_header("X-qtangl-signature"), f"sha256={signature}")

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
