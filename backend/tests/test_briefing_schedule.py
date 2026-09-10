from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.command_center import briefing_schedule as scheduler
from app.command_center import qros_push
from app.db.base import Base
from app.db.models import ScheduleRunLog, Tenant, TenantSettings
from app.security.secrets import decrypt_json_blob, encrypt_json_blob
from app.tenant import settings as tenant_settings


@pytest.fixture
def schedule(tmp_path, monkeypatch):
    from cryptography.fernet import Fernet

    monkeypatch.setenv("QTANGL_SECRETS_KEY", Fernet.generate_key().decode())
    engine = create_engine(f"sqlite:///{tmp_path / 'briefings.db'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)

    @contextmanager
    def session_scope():
        with Session(engine) as session:
            with session.begin():
                yield session

    monkeypatch.setattr(scheduler, "db_session", session_scope)
    monkeypatch.setattr("app.db.engine.db_session", session_scope)
    monkeypatch.setattr(tenant_settings, "db_session", session_scope)
    monkeypatch.setattr(scheduler, "persistence_enabled", lambda: True)
    monkeypatch.setattr(tenant_settings, "persistence_enabled", lambda: True)
    monkeypatch.setattr(scheduler, "scheduler_enabled", lambda: True)
    monkeypatch.setattr(qros_push, "build_briefing_for_tenant", lambda **kw: {"headline": "Inventory briefing"}, raising=False)
    from unittest.mock import Mock

    delivery = Mock(return_value={"delivered": 2, "attempted": 2, "errors": []})
    monkeypatch.setattr(qros_push, "deliver_morning_briefing", delivery)
    now = datetime(2026, 9, 10, 12, tzinfo=timezone.utc)
    config = {
        "channels": ["webhook"], "recipients": [], "cadenceHours": 24, "enabled": True,
        "revision": str(uuid4()), "firstRunAt": now.isoformat(),
    }
    with session_scope() as session:
        session.add(Tenant(id="briefing-tenant", name="Briefing test"))
        session.add(TenantSettings(tenant_id="briefing-tenant", settings_json=encrypt_json_blob({
            "pushBriefing": config, "webhookSigningSecret": "test-secret", "unrelated": "keep",
        })))

    def save(changes):
        with session_scope() as session:
            row = session.get(TenantSettings, "briefing-tenant")
            data = decrypt_json_blob(row.settings_json)
            data["pushBriefing"].update(changes)
            row.settings_json = encrypt_json_blob(data)

    yield now, config, delivery, session_scope, save
    engine.dispose()


def test_cadence_restart_missed_slots_and_settings_preserved(schedule):
    now, config, delivery, sessions, _ = schedule
    with sessions() as session:
        original = session.get(TenantSettings, "briefing-tenant").settings_json
    assert scheduler.process_due_briefings(now - timedelta(seconds=1)) == 0
    assert scheduler.process_due_briefings(now) == 2
    assert scheduler.process_due_briefings(now + timedelta(hours=23)) == 0
    assert scheduler.process_due_briefings(now + timedelta(days=4)) == 2
    assert scheduler.process_due_briefings(now + timedelta(days=4)) == 0
    assert delivery.call_count == 2
    assert delivery.call_args.kwargs["signing_secret"] == "test-secret"
    assert delivery.call_args.kwargs["channels"] == config["channels"]
    assert delivery.call_args.kwargs["delivery_id"].startswith("brief-")
    with sessions() as session:
        assert session.get(TenantSettings, "briefing-tenant").settings_json == original
        assert session.query(ScheduleRunLog).count() == 2
    outcome = scheduler.briefing_schedule_outcome(tenant_id="briefing-tenant", revision=config["revision"])
    assert (outcome["status"], outcome["delivered"], outcome["attempted"]) == ("sent", 2, 2)
    assert scheduler.briefing_schedule_outcome(tenant_id="other", revision=config["revision"]) is None


def test_concurrent_claims_have_one_winner(schedule):
    now, _, _, sessions, _ = schedule
    with ThreadPoolExecutor(max_workers=2) as pool:
        claims = list(pool.map(lambda _: scheduler._claim("briefing-tenant", now), range(2)))
    assert sum(claim is not None for claim in claims) == 1
    with sessions() as session:
        assert session.query(ScheduleRunLog).count() == 1


@pytest.mark.parametrize("crash_after_send", [False, True])
def test_ambiguous_claim_is_never_retried(schedule, monkeypatch, crash_after_send):
    now, config, delivery, _, _ = schedule
    if crash_after_send:
        monkeypatch.setattr(scheduler, "_record_outcome", lambda *args: (_ for _ in ()).throw(RuntimeError("DB unavailable")))
        assert scheduler.process_due_briefings(now) == 0
    else:
        assert scheduler._claim("briefing-tenant", now) is not None
    assert scheduler.process_due_briefings(now) == 0
    assert delivery.call_count == int(crash_after_send)
    outcome = scheduler.briefing_schedule_outcome(tenant_id="briefing-tenant", revision=config["revision"])
    assert outcome["status"] == "sending" and outcome["outcomeUnknown"]


def test_disable_revision_and_legacy_settings(schedule, monkeypatch):
    now, config, delivery, _, save = schedule
    save({"revision": None})
    assert scheduler.process_due_briefings(now) == 0
    save({"revision": config["revision"], "enabled": False})
    assert scheduler.process_due_briefings(now) == 0
    save({"enabled": True})

    def disable_while_building(**kwargs):
        save({"enabled": False})
        return {}

    monkeypatch.setattr(qros_push, "build_briefing_for_tenant", disable_while_building)
    assert scheduler.process_due_briefings(now) == 0
    assert not delivery.called
    assert scheduler.briefing_schedule_outcome(tenant_id="briefing-tenant", revision=config["revision"])["status"] == "cancelled"
    revision = str(uuid4())
    save({"enabled": True, "revision": revision, "firstRunAt": (now + timedelta(days=1)).isoformat()})
    assert scheduler.process_due_briefings(now) == 0
    monkeypatch.setattr(qros_push, "build_briefing_for_tenant", lambda **kw: {})
    assert scheduler.process_due_briefings(now + timedelta(days=1)) == 2


@pytest.mark.parametrize("sent,attempted,state", [(1, 2, "partial"), (0, 2, "failed"), (0, 0, "no_destinations")])
def test_outcomes_do_not_retry_successful_destinations(schedule, sent, attempted, state):
    now, config, delivery, _, _ = schedule
    delivery.return_value = {"delivered": sent, "attempted": attempted, "errors": ["example"]}
    assert scheduler.process_due_briefings(now) == sent
    assert scheduler.process_due_briefings(now) == 0
    delivery.assert_called_once()
    outcome = scheduler.briefing_schedule_outcome(tenant_id="briefing-tenant", revision=config["revision"])
    assert (outcome["status"], outcome["delivered"], outcome["attempted"]) == (state, sent, attempted)


def test_unavailable_scheduler_or_persistence_sends_nothing(schedule, monkeypatch):
    now, _, delivery, _, _ = schedule
    monkeypatch.setattr(scheduler, "scheduler_enabled", lambda: False)
    assert scheduler.process_due_briefings(now) == 0
    monkeypatch.setattr(scheduler, "scheduler_enabled", lambda: True)
    monkeypatch.setattr(scheduler, "persistence_enabled", lambda: False)
    assert scheduler.process_due_briefings(now) == 0
    delivery.assert_not_called()


@pytest.mark.parametrize("changes", [
    {"firstRunAt": None}, {"firstRunAt": "2026-09-10T12:00:00"},
    {"cadenceHours": 0}, {"cadenceHours": 169}, {"cadenceHours": True},
])
def test_invalid_saved_schedule_never_dispatches(schedule, changes):
    now, _, delivery, _, save = schedule
    save(changes)
    assert scheduler.process_due_briefings(now) == 0
    delivery.assert_not_called()


def test_save_preferences_preserves_identical_schedule_and_unrelated_settings(schedule):
    _, config, _, sessions, _ = schedule
    preferences = {key: config[key] for key in ("channels", "recipients", "cadenceHours", "enabled")}
    saved = qros_push.save_briefing_preferences(tenant_id="briefing-tenant", preferences=preferences)
    assert saved["revision"] == config["revision"]
    assert saved["firstRunAt"] == config["firstRunAt"]
    disabled = qros_push.save_briefing_preferences(
        tenant_id="briefing-tenant", preferences={**preferences, "enabled": False},
    )
    assert disabled["revision"] != saved["revision"]
    enabled = qros_push.save_briefing_preferences(tenant_id="briefing-tenant", preferences=preferences)
    assert enabled["revision"] not in {saved["revision"], disabled["revision"]}
    assert enabled["firstRunAt"] != saved["firstRunAt"]
    with sessions() as session:
        stored = session.get(TenantSettings, "briefing-tenant").settings_json
        assert stored.startswith("enc:")
        data = decrypt_json_blob(stored)
        assert data["unrelated"] == "keep"
        assert data["webhookSigningSecret"] == "test-secret"
