"""Opt-in PostgreSQL concurrency checks; never use the application's database URL."""

from __future__ import annotations

import os
import time
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from datetime import datetime, timezone
from threading import Barrier, Event, current_thread
from uuid import uuid4

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.command_center import briefing_schedule, qros_push
from app.db.base import Base
from app.db.models import ScheduleRunLog, Tenant, TenantSettings
from app.security.secrets import decrypt_json_blob, encrypt_json_blob
from app.tenant import settings as tenant_settings


@pytest.fixture
def postgres(monkeypatch):
    url = os.getenv("QTANGL_TEST_POSTGRES_URL")
    if not url:
        pytest.skip("QTANGL_TEST_POSTGRES_URL is not configured")
    parsed = make_url(url)
    assert parsed.drivername == "postgresql+psycopg"
    assert parsed.host in {"127.0.0.1", "localhost"} and parsed.database == "qtangl_briefing_test"
    schema = "briefing_test_" + uuid4().hex
    admin = create_engine(url)
    with admin.begin() as connection:
        connection.execute(text(f'CREATE SCHEMA "{schema}"'))
    engine = create_engine(url, connect_args={"options": f"-csearch_path={schema} -clock_timeout=10000"})
    try:
        Base.metadata.create_all(engine, tables=[Tenant.__table__, TenantSettings.__table__, ScheduleRunLog.__table__])

        @contextmanager
        def sessions():
            with Session(engine) as session, session.begin():
                yield session

        monkeypatch.setattr("app.db.engine.db_session", sessions)
        monkeypatch.setattr(tenant_settings, "db_session", sessions)
        monkeypatch.setattr(tenant_settings, "persistence_enabled", lambda: True)
        monkeypatch.setattr(briefing_schedule, "db_session", sessions)
        now = datetime.now(timezone.utc)
        config = {
            "enabled": True, "channels": ["webhook"], "recipients": [], "cadenceHours": 24,
            "revision": str(uuid4()), "firstRunAt": now.isoformat(),
        }
        with sessions() as session:
            session.add(Tenant(id="briefing-test", name="Briefing test"))
            session.flush()
            session.add(TenantSettings(tenant_id="briefing-test", settings_json=encrypt_json_blob({
                "pushBriefing": config, "webhookSigningSecret": "preserve-test-secret",
            })))
        yield engine, sessions, now, config
    finally:
        engine.dispose()
        with admin.begin() as connection:
            connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        admin.dispose()


def test_disable_blocks_unrelated_update_then_merges_latest(postgres, monkeypatch):
    engine, sessions, _, config = postgres
    locked, release, second_started = Event(), Event(), Event()
    second_pid = []

    @contextmanager
    def controlled_sessions():
        with sessions() as session:
            if current_thread().name.startswith("settings-update"):
                second_pid.append(session.execute(text("SELECT pg_backend_pid()")).scalar_one())
                second_started.set()
            yield session
            if current_thread().name.startswith("briefing-disable"):
                locked.set()
                assert release.wait(8), "Test failed to release the briefing transaction"

    monkeypatch.setattr("app.db.engine.db_session", controlled_sessions)
    monkeypatch.setattr(tenant_settings, "db_session", controlled_sessions)
    preferences = {key: config[key] for key in ("channels", "recipients", "cadenceHours")}
    with ThreadPoolExecutor(max_workers=1, thread_name_prefix="briefing-disable") as first_pool, ThreadPoolExecutor(
        max_workers=1, thread_name_prefix="settings-update",
    ) as second_pool:
        first = first_pool.submit(qros_push.save_briefing_preferences, tenant_id="briefing-test", preferences={**preferences, "enabled": False})
        try:
            assert locked.wait(5), "Disable did not acquire its row lock"
            second = second_pool.submit(tenant_settings.upsert_tenant_settings, tenant_id="briefing-test", settings={"industry": "healthcare"})
            assert second_started.wait(5)
            deadline = time.monotonic() + 5
            blocked = False
            while time.monotonic() < deadline:
                with engine.connect() as connection:
                    blocked = connection.execute(text(
                        "SELECT wait_event_type = 'Lock' FROM pg_stat_activity WHERE pid = :pid"
                    ), {"pid": second_pid[0]}).scalar()
                if blocked or second.done():
                    break
                time.sleep(0.02)
            assert blocked and not second.done(), "Unrelated update must wait before reading settings"
        finally:
            release.set()
        saved = first.result(timeout=5)
        second.result(timeout=5)
    with sessions() as session:
        stored = decrypt_json_blob(session.get(TenantSettings, "briefing-test").settings_json)
    assert stored["pushBriefing"]["enabled"] is False
    assert stored["pushBriefing"]["revision"] == saved["revision"]
    assert stored["industry"] == "healthcare"
    assert stored["webhookSigningSecret"] == "preserve-test-secret"


def test_same_slot_has_one_claim_with_independent_sessions(postgres):
    _, sessions, now, _ = postgres
    ready = Barrier(2)

    def claim():
        ready.wait(timeout=5)
        return briefing_schedule._claim("briefing-test", now)

    with ThreadPoolExecutor(max_workers=2) as pool:
        first, second = pool.submit(claim), pool.submit(claim)
        claims = [first.result(timeout=10), second.result(timeout=10)]
    assert sum(result is not None for result in claims) == 1
    with sessions() as session:
        rows = session.query(ScheduleRunLog).all()
        assert len(rows) == 1 and rows[0].status == "sending"
    assert briefing_schedule._claim("briefing-test", now) is None
