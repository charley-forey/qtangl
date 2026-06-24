"""Integration test mirroring scripts/sensor_staging_smoke.py via TestClient."""

from __future__ import annotations

import os
import tempfile
import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.tenants.service import create_tenant, issue_api_key


SAMPLE_FINDING = {
    "schemaVersion": 1,
    "findingId": "staging-smoke-find-001",
    "findingType": "certificate",
    "hostId": "00000000-0000-4000-8000-000000000099",
    "hostname": "staging-smoke-host",
    "os": "linux",
    "location": "/etc/ssl/staging-smoke.pem",
    "algorithm": "RSA-2048",
    "keySize": 2048,
    "confidence": "high",
    "fingerprint": "sha256:staging-smoke-test",
}


def _reset_engine() -> None:
    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None


@pytest.fixture
def smoke_client(monkeypatch: pytest.MonkeyPatch) -> tuple[TestClient, str, dict[str, str]]:
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "sensor_smoke_integration.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    _reset_engine()
    from app.db.engine import init_db

    init_db()
    tenant = create_tenant(tenant_id="tenant-sensor-smoke", name="Sensor Smoke Co")
    api_key = issue_api_key(tenant_id=tenant["tenantId"], label="smoke", role="admin")["apiKey"]
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    client = TestClient(app)
    yield client, tenant["tenantId"], headers
    _reset_engine()
    tmp.cleanup()


def test_sensor_staging_smoke_flow(smoke_client: tuple[TestClient, str, dict[str, str]]) -> None:
    client, tenant_id, headers = smoke_client

    from app.tenant.settings import upsert_tenant_settings

    upsert_tenant_settings(
        tenant_id=tenant_id,
        settings={
            "discovery": {"hostSensor": True, "codeScan": False, "binaryScan": False},
            "remediationProgramEnabled": True,
        },
    )

    fleet_resp = client.post("/tenant/discovery/fleets", headers=headers, json={"name": "smoke-fleet"})
    assert fleet_resp.status_code == 200, fleet_resp.text
    fleet = fleet_resp.json()
    token = fleet.get("enrollmentToken")
    nonce = fleet.get("enrollmentNonce")
    assert token

    enroll = client.post(
        "/discovery/agent/enroll",
        json={
            "enrollmentToken": token,
            "enrollmentNonce": nonce,
            "hostname": "staging-smoke-host",
            "os": "linux",
            "sensorVersion": "0.1.0",
        },
    )
    assert enroll.status_code == 200, enroll.text
    agent_id = enroll.json().get("agentId")
    enrolled_tenant = enroll.json().get("tenantId")
    assert agent_id and enrolled_tenant

    heartbeat = client.post(
        "/discovery/agent/heartbeat",
        json={"agentId": agent_id, "tenantId": enrolled_tenant, "sensorVersion": "0.1.0"},
    )
    assert heartbeat.status_code == 200

    finding = dict(SAMPLE_FINDING)
    finding["findingId"] = f"smoke-{uuid.uuid4().hex[:8]}"
    ingest = client.post(
        "/discovery/agent/findings",
        headers={**headers, "X-Qtangl-Discovery-Schema": "discovery-finding-v1"},
        json={"agentId": agent_id, "tenantId": enrolled_tenant, "findings": [finding]},
    )
    assert ingest.status_code == 200, ingest.text
    assert ingest.json().get("accepted", 0) >= 1

    agents = client.get("/tenant/discovery/agents", headers=headers).json().get("agents") or []
    match = next((row for row in agents if row.get("agentId") == agent_id), None)
    assert match is not None
    assert int(match.get("findingsCount") or 0) >= 1

    program = client.get("/tenant/remediation/program", headers=headers)
    if program.status_code == 200:
        items = program.json().get("items") or []
        assert any(item.get("sourceType") == "host_finding" for item in items)

    from app.cbom.service import get_aggregate

    aggregate = get_aggregate(tenant_id=enrolled_tenant, sync_scan=False)
    assert int(aggregate.get("componentCount") or 0) >= 1
