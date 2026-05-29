from __future__ import annotations

import io
import unittest

from fastapi.testclient import TestClient

from app.main import app


class AirlineApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.headers = {"Authorization": "Bearer qtangl-demo-key"}

    def test_airline_solve_endpoint_returns_plans(self) -> None:
        response = self.client.post(
            "/airline/recover/solve",
            headers=self.headers,
            json={"scenarioId": "mx-hold-ord-0612", "useFixture": True},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("classicalPlan", payload)
        self.assertGreaterEqual(len(payload["hybridPlans"]), 1)
        self.assertIn("scoreboard", payload)

    def test_airline_upload_crew_endpoint_creates_session(self) -> None:
        response = self.client.post(
            "/airline/upload-crew",
            headers=self.headers,
            files={
                "file": (
                    "crew.csv",
                    io.BytesIO(
                        b"crew_id,qualifications,base,block_hours_week,last_duty_end,seniority_date\n"
                        b"crew-201,A320|ETOPS,KORD,36,2026-05-27T18:30:00,2021-09-14\n"
                    ),
                    "text/csv",
                )
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("sessionId", payload)


if __name__ == "__main__":
    unittest.main()
