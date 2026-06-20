"""Assess self-serve signup API tests."""

from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def db_client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "assess_signup.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    monkeypatch.setenv("QTANGL_SECRETS_KEY", "hR0wA-G-jY0UipSPaknDymVLhgau_RCwdzIxgazUGgo=")
    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None

    from app.db.engine import init_db

    init_db()
    client = TestClient(app)
    yield client
    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None
    monkeypatch.delenv("DATABASE_URL", raising=False)
    tmp.cleanup()


def test_assess_signup_provisions_tenant(db_client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    sent: list[dict] = []

    def fake_send(**kwargs):
        sent.append(kwargs)
        return {"sent": True}

    monkeypatch.setattr("app.notifications.email.send_report_email", fake_send)

    response = db_client.post(
        "/public/assess-signup",
        json={
            "email": "buyer@example.com",
            "company": "Example Corp",
            "domain": "api.example.com",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["allowlistSeeded"] is True
    assert "assessUrl" in body
    assert sent


def test_assess_signup_warns_when_domain_mismatch(db_client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "app.notifications.email.send_report_email",
        lambda **kwargs: {"sent": True},
    )
    response = db_client.post(
        "/public/assess-signup",
        json={
            "email": "buyer@example.com",
            "company": "Example Corp",
            "domain": "other.org",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["allowlistSeeded"] is False
    assert body.get("warning")


def test_assess_signup_rate_limited(db_client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("QTANGL_ASSESS_SIGNUP_LIMIT_PER_HOUR", "2")
    monkeypatch.setattr(
        "app.notifications.email.send_report_email",
        lambda **kwargs: {"sent": True},
    )
    payload = {"email": "a@ratelimit.test", "company": "Rate Test"}
    assert db_client.post("/public/assess-signup", json=payload).status_code == 200
    assert db_client.post("/public/assess-signup", json=payload).status_code == 200
    blocked = db_client.post("/public/assess-signup", json=payload)
    assert blocked.status_code == 429
