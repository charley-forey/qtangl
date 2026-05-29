from __future__ import annotations

import io
import unittest

from fastapi.testclient import TestClient

from app.main import app


class PqcApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.headers = {"Authorization": "Bearer qtangl-demo-key"}

    def test_inventory_endpoint(self) -> None:
        response = self.client.get("/pqc/inventory", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertGreater(len(payload["inventory"]), 0)

    def test_scan_fixture_endpoint(self) -> None:
        response = self.client.post(
            "/pqc/scan",
            headers=self.headers,
            json={"scenarioId": "bank-tls-inventory", "useFixture": True},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("scoreboard", payload)
        self.assertIn("handshakeProof", payload)

    def test_upload_bundle_csv(self) -> None:
        response = self.client.post(
            "/pqc/upload-bundle",
            headers=self.headers,
            files={
                "file": (
                    "bundle.csv",
                    io.BytesIO(b"host,port,kind,label\napi.example.com,443,tls,API\n"),
                    "text/csv",
                )
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("sessionId", response.json())


if __name__ == "__main__":
    unittest.main()
