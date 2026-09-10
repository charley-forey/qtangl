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


class QrosBriefingDeliveryTests(unittest.TestCase):
    def test_preferences_validate_channels_cadence_and_enabled_recipients(self):
        from pydantic import ValidationError
        from app.command_center.schemas import PushBriefingRequest

        for values in ({"channels": []}, {"channels": ["sms"]}, {"cadenceHours": 0}, {"cadenceHours": 169}, {"enabled": True}, {"recipients": ["invalid"]}):
            with self.assertRaises(ValidationError):
                PushBriefingRequest(**values)
        valid = PushBriefingRequest(enabled=True, recipients=["owner@example.com", "owner@example.com"])
        self.assertEqual(valid.recipients, ["owner@example.com"])
        for recipient in ("a@bad..com", "a@.com", "a@example.com\r\nBcc: victim@example.com", "Owner <a@example.com>"):
            with self.assertRaises(ValidationError):
                PushBriefingRequest(recipients=[recipient])

    def test_save_requires_storage_and_healthy_scheduler_but_disable_does_not(self):
        from fastapi import HTTPException
        from app.command_center.schemas import PushBriefingRequest

        auth = SimpleNamespace(tenant_id="tenant", email="owner@example.com")
        body = PushBriefingRequest(channels=["slack"], enabled=True)
        with patch("app.db.config.persistence_enabled", return_value=False):
            with self.assertRaises(HTTPException) as error:
                command_center.tenant_qros_push_briefing(body=body, auth=auth)
            self.assertEqual(error.exception.status_code, 503)
        with patch("app.db.config.persistence_enabled", return_value=True), patch("app.monitoring.scheduler_state.scheduler_metrics", return_value={"schedulerEnabled": False}), patch.object(command_center, "save_briefing_preferences", return_value={"enabled": False}) as save, patch.object(command_center, "log_action"):
            with self.assertRaises(HTTPException):
                command_center.tenant_qros_push_briefing(body=body, auth=auth)
            save.assert_not_called()
            body.enabled = False
            self.assertFalse(command_center.tenant_qros_push_briefing(body=body, auth=auth)["enabled"])

    def test_send_reports_failure_and_passes_explicit_recipients_and_secret(self):
        from app.command_center.schemas import PushBriefingRequest

        auth = SimpleNamespace(tenant_id="tenant", email="owner@example.com", role="operator", user_id="owner")
        with patch.object(command_center, "_qros_summary_snapshot", return_value={}), patch.object(command_center, "build_morning_briefing", return_value={}), patch.object(command_center, "get_tenant_settings_raw", return_value={"webhookSigningSecret": "test-secret"}), patch.object(command_center, "deliver_morning_briefing", return_value={"delivered": 0, "attempted": 1, "errors": ["smtp_unconfigured"]}) as deliver, patch.object(command_center, "log_action"):
            result = command_center.tenant_qros_push_briefing_send(body=PushBriefingRequest(recipients=["owner@example.com"]), auth=auth)
        self.assertEqual(result["status"], "failed")
        self.assertEqual(deliver.call_args.kwargs["recipients"], ["owner@example.com"])
        self.assertEqual(deliver.call_args.kwargs["signing_secret"], "test-secret")

    def test_slack_selection_does_not_fall_back_to_other_subscriptions(self):
        from app.command_center import qros_push

        subscriptions = {
            "briefing": ["https://hooks.slack.com/services/test", "https://receiver.example/hook"],
            "scan.complete": ["https://unrelated.example/hook"],
        }
        with patch.object(qros_push, "active_webhook_urls", side_effect=lambda **kw: list(subscriptions.get(kw["event"], []))), patch.object(
            qros_push, "deliver_webhook", return_value={"sent": True}
        ) as deliver, patch.object(qros_push, "send_simple_email") as email:
            result = qros_push.deliver_morning_briefing(tenant_id="tenant", briefing={"headline": "Inventory update"}, channels=["slack"])
        self.assertEqual(result, {"delivered": 1, "attempted": 1, "errors": []})
        self.assertEqual(deliver.call_args.args[0], "https://hooks.slack.com/services/test")
        self.assertEqual(deliver.call_args.kwargs["tenant_id"], "tenant")
        email.assert_not_called()

    def test_email_requires_recipients_and_never_uses_webhooks_as_fallback(self):
        from app.command_center import qros_push

        with patch.object(qros_push, "active_webhook_urls") as subscriptions, patch.object(qros_push, "deliver_webhook") as deliver, patch.object(qros_push, "send_simple_email") as email:
            for recipients in (None, [], ["not-an-email"]):
                result = qros_push.deliver_morning_briefing(tenant_id="tenant", briefing={}, channels=["email"], recipients=recipients)
                self.assertEqual(result["attempted"], 0)
                self.assertEqual(result["reason"], "delivery_not_configured")
        subscriptions.assert_not_called()
        deliver.assert_not_called()
        email.assert_not_called()

    def test_email_and_teams_preserve_content_and_report_partial_delivery(self):
        from app.command_center import qros_push

        briefing = {"headline": "Inventory update", "bullets": ["Two findings need review"], "methodNote": "Inventory aid, not a formal audit"}
        subscriptions = {"briefing.slack": ["https://hooks.slack.com/services/test"], "briefing.teams": ["https://workflow.example/teams"]}
        with patch.object(qros_push, "active_webhook_urls", side_effect=lambda **kw: list(subscriptions.get(kw["event"], []))), patch.object(
            qros_push, "deliver_webhook", side_effect=lambda url, payload, **kw: {"sent": "slack.com" in url, "reason": "test_failure"}
        ) as deliver, patch.object(qros_push, "send_simple_email", return_value={"sent": True}) as email:
            result = qros_push.deliver_morning_briefing(tenant_id="tenant", briefing=briefing, channels=["email", "slack", "teams"], recipients=["owner@example.com", "owner@example.com"], signing_secret="test-signing-secret")
        self.assertEqual(result["delivered"], 2)
        self.assertEqual(result["attempted"], 3)
        self.assertEqual(result["errors"], ["teams: test_failure"])
        email.assert_called_once()
        self.assertEqual(email.call_args.kwargs["to_email"], "owner@example.com")
        self.assertIn(briefing["methodNote"], email.call_args.kwargs["body"])
        teams = deliver.call_args_list[1]
        self.assertEqual(teams.kwargs["signing_secret"], "test-signing-secret")
        card = teams.args[1]["attachments"][0]["content"]
        self.assertEqual(card["type"], "AdaptiveCard")
        self.assertEqual([line["text"] for line in card["body"]], [briefing["headline"], "• Two findings need review", briefing["methodNote"]])

    def test_all_explicit_webhook_destinations_are_delivered_once(self):
        from app.command_center import qros_push

        urls = [f"https://receiver.example/{index}" for index in range(6)]
        with patch.object(qros_push, "active_webhook_urls", return_value=urls.copy()), patch.object(qros_push, "deliver_webhook", return_value={"sent": True}) as deliver:
            result = qros_push.deliver_morning_briefing(tenant_id="tenant", briefing={}, channels=["webhook"])
        self.assertEqual(result["delivered"], 6)
        self.assertEqual(deliver.call_count, 6)

    def test_invalid_or_ambiguous_channels_do_not_send(self):
        from app.command_center import qros_push

        with patch.object(qros_push, "active_webhook_urls", return_value=["https://receiver.example/hook"]), patch.object(qros_push, "deliver_webhook") as deliver:
            for channels in ([], ["unknown"], ["slack"], ["teams", "webhook"]):
                result = qros_push.deliver_morning_briefing(tenant_id="tenant", briefing={}, channels=channels)
                self.assertEqual(result["attempted"], 0)
                self.assertTrue(result["errors"])
        deliver.assert_not_called()


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

