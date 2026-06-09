"""Onboarding key token lifecycle (24h TTL, single use)."""

from __future__ import annotations

import hashlib
import os
import tempfile
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.billing.onboarding_tokens import create_onboarding_token, redeem_onboarding_token
from app.db.engine import init_db
from app.main import app


@pytest.fixture
def db_client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "onboarding.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    monkeypatch.setenv("QTANGL_SECRETS_KEY", "hR0wA-G-jY0UipSPaknDymVLhgau_RCwdzIxgazUGgo=")
    _reset_engine()
    init_db()
    client = TestClient(app)
    yield client
    _reset_engine()
    monkeypatch.delenv("DATABASE_URL", raising=False)
    tmp.cleanup()


def _reset_engine() -> None:
    import app.db.engine as engine_module
    import app.billing.onboarding_tokens as tokens_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None
    tokens_module._memory_tokens.clear()


def test_create_and_redeem_token_once(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    _reset_engine()
    issued = create_onboarding_token(
        tenant_id="tenant-ob",
        api_key="qtangl_secret_key_xyz",
        email="buyer@example.com",
    )
    assert "token" in issued
    assert issued["expiresAt"]

    first = redeem_onboarding_token(issued["token"])
    assert first is not None
    assert first["tenantId"] == "tenant-ob"
    assert first["apiKey"] == "qtangl_secret_key_xyz"
    assert first["email"] == "buyer@example.com"

    second = redeem_onboarding_token(issued["token"])
    assert second is None


def test_redeem_invalid_token() -> None:
    assert redeem_onboarding_token("not-a-valid-token") is None


def test_public_onboarding_key_endpoint(db_client: TestClient) -> None:
    issued = create_onboarding_token(
        tenant_id="tenant-public",
        api_key="qtangl_public_redeem_key",
        email="public@example.com",
    )
    response = db_client.get(f"/public/onboarding-key/{issued['token']}")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["apiKey"] == "qtangl_public_redeem_key"
    assert body["tenantId"] == "tenant-public"

    again = db_client.get(f"/public/onboarding-key/{issued['token']}")
    assert again.status_code == 404


def test_token_hash_not_reversible_from_db(db_client: TestClient) -> None:
    issued = create_onboarding_token(
        tenant_id="tenant-hash",
        api_key="qtangl_never_stored_plain",
        email="hash@example.com",
    )
    expected_hash = hashlib.sha256(issued["token"].encode()).hexdigest()
    from app.db.engine import db_session
    from app.db.models import OnboardingKeyToken

    with db_session() as session:
        row = (
            session.query(OnboardingKeyToken)
            .filter(OnboardingKeyToken.token_hash == expected_hash)
            .one()
        )
        assert row.token_hash == expected_hash
        assert issued["token"] not in (row.payload_encrypted or "")


def test_expired_token_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    _reset_engine()
    issued = create_onboarding_token(
        tenant_id="tenant-exp",
        api_key="qtangl_expired",
        email="exp@example.com",
    )
    token_hash = hashlib.sha256(issued["token"].encode()).hexdigest()
    import app.billing.onboarding_tokens as tokens_module

    tokens_module._memory_tokens[token_hash]["expiresAt"] = datetime.now(timezone.utc) - timedelta(hours=1)
    assert redeem_onboarding_token(issued["token"]) is None
