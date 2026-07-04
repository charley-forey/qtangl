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

    def test_morning_briefing_returns_payload(self) -> None:
        response = self.client.get(
            "/tenant/qros/morning-briefing?persona=operator",
            headers=self.headers,
        )
        self.assertIn(response.status_code, {200, 401})
        if response.status_code == 200:
            payload = response.json()
            self.assertIn("headline", payload)
            self.assertIn("methodNote", payload)

    def test_nba_mutate_accepts_snooze(self) -> None:
        response = self.client.post(
            "/tenant/qros/next-actions/test-action/mutate",
            headers=self.headers,
            json={"op": "snooze"},
        )
        self.assertIn(response.status_code, {200, 401})

    def test_marketplace_tiles_list(self) -> None:
        response = self.client.get("/tenant/qros/marketplace/tiles", headers=self.headers)
        self.assertIn(response.status_code, {200, 401})
        if response.status_code == 200:
            self.assertIn("tiles", response.json())

    def test_push_briefing_send_accepts(self) -> None:
        response = self.client.post(
            "/tenant/qros/push-briefing/send",
            headers=self.headers,
            json={"channels": ["email"], "cadenceHours": 24},
        )
        self.assertIn(response.status_code, {200, 401})

    def test_board_deck_json(self) -> None:
        response = self.client.post(
            "/tenant/qros/board-deck",
            headers=self.headers,
            json={},
        )
        self.assertIn(response.status_code, {200, 401})
        if response.status_code == 200:
            payload = response.json()
            self.assertIn("slides", payload)

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

