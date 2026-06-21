"""Admin API routes protected by QTANGL_ADMIN_API_KEY."""

from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.billing.entitlements import upsert_tenant_subscription
from app.db.engine import init_db
from app.db.models import User
from app.db.engine import db_session
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


def test_admin_platform_summary_and_tenant_list(admin_client: TestClient) -> None:
    create_tenant(name="Summary Co", tenant_id="tenant-summary-co")
    upsert_tenant_subscription(tenant_id="tenant-summary-co", tier="monitor")

    summary = admin_client.get(
        "/admin/platform/summary",
        headers={"Authorization": "Bearer admin-test-key-secret"},
    )
    assert summary.status_code == 200
    body = summary.json()
    assert body["totals"]["tenants"] >= 1
    assert "tierBreakdown" in body

    listed = admin_client.get(
        "/admin/tenants?search=summary",
        headers={"Authorization": "Bearer admin-test-key-secret"},
    )
    assert listed.status_code == 200
    tenants = listed.json()["tenants"]
    assert any(row["tenantId"] == "tenant-summary-co" for row in tenants)


def test_admin_tenant_detail_and_patch_tier(admin_client: TestClient) -> None:
    tenant = create_tenant(name="Detail Co", tenant_id="tenant-detail-co")
    upsert_tenant_subscription(tenant_id=tenant["tenantId"], tier="free")

    detail = admin_client.get(
        f"/admin/tenants/{tenant['tenantId']}",
        headers={"Authorization": "Bearer admin-test-key-secret"},
    )
    assert detail.status_code == 200
    payload = detail.json()
    assert payload["tenantId"] == tenant["tenantId"]
    assert payload["subscription"]["tier"] == "free"

    patched = admin_client.patch(
        f"/admin/tenants/{tenant['tenantId']}",
        headers={
            "Authorization": "Bearer admin-test-key-secret",
            "X-Qtangl-Ops-Actor": "ops@qtangl.com",
        },
        json={"tier": "monitor"},
    )
    assert patched.status_code == 200
    assert patched.json()["subscription"]["tier"] == "monitor"


def test_admin_list_users(admin_client: TestClient) -> None:
    tenant = create_tenant(name="Users Co", tenant_id="tenant-users-co")
    with db_session() as session:
        session.add(
            User(
                id="user-ops-1",
                workos_user_id="workos-user-ops-1",
                email="alice@example.com",
            )
        )
    from app.db.models import TenantMembership

    with db_session() as session:
        session.add(
            TenantMembership(
                id="mem-ops-1",
                tenant_id=tenant["tenantId"],
                user_id="user-ops-1",
                role="admin",
            )
        )

    response = admin_client.get(
        "/admin/users?search=alice",
        headers={"Authorization": "Bearer admin-test-key-secret"},
    )
    assert response.status_code == 200
    users = response.json()["users"]
    assert any(row["email"] == "alice@example.com" for row in users)
