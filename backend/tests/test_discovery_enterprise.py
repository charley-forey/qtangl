from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

from app.discovery.agent_certs import issue_agent_certificate, verify_agent_certificate
from app.discovery.source_runtime_diff import compute_source_runtime_diff
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_issue_and_verify_agent_cert():
    cert = issue_agent_certificate(agent_id="agent-test", tenant_id="tenant-test")
    assert cert["certPem"].startswith("-----BEGIN CERTIFICATE-----")
    assert verify_agent_certificate(
        agent_id="agent-test",
        tenant_id="tenant-test",
        cert_pem=cert["certPem"],
    )


def test_source_runtime_bom_ref_diff():
    source = [{"algorithm": "RSA", "metadata": {"bomRef": "pkg:gem/openssl@1.1"}}]
    runtime = [{"algorithm": "RSA", "metadata": {"bomRef": "pkg:deb/openssl@3.0"}}]
    diff = compute_source_runtime_diff(source_findings=source, runtime_findings=runtime)
    assert diff["overlapCount"] == 0
    assert len(diff["runtimeOnly"]) == 1


def test_offline_upload_rejects_zip_traversal(client: TestClient):
    res = client.post(
        "/tenant/discovery/offline-upload",
        json={"archivePath": "../../etc/passwd", "findings": []},
        headers={"Authorization": "Bearer qtangl-demo-key"},
    )
    assert res.status_code in {400, 401, 403}


def test_cmdb_coverage_endpoint(client: TestClient):
    res = client.get(
        "/tenant/discovery/cmdb-coverage",
        headers={"Authorization": "Bearer qtangl-demo-key"},
    )
    assert res.status_code in {200, 401, 403}
    if res.status_code == 200:
        body = res.json()
        assert "coveragePercent" in body


def test_mtls_required_blocks_agent_without_cert(monkeypatch: pytest.MonkeyPatch, client: TestClient):
    monkeypatch.setenv("DISCOVERY_MTLS_REQUIRED", "true")
    res = client.post(
        "/discovery/agent/heartbeat",
        json={"agentId": "agent-1", "tenantId": "sandbox"},
    )
    assert res.status_code == 401


def test_sandbox_cli_refuses_without_flag(monkeypatch: pytest.MonkeyPatch):
    from app.discovery.orchestrator import run_sandbox_cli

    monkeypatch.delenv("QTANGL_SCANNER_SANDBOX", raising=False)
    with pytest.raises(SystemExit):
        run_sandbox_cli()
