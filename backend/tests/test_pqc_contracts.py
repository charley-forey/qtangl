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

    def test_request_schema_allows_fixture_scan(self) -> None:
        props = self.request_schema.get("properties", {})
        self.assertIn("scenarioId", props)
        self.assertIn("useFixture", props)


if __name__ == "__main__":
    unittest.main()
