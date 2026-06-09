"""OIDC SSO configuration smoke tests."""

from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.auth_oidc import get_oidc_config, upsert_oidc_config, validate_oidc_token
from app.db.engine import init_db
from app.main import app
from app.tenants.service import create_tenant, issue_api_key


@pytest.fixture
def oidc_client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "oidc.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    monkeypatch.setenv("QTANGL_SECRETS_KEY", "hR0wA-G-jY0UipSPaknDymVLhgau_RCwdzIxgazUGgo=")
    _reset_engine()
    init_db()
    tenant = create_tenant(name="OIDC Co", tenant_id="tenant-oidc")
    key = issue_api_key(tenant_id=tenant["tenantId"], role="admin")["apiKey"]
    client = TestClient(app)
    client.admin_key = key  # type: ignore[attr-defined]
    client.tenant_id = tenant["tenantId"]  # type: ignore[attr-defined]
    yield client
    _reset_engine()
    monkeypatch.delenv("DATABASE_URL", raising=False)
    tmp.cleanup()


def _reset_engine() -> None:
    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None


def test_upsert_and_get_oidc_config(oidc_client: TestClient) -> None:
    saved = upsert_oidc_config(
        tenant_id="tenant-oidc",
        issuer_url="https://login.example.com",
        client_id="qtangl-client",
        client_secret="super-secret",
        enabled=True,
    )
    assert saved["enabled"] is True
    assert saved["issuerUrl"] == "https://login.example.com"

    config = get_oidc_config(tenant_id="tenant-oidc")
    assert config is not None
    assert config["clientId"] == "qtangl-client"
    assert "client_secret" not in config


def test_tenant_oidc_api_roundtrip(oidc_client: TestClient) -> None:
    put = oidc_client.put(
        "/tenant/oidc",
        headers={"Authorization": f"Bearer {oidc_client.admin_key}"},
        json={
            "issuerUrl": "https://idp.example.com",
            "clientId": "qtangl-sso",
            "clientSecret": "rotate-me",
            "enabled": True,
        },
    )
    assert put.status_code == 200
    assert put.json()["oidc"]["enabled"] is True

    get = oidc_client.get(
        "/tenant/oidc",
        headers={"Authorization": f"Bearer {oidc_client.admin_key}"},
    )
    assert get.status_code == 200
    assert get.json()["oidc"]["issuerUrl"] == "https://idp.example.com"


def test_validate_oidc_token_malformed() -> None:
    result = validate_oidc_token(issuer_url="https://idp.example.com", token="not-a-jwt")
    assert result["valid"] is False


def test_validate_oidc_token_missing() -> None:
    result = validate_oidc_token(issuer_url="https://idp.example.com", token="")
    assert result["valid"] is False
    assert result["reason"] == "missing_token"
