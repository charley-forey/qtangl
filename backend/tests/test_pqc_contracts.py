from __future__ import annotations

import json
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

CONTRACTS = Path(__file__).resolve().parents[1] / "contracts"


class PqcContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.headers = {"Authorization": "Bearer qtangl-demo-key"}
        self.request_schema = json.loads((CONTRACTS / "pqc-scan-request.schema.json").read_text())
        self.response_schema = json.loads((CONTRACTS / "pqc-scan-response.schema.json").read_text())

    def test_scan_response_matches_contract_shape(self) -> None:
        response = self.client.post(
            "/pqc/scan",
            headers=self.headers,
            json={"scenarioId": "bank-tls-inventory", "useFixture": True},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn(payload["status"], self.response_schema["properties"]["status"]["enum"])
        self.assertIn("scanId", payload)
        self.assertIn("assets", payload)

    def test_verify_response_shape(self) -> None:
        response = self.client.get("/pqc/transparency/root")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("log", payload)

    def test_transparency_keys_endpoint(self) -> None:
        response = self.client.get("/pqc/transparency/keys")
        self.assertEqual(response.status_code, 200)
        self.assertIn("keys", response.json())

    def test_cbom_ingest_endpoint(self) -> None:
        fixture_path = Path(__file__).resolve().parent / "fixtures" / "keyfactor-sample-cbom-16.json"
        document = json.loads(fixture_path.read_text(encoding="utf-8"))
        response = self.client.post(
            "/pqc/cbom/ingest",
            headers=self.headers,
            json={"document": document, "sourceLabel": "Keyfactor test"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertTrue(payload.get("ok"))
        self.assertGreaterEqual(payload.get("componentCount", 0), 1)


if __name__ == "__main__":
    unittest.main()
