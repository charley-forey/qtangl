from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from app.main import app


class ClassicalSchedulingApiTest(unittest.TestCase):
    def test_schedule_request_returns_human_readable_response(self) -> None:
        client = TestClient(app)

        response = client.post(
            "/optimize",
            headers={"Authorization": "Bearer qtangl-demo-key"},
            json={
                "type": "schedule",
                "tasks": [
                    {"id": "foundation", "duration": 3, "crew": "Crew A"},
                    {"id": "framing", "duration": 4, "crew": "Crew B"},
                    {"id": "inspection", "duration": 1, "crew": "Inspector"},
                ],
                "constraints": [
                    "foundation must finish before framing",
                    "inspection must happen after framing",
                ],
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("summary", payload)
        self.assertEqual(payload["method"], "classical")
        self.assertEqual(len(payload["solution"]), 3)
        self.assertIn("metrics", payload)


if __name__ == "__main__":
    unittest.main()
