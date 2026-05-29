from __future__ import annotations

import io
import unittest

from fastapi.testclient import TestClient

from app.main import app


class EvFleetApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.headers = {"Authorization": "Bearer qtangl-demo-key"}

    def test_depot_endpoint(self) -> None:
        response = self.client.get("/ev-fleet/depot", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertGreater(len(payload["vehicles"]), 0)

    def test_solve_all_scenarios(self) -> None:
        for scenario_id in ("tou-peak-ca", "demand-charge-spike", "driver-dropout-rewindow"):
            response = self.client.post(
                "/ev-fleet/plan/solve",
                headers=self.headers,
                json={"scenarioId": scenario_id, "useFixture": True},
            )
            self.assertEqual(response.status_code, 200, scenario_id)
            payload = response.json()
            self.assertGreaterEqual(len(payload["classicalPlan"]["slots"]), 1)
            self.assertGreaterEqual(len(payload["hybridPlans"]), 1)

    def test_upload_fleet_creates_session(self) -> None:
        response = self.client.post(
            "/ev-fleet/upload-fleet",
            headers=self.headers,
            files={
                "file": (
                    "fleet.csv",
                    io.BytesIO(
                        b"vehicle_id,battery_kwh,efficiency_kwh_per_km,start_soc_kwh,connector_type,dispatch_deadline\n"
                        b"veh-999,75,0.28,20,J1772,2026-05-29T05:30:00\n"
                    ),
                    "text/csv",
                )
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("sessionId", response.json())


if __name__ == "__main__":
    unittest.main()
