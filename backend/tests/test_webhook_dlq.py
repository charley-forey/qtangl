from __future__ import annotations

import unittest
from unittest.mock import patch

from app.notifications.webhook_dlq import list_dead_letters, record_dead_letter


class WebhookDlqTest(unittest.TestCase):
    def test_in_memory_fallback_when_no_persistence(self) -> None:
        with patch("app.notifications.webhook_dlq.persistence_enabled", return_value=False):
            row = record_dead_letter(
                tenant_id="t1",
                url="https://example.com/hook",
                payload={"event": "scan.complete", "scanId": "s1", "tenantId": "t1"},
                reason="timeout",
            )
            self.assertEqual(row["tenantId"], "t1")
            items = list_dead_letters(tenant_id="t1")
            self.assertEqual(items, [])


if __name__ == "__main__":
    unittest.main()
