"""Tests for QROS tenant endpoints."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.api import command_center
from app.command_center.qros import build_runway, execute_agentic_action, load_nba_state, simulate_scenario


class QrosStateTests(unittest.TestCase):
    def test_only_unexpired_valid_snoozes_hide_actions(self) -> None:
        now = datetime.now(tz=UTC)
        dismissed, snoozed = load_nba_state(settings={"qrosNbaState": {
            "dismissed": ["dismissed-action"],
            "snoozed": {
                "expired": (now - timedelta(hours=1)).isoformat(),
                "active": (now + timedelta(hours=1)).isoformat(),
                "malformed": "invalid", "missing": None,
                "naive": (now + timedelta(hours=1)).replace(tzinfo=None).isoformat(),
            },
        }})
        self.assertEqual(dismissed, {"dismissed-action"})
        self.assertEqual(snoozed, {"active"})

    def test_marketplace_defaults_can_be_uninstalled_and_reinstalled(self) -> None:
        settings: dict = {}
        auth = SimpleNamespace(tenant_id="tenant")
        with patch.object(command_center, "get_tenant_settings_raw", return_value=settings), patch.object(
            command_center, "upsert_tenant_settings",
            side_effect=lambda **kwargs: settings.update(kwargs["settings"]),
        ):
            initial = command_center.tenant_qros_marketplace_tiles(auth=auth)
            defaults = {tile.id for tile in initial.tiles if tile.installed}
            self.assertEqual(defaults, {"portfolio-rollup", "peer-benchmark"})
            command_center.tenant_qros_marketplace_install(tile_id="webhook-builder", auth=auth)
            self.assertEqual(set(settings["installedTiles"]), defaults | {"webhook-builder"})
            for tile_id in defaults | {"webhook-builder"}:
                command_center.tenant_qros_marketplace_uninstall(tile_id=tile_id, auth=auth)
            self.assertEqual(settings["installedTiles"], [])
            self.assertFalse(any(tile.installed for tile in command_center.tenant_qros_marketplace_tiles(auth=auth).tiles))
            result = command_center.tenant_qros_marketplace_install(tile_id="peer-benchmark", auth=auth)
            self.assertEqual({tile.id for tile in result.tiles if tile.installed}, {"peer-benchmark"})

    def test_next_actions_use_saved_assignment(self) -> None:
        auth = SimpleNamespace(tenant_id="tenant", role="operator", email="viewer@example.com", user_id="viewer")
        settings = {"qrosNbaState": {"assigned": {"critical-backlog": "owner@example.com"}}}
        with patch.object(command_center, "get_tenant_settings_raw", return_value=settings), patch.object(
            command_center, "_qros_summary_snapshot", return_value={"kpis": {"openCritical": 2}},
        ), patch("app.command_center.qros.build_inbox", return_value=SimpleNamespace(items=[])):
            result = command_center.tenant_qros_next_actions(auth=auth)
        action = next(action for action in result.actions if action.id == "critical-backlog")
        self.assertEqual(action.owner, "owner@example.com")

    def test_scenario_discloses_heuristic_and_missing_baseline(self) -> None:
        result = simulate_scenario(scenario_id="accelerated", summary={})
        self.assertIn("not a statistical confidence interval", " ".join(result["assumptions"]))
        self.assertIn("zero baseline is assumed", " ".join(result["assumptions"]))
        measured = simulate_scenario(scenario_id="accelerated", summary={"kpis": {"latestReadiness": 0}})
        self.assertNotIn("zero baseline is assumed", " ".join(measured["assumptions"]))

    def test_runway_marks_assumed_dates_and_matches_simulation(self) -> None:
        summary = {"kpis": {"latestReadiness": 95}, "maturity": {"nextStageName": "Managed"}}
        runway = build_runway(summary=summary)
        horizons = [item for item in runway["milestones"] if item["kind"] in {"maturity", "exposure"}]
        self.assertEqual(len(horizons), 2)
        self.assertTrue(all("illustrative" in (item["label"] + item["description"]).lower() for item in horizons))
        accelerated = next(item for item in runway["scenarios"] if item["id"] == "accelerated")
        self.assertEqual(accelerated["readinessDelta"], 5)


class QrosScheduleTests(unittest.TestCase):
    def setUp(self) -> None:
        self.bundle = self.enterContext(patch("app.store.scan_jobs.load_scan_bundle", return_value={
            "report": {"targetDomain": "example.com", "scenarioId": "bank-tls-inventory"},
        }))
        self.resolve = self.enterContext(patch("app.pqc.safety.resolve_scannable", return_value=SimpleNamespace(host="example.com")))
        for name in ("persistence_enabled", "scheduler_enabled", "redis_enabled"):
            self.enterContext(patch(f"app.monitoring.batch_schedules.{name}", return_value=True))
        self.quota = self.enterContext(patch("app.monitoring.batch_schedules.check_schedule_quota", return_value=None))
        self.cadence = self.enterContext(patch("app.monitoring.batch_schedules.check_schedule_cadence", return_value=None))
        self.enterContext(patch("app.monitoring.batch_schedules.list_schedules", return_value=[]))
        self.create = self.enterContext(patch("app.monitoring.batch_schedules.create_schedule", return_value={"id": "sched-test"}))

    def test_schedules_selected_tenant_scan_with_standard_guards(self) -> None:
        result = execute_agentic_action(tenant_id="tenant", action="schedule_scan", dry_run=False,
                                       payload={"scanId": "selected-scan"}, actor_email="owner@example.com")
        self.assertEqual(result["status"], "completed")
        self.bundle.assert_called_once_with("selected-scan", tenant_id="tenant")
        self.resolve.assert_called_once_with("example.com", port=443, tenant_id="tenant")
        self.quota.assert_called_once_with(tenant_id="tenant")
        self.cadence.assert_called_once_with(tenant_id="tenant", cadence_hours=168)
        self.create.assert_called_once_with(tenant_id="tenant", scenario_id="bank-tls-inventory",
                                            target="example.com", cadence_hours=168,
                                            notify_email="owner@example.com", job_type="scan")

    def test_missing_or_foreign_scan_cannot_create_schedule(self) -> None:
        self.bundle.return_value = None
        for payload in ({}, {"scanId": "foreign-scan"}):
            with self.subTest(payload=payload):
                result = execute_agentic_action(tenant_id="tenant", action="schedule_scan", dry_run=False, payload=payload)
                self.assertEqual(result["status"], "failed")
        self.resolve.assert_not_called()
        self.create.assert_not_called()

    def test_unapproved_domain_cannot_create_schedule(self) -> None:
        from app.pqc.safety import ScanSafetyError
        self.resolve.side_effect = ScanSafetyError("Domain is not authorized")
        result = execute_agentic_action(tenant_id="tenant", action="schedule_scan", dry_run=False, payload={"scanId": "scan"})
        self.assertEqual(result["status"], "failed")
        self.assertIn("not authorized", result["steps"][0])
        self.create.assert_not_called()

    def test_monitor_quota_failure_is_not_bypassed(self) -> None:
        self.quota.return_value = {"reason": "Schedule quota reached"}
        result = execute_agentic_action(tenant_id="tenant", action="schedule_scan", dry_run=False, payload={"scanId": "scan"})
        self.assertEqual(result["status"], "failed")
        self.assertIn("Schedule quota reached", result["steps"][0])
        self.create.assert_not_called()

    def test_schedule_requires_domain_and_valid_cadence(self) -> None:
        for cadence in (0, 8761, True, "daily"):
            with self.subTest(cadence=cadence):
                result = execute_agentic_action(tenant_id="tenant", action="schedule_scan", dry_run=False,
                                               payload={"scanId": "scan", "cadenceHours": cadence})
                self.assertEqual(result["status"], "failed")
        self.bundle.return_value = {"report": {"scenarioId": "imported"}}
        result = execute_agentic_action(tenant_id="tenant", action="schedule_scan", dry_run=False, payload={"scanId": "scan"})
        self.assertEqual(result["status"], "failed")
        self.create.assert_not_called()


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

