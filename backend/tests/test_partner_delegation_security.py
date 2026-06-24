from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.billing.entitlements import upsert_tenant_subscription
from app.db.engine import db_session, init_db
from app.db.models import TenantMembership, User
from app.main import app
from app.partner.service import link_child_tenant
from app.tenants.service import create_tenant


def _reset_engine() -> None:
    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "partner_delegation_test.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    monkeypatch.setenv("QTANGL_DASHBOARD_AUTH_WORKOS", "true")
    monkeypatch.setenv("QTANGL_BFF_SESSION_SECRET", "bff-secret-test-key-32chars-min")
    _reset_engine()
    init_db()
    test_client = TestClient(app)
    yield test_client
    _reset_engine()
    tmp.cleanup()


def _bootstrap(
    client: TestClient,
    *,
    workos_user_id: str,
    email: str,
    active_tenant_id: str | None = None,
):
    params: dict[str, str] = {"workos_user_id": workos_user_id, "email": email}
    if active_tenant_id:
        params["active_tenant_id"] = active_tenant_id
    return client.get(
        "/internal/dashboard/bootstrap",
        params=params,
        headers={"X-Qtangl-Bff-Secret": "bff-secret-test-key-32chars-min"},
    )


def _seed_partner_user(*, parent_id: str, child_id: str, role: str = "admin") -> str:
    create_tenant(tenant_id=parent_id, name="MSSP Parent")
    create_tenant(tenant_id=child_id, name="Customer Child")
    upsert_tenant_subscription(tenant_id=parent_id, tier="enterprise")
    link_child_tenant(parent_tenant_id=parent_id, child_tenant_id=child_id, label="Customer")
    with db_session() as session:
        session.add(User(id="usr-partner", workos_user_id="user_partner", email="partner@example.com"))
        session.add(
            TenantMembership(
                id="mem-partner",
                tenant_id=parent_id,
                user_id="usr-partner",
                role=role,
            )
        )
    return "user_partner"


def test_delegation_allowed_for_linked_child(client: TestClient) -> None:
    workos_user_id = _seed_partner_user(parent_id="tenant-parent", child_id="tenant-child")
    response = _bootstrap(
        client,
        workos_user_id=workos_user_id,
        email="partner@example.com",
        active_tenant_id="tenant-child",
    )
    assert response.status_code == 200
    body = response.json()
    assert body["tenantId"] == "tenant-child"
    assert body["delegatedAccess"] is True
    assert body["delegatedFromParentId"] == "tenant-parent"
    assert body["role"] == "partner_admin"


def test_delegation_allowed_for_operator_parent(client: TestClient) -> None:
    workos_user_id = _seed_partner_user(
        parent_id="tenant-parent-op",
        child_id="tenant-child-op",
        role="operator",
    )
    response = _bootstrap(
        client,
        workos_user_id=workos_user_id,
        email="partner@example.com",
        active_tenant_id="tenant-child-op",
    )
    assert response.status_code == 200
    body = response.json()
    assert body["tenantId"] == "tenant-child-op"
    assert body["delegatedAccess"] is True
    assert body["role"] == "partner_analyst"


def test_delegation_denied_for_unrelated_child(client: TestClient) -> None:
    workos_user_id = _seed_partner_user(parent_id="tenant-parent-deny", child_id="tenant-child-linked")
    create_tenant(tenant_id="tenant-unrelated", name="Unrelated Co")
    response = _bootstrap(
        client,
        workos_user_id=workos_user_id,
        email="partner@example.com",
        active_tenant_id="tenant-unrelated",
    )
    assert response.status_code == 403
