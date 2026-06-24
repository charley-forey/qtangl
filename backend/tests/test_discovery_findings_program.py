from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.discovery.fleet import create_fleet, enroll_agent, ingest_findings, list_agents
from app.discovery.program_sync import sync_program_items_for_findings
from app.main import app
from app.remediation.program import list_program_items
from app.tenant.settings import upsert_tenant_settings
from app.tenants.service import create_tenant


VALID_FINDING = {
    "schemaVersion": 1,
    "findingId": "test-prog-find-00001",
    "findingType": "certificate",
    "hostId": "00000000-0000-4000-8000-000000000099",
    "hostname": "test-host",
    "os": "linux",
    "location": "/etc/ssl/test.pem",
    "algorithm": "RSA-2048",
    "keySize": 2048,
    "confidence": "high",
    "fingerprint": "sha256:test-prog",
}


def _reset_engine() -> None:
    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None


@pytest.fixture(autouse=True)
def db_env(monkeypatch: pytest.MonkeyPatch):
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "discovery_findings_test.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    _reset_engine()
    from app.db.engine import init_db

    init_db()
    yield
    _reset_engine()
    tmp.cleanup()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_sync_program_items_for_findings():
    tenant_id = "tenant-prog-sync"
    create_tenant(tenant_id=tenant_id, name="Prog Sync Co")
    upsert_tenant_settings(
        tenant_id=tenant_id,
        settings={"remediationProgramEnabled": True},
    )
    linked = sync_program_items_for_findings(tenant_id=tenant_id, findings=[VALID_FINDING])
    assert len(linked) == 1
    items, total = list_program_items(tenant_id=tenant_id, limit=50)
    assert total >= 1
    host_items = [i for i in items if i.get("sourceType") == "host_finding"]
    assert len(host_items) >= 1


def test_ingest_findings_increments_agent_count():
    tenant_id = "tenant-prog-ingest"
    create_tenant(tenant_id=tenant_id, name="Prog Ingest Co")
    upsert_tenant_settings(
        tenant_id=tenant_id,
        settings={"discovery": {"hostSensor": True}, "remediationProgramEnabled": True},
    )
    fleet = create_fleet(tenant_id=tenant_id, name="test-fleet")
    enrolled = enroll_agent(
        enrollment_token=fleet["enrollmentToken"],
        enrollment_nonce=fleet.get("enrollmentNonce"),
        hostname="ingest-test",
        os_name="linux",
        sensor_version="0.1.0",
    )
    assert enrolled is not None
    agent_id = enrolled["agentId"]
    finding = dict(VALID_FINDING)
    finding["findingId"] = "test-ingest-find-002"
    result = ingest_findings(agent_id=agent_id, tenant_id=tenant_id, findings=[finding])
    assert result.get("accepted", 0) >= 1
    agents = list_agents(tenant_id=tenant_id)
    match = next(a for a in agents if a["agentId"] == agent_id)
    assert match["findingsCount"] >= 1


def test_findings_ingest_raises_cbom_component_count(client: TestClient):
    from app.cbom.service import get_aggregate

    tenant_id = "tenant-prog-cbom"
    create_tenant(tenant_id=tenant_id, name="Prog CBOM Co")
    upsert_tenant_settings(
        tenant_id=tenant_id,
        settings={"discovery": {"hostSensor": True}, "remediationProgramEnabled": True},
    )
    fleet = create_fleet(tenant_id=tenant_id, name="cbom-fleet")
    enrolled = enroll_agent(
        enrollment_token=fleet["enrollmentToken"],
        enrollment_nonce=fleet.get("enrollmentNonce"),
        hostname="cbom-host",
        os_name="linux",
        sensor_version="0.1.0",
    )
    assert enrolled is not None
    agent_id = enrolled["agentId"]
    before = get_aggregate(tenant_id=tenant_id, sync_scan=False)
    before_count = int(before.get("componentCount") or 0)

    finding = dict(VALID_FINDING)
    finding["findingId"] = "test-cbom-find-003"
    finding["fingerprint"] = "sha256:test-cbom-unique"
    res = client.post(
        "/discovery/agent/findings",
        json={"agentId": agent_id, "tenantId": tenant_id, "findings": [finding]},
    )
    assert res.status_code == 200, res.text
    assert res.json().get("accepted", 0) >= 1

    after = get_aggregate(tenant_id=tenant_id, sync_scan=False)
    after_count = int(after.get("componentCount") or 0)
    assert after_count >= before_count + 1

    items, total = list_program_items(tenant_id=tenant_id, limit=50)
    assert total >= 1
    assert any(i.get("sourceType") == "host_finding" for i in items)


def test_list_findings_api(client: TestClient):
    res = client.get(
        "/tenant/discovery/agents/agent-nonexistent/findings",
        headers={"Authorization": "Bearer qtangl-demo-key"},
    )
    assert res.status_code in {200, 401, 403, 404}
