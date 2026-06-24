from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.billing.entitlements import upsert_tenant_subscription
from app.db.engine import db_session, init_db
from app.db.models import TenantMembership, User
from app.main import app
from app.tenants.service import create_tenant, issue_api_key


def _reset_engine() -> None:
    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "partner_customer_api_test.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    _reset_engine()
    init_db()
    test_client = TestClient(app)
    yield test_client
    _reset_engine()
    tmp.cleanup()


def _auth_headers(*, tenant_id: str, role: str = "admin") -> dict[str, str]:
    create_tenant(tenant_id=tenant_id, name=tenant_id)
    upsert_tenant_subscription(tenant_id=tenant_id, tier="enterprise")
    key = issue_api_key(tenant_id=tenant_id, label="test", role=role)["apiKey"]
    return {"Authorization": f"Bearer {key}"}


def test_customer_role_blocked_from_partner_children(client: TestClient) -> None:
    headers = _auth_headers(tenant_id="tenant-customer-block", role="customer_viewer")
    response = client.get("/tenant/partner/children", headers=headers)
    assert response.status_code == 403


def test_partner_tier_limits_children(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    from app.partner.service import link_child_tenant
    from app.tenant.settings import upsert_tenant_settings

    parent_id = "tenant-partner-limit"
    headers = _auth_headers(tenant_id=parent_id, role="admin")
    upsert_tenant_settings(tenant_id=parent_id, settings={"orgType": "mssp", "partnerTier": "registered"})
    for idx in range(5):
        child_id = f"child-limit-{idx}"
        create_tenant(tenant_id=child_id, name=child_id)
        link_child_tenant(parent_tenant_id=parent_id, child_tenant_id=child_id, label=child_id)

    response = client.post(
        "/tenant/partner/provision-child",
        headers=headers,
        json={"customerName": "Sixth Customer", "tier": "monitor"},
    )
    assert response.status_code == 402
