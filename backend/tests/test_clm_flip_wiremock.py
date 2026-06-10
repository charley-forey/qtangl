"""WireMock-style CLM flip integration tests (stub endpoints)."""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch


class VenafiWireMockTests(unittest.TestCase):
    @patch("httpx.Client")
    def test_venafi_request_success(self, mock_client_cls: MagicMock) -> None:
        from app.integrations.clm_flip import VenafiFlipAdapter

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"Guid": "venafi-req-123"}
        mock_client = MagicMock()
        mock_client.__enter__.return_value = mock_client
        mock_client.post.return_value = mock_resp
        mock_client_cls.return_value = mock_client

        adapter = VenafiFlipAdapter()
        result = adapter.request_certificate(
            config={"baseUrl": "https://venafi.example", "apiKey": "key"},
            request={"domain": "app.example.com", "policyId": "PQC-Policy"},
        )
        self.assertEqual(result.get("status"), "pending")
        self.assertEqual(result.get("requestId"), "venafi-req-123")


class DigiCertWireMockTests(unittest.TestCase):
    @patch("httpx.post")
    def test_digicert_order_success(self, mock_post: MagicMock) -> None:
        from app.integrations.clm_flip import DigiCertFlipAdapter

        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = {"id": "order-456"}
        mock_post.return_value = mock_resp

        adapter = DigiCertFlipAdapter()
        result = adapter.order_certificate(
            config={"apiKey": "dc-key"},
            request={"commonName": "tls.example.com", "profileId": "hybrid-pqc"},
        )
        self.assertEqual(result.get("status"), "pending")
        self.assertEqual(result.get("orderId"), "order-456")
