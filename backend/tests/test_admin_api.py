"""Admin API routes protected by QTANGL_ADMIN_API_KEY."""

from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.db.engine import init_db
from app.main import app
from app.tenants.service import create_tenant, issue_api_key


@pytest.fixture
def admin_client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "admin_test.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    monkeypatch.setenv("QTANGL_ADMIN_API_KEY", "admin-test-key-secret")
    _reset_engine()
    init_db()
    client = TestClient(app)
    yield client
    _reset_engine()
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("QTANGL_ADMIN_API_KEY", raising=False)
    tmp.cleanup()


def _reset_engine() -> None:
    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None


def test_admin_create_tenant(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/admin/tenants",
        headers={"Authorization": "Bearer admin-test-key-secret"},
        json={"name": "Admin Created Co", "tenantId": "tenant-admin-created"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["tenantId"] == "tenant-admin-created"
    assert payload["name"] == "Admin Created Co"


def test_admin_issue_list_revoke_key(admin_client: TestClient) -> None:
    tenant = create_tenant(name="Key Ops Co", tenant_id="tenant-key-ops")
    issue = admin_client.post(
        f"/admin/tenants/{tenant['tenantId']}/keys",
        headers={"X-Api-Key": "admin-test-key-secret"},
        json={"label": "rotated"},
    )
    assert issue.status_code == 200
    key_payload = issue.json()
    new_key = key_payload["apiKey"]
    key_id = key_payload["keyId"]

    listed = admin_client.get(
        f"/admin/tenants/{tenant['tenantId']}/keys",
        headers={"Authorization": "Bearer admin-test-key-secret"},
    )
    assert listed.status_code == 200
    labels = {item["label"] for item in listed.json()["keys"]}
    assert "rotated" in labels

    me = admin_client.get("/tenant/me", headers={"Authorization": f"Bearer {new_key}"})
    assert me.status_code == 200

    revoked = admin_client.delete(
        f"/admin/keys/{key_id}",
        headers={"Authorization": "Bearer admin-test-key-secret"},
    )
    assert revoked.status_code == 200
    after = admin_client.get("/tenant/me", headers={"Authorization": f"Bearer {new_key}"})
    assert after.status_code == 401


def test_admin_rejects_missing_key(admin_client: TestClient) -> None:
    response = admin_client.post("/admin/tenants", json={"name": "No Auth"})
    assert response.status_code == 403


def test_admin_rejects_wrong_key(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/admin/tenants",
        headers={"Authorization": "Bearer wrong-admin-key"},
        json={"name": "Bad Auth"},
    )
    assert response.status_code == 403


def test_admin_unconfigured_returns_503(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("QTANGL_ADMIN_API_KEY", raising=False)
    client = TestClient(app)
    response = client.post(
        "/admin/tenants",
        headers={"Authorization": "Bearer any-key"},
        json={"name": "Unconfigured"},
    )
    assert response.status_code == 503
