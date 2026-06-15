from __future__ import annotations

import unittest
from unittest.mock import Mock, patch

from qtangl._transport import Transport
from qtangl.errors import QtanglApiError


class TransportRetryTest(unittest.TestCase):
    def test_retries_retryable_status_then_succeeds(self) -> None:
        ok = Mock(status_code=200, headers={"content-type": "application/json"}, content=b'{"ok":true}')
        ok.json = Mock(return_value={"ok": True})
        fail = Mock(status_code=503, headers={}, text="unavailable")

        client = Mock()
        client.request = Mock(side_effect=[fail, ok])

        transport = Transport(base_url="https://api.example.com", api_key="key", client=client, max_retries=2)
        with patch("qtangl._transport.time.sleep"):
            payload = transport.request("GET", "/health/ready", auth=False)
        self.assertEqual(payload, {"ok": True})
        self.assertEqual(client.request.call_count, 2)

    def test_raises_typed_error(self) -> None:
        response = Mock(status_code=401, headers={"X-Request-Id": "req-1"}, text='{"detail":"Unauthorized"}')
        response.json = Mock(return_value={"detail": "Unauthorized"})

        client = Mock()
        client.request = Mock(return_value=response)
        transport = Transport(base_url="https://api.example.com", api_key="bad", client=client, max_retries=0)

        with self.assertRaises(QtanglApiError) as ctx:
            transport.request("GET", "/tenant/scans")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(ctx.exception.request_id, "req-1")
