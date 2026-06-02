from __future__ import annotations

import io
import unittest
from unittest.mock import patch

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

    def test_live_scan_rejected_when_disabled(self) -> None:
        with patch("app.api.pqc.live_scan_enabled", return_value=False):
            response = self.client.post(
                "/pqc/scan",
                headers=self.headers,
                json={"scenarioId": "bank-tls-inventory", "useFixture": False},
            )
        self.assertEqual(response.status_code, 403)
        self.assertIn("disabled", response.json()["detail"].lower())

    def test_live_scan_inline_returns_success_without_polling(self) -> None:
        from app.pqc.data import load_dataset
        from app.pqc.pipeline import run_pqc_scan

        dataset = load_dataset()
        bundle = run_pqc_scan(
            dataset,
            scenario_id="bank-tls-inventory",
            use_fixture=True,
        )
        with (
            patch("app.api.pqc.live_scan_enabled", return_value=True),
            patch("app.api.pqc.use_worker_queue", return_value=False),
            patch("app.api.pqc.run_pqc_scan", return_value=bundle),
        ):
            response = self.client.post(
                "/pqc/scan",
                headers=self.headers,
                json={"scenarioId": "bank-tls-inventory", "useFixture": False},
            )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("scoreboard", payload)
        self.assertTrue(payload.get("reportAvailable"))
        self.assertEqual(payload.get("scanOutcome"), "assets_found")

    def test_report_availability_for_fixture_scan(self) -> None:
        scan = self.client.post(
            "/pqc/scan",
            headers=self.headers,
            json={"scenarioId": "bank-tls-inventory", "useFixture": True},
        )
        self.assertEqual(scan.status_code, 200)
        scan_id = scan.json()["scanId"]

        availability = self.client.get(f"/pqc/report/{scan_id}/availability", headers=self.headers)
        self.assertEqual(availability.status_code, 200)
        payload = availability.json()
        self.assertTrue(payload["reportAvailable"])
        self.assertIn("pdf", payload["availableFormats"])

    def test_report_availability_missing_scan(self) -> None:
        availability = self.client.get("/pqc/report/scan-missing/availability", headers=self.headers)
        self.assertEqual(availability.status_code, 200)
        payload = availability.json()
        self.assertFalse(payload["reportAvailable"])
        self.assertEqual(payload["missingReason"], "scan_not_found")

    def test_persist_scan_bundle_makes_report_available(self) -> None:
        scan = self.client.post(
            "/pqc/scan",
            headers=self.headers,
            json={"scenarioId": "bank-tls-inventory", "useFixture": True},
        )
        self.assertEqual(scan.status_code, 200)
        body = scan.json()
        scan_id = body["scanId"]

        persist = self.client.post(f"/pqc/scan/{scan_id}/persist", headers=self.headers, json=body)
        self.assertEqual(persist.status_code, 200)
        self.assertTrue(persist.json().get("reportAvailable"))

        availability = self.client.get(f"/pqc/report/{scan_id}/availability", headers=self.headers)
        self.assertTrue(availability.json()["reportAvailable"])


if __name__ == "__main__":
    unittest.main()
