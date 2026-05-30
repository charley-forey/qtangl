from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


class ClassicalSchedulingApiTest(unittest.TestCase):
    def test_schedule_request_returns_human_readable_response(self) -> None:
        client = TestClient(app)

        with patch.dict(os.environ, {"QTANGL_ENABLE_QAOA": "false"}):
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
        self.assertIn("details", payload)

    def test_qaoa_disabled_returns_classical_plan_with_diagnostics(self) -> None:
        client = TestClient(app)

        with patch.dict(os.environ, {"QTANGL_ENABLE_QAOA": "false"}):
            response = client.post(
                "/optimize",
                headers={"Authorization": "Bearer qtangl-demo-key"},
                json={
                    "type": "schedule",
                    "tasks": [
                        {"id": "a", "duration": 1, "crew": "Crew A"},
                        {"id": "b", "duration": 1, "crew": "Crew B"},
                    ],
                    "constraints": ["a must happen before b"],
                },
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["method"], "classical")
        self.assertEqual(
            payload["details"]["diagnostics"]["qaoa"]["status"], "disabled"
        )
        self.assertEqual(
            payload["details"]["diagnostics"]["orchestration"]["localRepairWindow"],
            "not_used",
        )

    def test_large_job_uses_local_repair_window_when_qaoa_enabled(self) -> None:
        client = TestClient(app)

        with patch.dict(os.environ, {"QTANGL_ENABLE_QAOA": "true"}):
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
        self.assertIn(payload["method"], {"classical", "hybrid"})
        orchestration = payload["details"]["diagnostics"]["orchestration"]
        self.assertIn(
            orchestration["localRepairWindow"],
            {"not_found", "used", "kept_classical", "classical_fallback"},
        )
        if orchestration["localRepairWindow"] == "not_found":
            self.assertEqual(
                payload["details"]["diagnostics"]["qaoa"]["status"],
                "no_local_window",
            )
        else:
            self.assertNotEqual(orchestration.get("strategy"), "whole_problem_smoke")
            self.assertIn("taskIds", orchestration)
            self.assertIn("quboDiagnostics", orchestration)


if __name__ == "__main__":
    unittest.main()
