from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_enrollment_rejects_empty_token(client: TestClient):
    res = client.post(
        "/discovery/agent/enroll",
        json={"enrollmentToken": "", "hostname": "evil", "os": "linux"},
    )
    assert res.status_code == 401


def test_findings_reject_private_key_material(client: TestClient):
    res = client.post(
        "/discovery/agent/findings",
        json={
            "agentId": "fake-agent",
            "tenantId": "sandbox",
            "findings": [
                {
                    "schemaVersion": 1,
                    "findingId": "inj-1",
                    "findingType": "certificate",
                    "hostId": "h1",
                    "hostname": "evil",
                    "os": "linux",
                    "algorithm": "BEGIN RSA PRIVATE KEY",
                    "confidence": "high",
                }
            ],
        },
    )
    assert res.status_code in {400, 404, 422}


def test_offline_upload_requires_auth(client: TestClient):
    res = client.post(
        "/tenant/discovery/offline-upload",
        json={"findings": []},
    )
    assert res.status_code in {401, 403}
