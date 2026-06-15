from __future__ import annotations

import hashlib
import hmac
import os
import tempfile
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.auth_workos.service import handle_webhook_event, verify_webhook_signature
from app.auth_workos.session import sign_bff_session, verify_bff_session
from app.db.engine import init_db
from app.db.models import Tenant, TenantMembership, User
from app.db.engine import db_session
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
    db_path = os.path.join(tmp.name, "workos_auth_test.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    monkeypatch.setenv("QTANGL_DASHBOARD_AUTH_WORKOS", "true")
    monkeypatch.setenv("WORKOS_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setenv("QTANGL_BFF_SESSION_SECRET", "bff-secret-test-key-32chars-min")
    _reset_engine()
    init_db()
    test_client = TestClient(app)
    yield test_client
    _reset_engine()
    tmp.cleanup()


@pytest.fixture(autouse=True)
def _workos_env(monkeypatch):
    monkeypatch.setenv("QTANGL_DASHBOARD_AUTH_WORKOS", "true")
    monkeypatch.setenv("WORKOS_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setenv("QTANGL_BFF_SESSION_SECRET", "bff-secret-test-key-32chars-min")


def test_verify_webhook_signature_valid(monkeypatch):
    payload = b'{"event":"user.created","data":{"id":"user_1","email":"a@example.com"}}'
    ts = str(int(datetime.now(timezone.utc).timestamp()))
    signed = f"{ts}.{payload.decode()}".encode()
    sig = hmac.new(b"whsec_test", signed, hashlib.sha256).hexdigest()
    header = f"t={ts},v1={sig}"
    assert verify_webhook_signature(payload, header) is True


def test_webhook_membership_sync(client: TestClient):
    create_tenant(tenant_id="tenant-wh", name="Webhook Co")
    with db_session() as session:
        tenant = session.get(Tenant, "tenant-wh")
        assert tenant is not None
        tenant.workos_org_id = "org_wh"
        session.add(User(id="usr-wh", workos_user_id="user_wh", email="ops@example.com"))
    event = {
        "event": "organization_membership.created",
        "data": {
            "id": "om_1",
            "organization_id": "org_wh",
            "user_id": "user_wh",
            "role": {"slug": "admin"},
        },
    }
    result = handle_webhook_event(event)
    assert result["handled"] is True
    with db_session() as session:
        membership = (
            session.query(TenantMembership)
            .filter(TenantMembership.tenant_id == "tenant-wh")
            .one_or_none()
        )
        assert membership is not None
        assert membership.role == "admin"


def test_bff_session_roundtrip(client: TestClient):
    create_tenant(tenant_id="tenant-bff", name="BFF Co")
    with db_session() as session:
        session.add(User(id="usr-bff", workos_user_id="user_bff", email="bff@example.com"))
        session.add(
            TenantMembership(
                id="mem-bff",
                tenant_id="tenant-bff",
                user_id="usr-bff",
                role="operator",
            )
        )
    token = sign_bff_session(
        tenant_id="tenant-bff",
        user_id="usr-bff",
        role="operator",
        email="bff@example.com",
    )
    assert token is not None
    claims = verify_bff_session(token)
    assert claims is not None
    assert claims.tenant_id == "tenant-bff"
    assert claims.role == "operator"


def test_bff_session_auth_header(client: TestClient):
    create_tenant(tenant_id="tenant-api", name="API Co")
    with db_session() as session:
        session.add(User(id="usr-api", workos_user_id="user_api", email="api@example.com"))
        session.add(
            TenantMembership(
                id="mem-api",
                tenant_id="tenant-api",
                user_id="usr-api",
                role="admin",
            )
        )
    token = sign_bff_session(
        tenant_id="tenant-api",
        user_id="usr-api",
        role="admin",
        email="api@example.com",
    )
    response = client.get("/tenant/me", headers={"Authorization": f"Bff {token}"})
    assert response.status_code == 200
    body = response.json()
    assert body["tenantId"] == "tenant-api"
    assert body["authMethod"] == "bff_session"


def test_tenant_api_keys_crud(client: TestClient):
    create_tenant(tenant_id="tenant-keys", name="Keys Co")
    key = issue_api_key(tenant_id="tenant-keys", label="bootstrap", role="admin")
    admin_key = key["apiKey"]
    listed = client.get("/tenant/api-keys", headers={"X-Api-Key": admin_key})
    assert listed.status_code == 200
    assert len(listed.json()["keys"]) >= 1
    created = client.post(
        "/tenant/api-keys",
        headers={"X-Api-Key": admin_key},
        json={"label": "ci", "role": "operator"},
    )
    assert created.status_code == 200
    assert created.json()["apiKey"].startswith("qtangl_")
    key_id = created.json()["keyId"]
    revoked = client.delete(f"/tenant/api-keys/{key_id}", headers={"X-Api-Key": admin_key})
    assert revoked.status_code == 200
