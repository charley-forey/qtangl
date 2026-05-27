from __future__ import annotations

import io
import unittest

from fastapi.testclient import TestClient

from app.main import app


class HospitalApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.headers = {"Authorization": "Bearer qtangl-demo-key"}

    def test_hospital_solve_endpoint_returns_candidates(self) -> None:
        response = self.client.post(
            "/hospital/callout/solve",
            headers=self.headers,
            json={"scenarioId": "callout-cath-acls", "useFixture": True},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertEqual(len(payload["hybridCandidates"]), 3)
        self.assertIn("scoreboard", payload)

    def test_hospital_upload_roster_endpoint_creates_session(self) -> None:
        response = self.client.post(
            "/hospital/upload-roster",
            headers=self.headers,
            files={
                "file": (
                    "roster.csv",
                    io.BytesIO(
                        b"nurse_id,certifications,ward,week_hours,last_shift_end,seniority_date\n"
                        b"nurse-201,ACLS|PALS|BLS,Cath Lab 2,36,2026-05-25T18:30:00,2021-09-14\n"
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
