"""Callbacks must authenticate before accepting tenant-controlled action payloads."""
from unittest.mock import patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.integrations_webhook import router
from app.auth import AuthContext, require_auth
from app.store import tenant_alerts

app = FastAPI()
app.include_router(router)
client = TestClient(app)
PATHS = ["/integrations/slack/actions", "/integrations/teams/actions", "/integrations/jira/webhook"]


@pytest.fixture(autouse=True)
def clean_auth():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


def authenticate(role="operator"):
    app.dependency_overrides[require_auth] = lambda: AuthContext("test", "tenant-a", role=role)


@pytest.mark.parametrize("path", PATHS)
def test_unauthenticated_callback_cannot_spoof_tenant(path):
    response = client.post(path, json={"tenantId": "tenant-a", "action": "ack", "alertId": "alert"})
    assert response.status_code == 401


@pytest.mark.parametrize("path", PATHS)
def test_viewer_cannot_mutate_callback(path):
    authenticate("viewer")
    assert client.post(path, json={}).status_code == 403


@pytest.mark.parametrize("path", PATHS)
@pytest.mark.parametrize("hint", ["body", "header"])
def test_authenticated_callback_cannot_change_tenant(path, hint):
    authenticate()
    body = {"tenantId": "tenant-b"} if hint == "body" else {}
    headers = {"X-Qtangl-Tenant": "tenant-b"} if hint == "header" else {}
    assert client.post(path, json=body, headers=headers).status_code == 403


@pytest.mark.parametrize("path", PATHS[:2])
def test_ack_is_bound_to_authenticated_tenant(path, monkeypatch):
    authenticate()
    monkeypatch.setattr(tenant_alerts, "_memory_alerts", {
        "tenant-a": [{"id": "own", "readAt": None}],
        "tenant-b": [{"id": "other", "readAt": None}],
    })
    with patch("app.db.config.persistence_enabled", return_value=False):
        assert client.post(path, json={"action": "ack", "alertId": "other"}).status_code == 404
        assert client.post(path, json={"action": "ack", "alertId": "own"}).status_code == 200
    assert tenant_alerts._memory_alerts["tenant-b"][0]["readAt"] is None
    assert tenant_alerts._memory_alerts["tenant-a"][0]["readAt"] is not None


@pytest.mark.parametrize("provider,key,expected", [("jira", "Q-1", True), ("jira", "Q-2", False), ("linear", "Q-1", False)])
def test_jira_callback_requires_matching_synced_issue(provider, key, expected):
    authenticate()
    with patch("app.api.integrations_webhook.get_sync", return_value={
        "provider": provider, "externalRef": key, "programItemId": "item-1",
    }) as lookup, patch("app.api.integrations_webhook.update_program_item") as update:
        response = client.post(PATHS[2], json={"remediationId": "rem-1", "issue": {
            "key": "Q-1", "fields": {"status": {"name": "Done"}},
        }})
    assert response.status_code == 200
    lookup.assert_called_once_with(tenant_id="tenant-a", remediation_id="rem-1")
    assert update.called is expected
    if expected:
        assert update.call_args.kwargs["tenant_id"] == "tenant-a"


@pytest.mark.parametrize("path", PATHS)
def test_callback_rejects_non_object_json(path):
    authenticate()
    assert client.post(path, json=[]).status_code == 400


@pytest.mark.parametrize("provider", ["slack", "teams"])
def test_assignment_audit_cannot_spoof_authenticated_actor(provider):
    app.dependency_overrides[require_auth] = lambda: AuthContext("test", "tenant-a", role="operator", user_id="real-user")
    with patch("app.audit.service.log_action") as log:
        response = client.post(f"/integrations/{provider}/actions", json={
            "action": "assign", "alertId": "alert", "assignee": "spoofed-actor",
        })
    assert response.status_code == 200
    assert log.call_args.kwargs["tenant_id"] == "tenant-a"
    assert log.call_args.kwargs["actor"] == "real-user"
    assert log.call_args.kwargs["action"] == f"{provider}_assign_alert"


def test_jira_rejects_malformed_issue():
    authenticate()
    assert client.post(PATHS[2], json={"issue": "wrong"}).status_code == 400
