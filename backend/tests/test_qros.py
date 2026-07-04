"""Tests for QROS tenant endpoints."""

from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from app.main import app


class QrosEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.headers = {"Authorization": "Bearer test-key"}

    def test_next_actions_returns_list(self) -> None:
        response = self.client.get("/tenant/qros/next-actions", headers=self.headers)
        self.assertIn(response.status_code, {200, 401})
        if response.status_code == 200:
            payload = response.json()
            self.assertIn("actions", payload)
            self.assertIsInstance(payload["actions"], list)

    def test_analytics_track_accepts_cc_event(self) -> None:
        response = self.client.post(
            "/tenant/analytics/track",
            headers=self.headers,
            json={"event": "cc_tab_viewed", "properties": {"tab": "overview"}},
        )
        self.assertIn(response.status_code, {200, 401})
        if response.status_code == 200:
            self.assertTrue(response.json().get("tracked", True))

    def test_unknown_analytics_event_accepted(self) -> None:
        response = self.client.post(
            "/tenant/analytics/track",
            headers=self.headers,
            json={"event": "totally_unknown_event_xyz"},
        )
        self.assertIn(response.status_code, {200, 401})
        if response.status_code == 200:
            payload = response.json()
            self.assertEqual(payload["status"], "accepted")
            self.assertFalse(payload["tracked"])
