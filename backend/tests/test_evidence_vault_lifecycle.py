"""Evidence vault retain, list, summary, and purge lifecycle."""

from __future__ import annotations

import os
import tempfile
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.db.engine import init_db
from app.evidence.vault import (
    list_vault_objects,
    purge_expired_vault_objects,
    retain_scan_evidence,
    vault_summary,
)
from app.main import app
from app.tenants.service import create_tenant, issue_api_key


@pytest.fixture
def vault_db(monkeypatch: pytest.MonkeyPatch):
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "vault.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    monkeypatch.setenv("QTANGL_EVIDENCE_RETENTION_MONTHS", "12")
    _reset_engine()
    init_db()
    yield
    _reset_engine()
    monkeypatch.delenv("DATABASE_URL", raising=False)
    tmp.cleanup()


@pytest.fixture
def vault_client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    tmp = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmp.name, "vault.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("QTANGL_DB_AUTO_MIGRATE", "true")
    monkeypatch.setenv("QTANGL_EVIDENCE_RETENTION_MONTHS", "12")
    _reset_engine()
    init_db()
    tenant = create_tenant(name="Vault Co", tenant_id="tenant-vault")
    key = issue_api_key(tenant_id=tenant["tenantId"], role="admin")["apiKey"]
    client = TestClient(app)
    client.tenant_key = key  # type: ignore[attr-defined]
    yield client
    _reset_engine()
    monkeypatch.delenv("DATABASE_URL", raising=False)
    tmp.cleanup()


def _reset_engine() -> None:
    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None


def test_retain_and_list_vault_objects(vault_db) -> None:
    retained = retain_scan_evidence(
        tenant_id="tenant-vault",
        scan_id="scan-retain-001",
        content_hash="abc123",
        object_type="bundle",
        storage_key="s3://bucket/scan-retain-001.zip",
    )
    assert retained["retained"] is True
    assert retained["scanId"] == "scan-retain-001"

    objects = list_vault_objects(tenant_id="tenant-vault")
    assert len(objects) >= 1
    assert objects[0]["scanId"] == "scan-retain-001"
    assert objects[0]["contentHash"] == "abc123"


def test_retain_updates_existing_row(vault_db) -> None:
    retain_scan_evidence(
        tenant_id="tenant-vault",
        scan_id="scan-update-001",
        content_hash="hash-v1",
        object_type="bundle",
    )
    updated = retain_scan_evidence(
        tenant_id="tenant-vault",
        scan_id="scan-update-001",
        content_hash="hash-v2",
        object_type="bundle",
    )
    assert updated["retained"] is True
    objects = [o for o in list_vault_objects(tenant_id="tenant-vault") if o["scanId"] == "scan-update-001"]
    assert len(objects) == 1
    assert objects[0]["contentHash"] == "hash-v2"


def test_vault_summary_active_count(vault_db) -> None:
    retain_scan_evidence(tenant_id="tenant-vault", scan_id="scan-summary-001", content_hash="s1")
    summary = vault_summary(tenant_id="tenant-vault")
    assert summary["total"] >= 1
    assert summary["active"] >= 1
    assert "objects" in summary


def test_purge_expired_vault_objects(vault_db) -> None:
    retain_scan_evidence(
        tenant_id="tenant-vault",
        scan_id="scan-expired-001",
        content_hash="expired",
        retention_months=0,
    )
    from app.db.engine import db_session
    from app.db.models import EvidenceVaultObject

    with db_session() as session:
        row = (
            session.query(EvidenceVaultObject)
            .filter(
                EvidenceVaultObject.tenant_id == "tenant-vault",
                EvidenceVaultObject.scan_id == "scan-expired-001",
            )
            .one()
        )
        row.retained_until = datetime.now(timezone.utc) - timedelta(days=1)

    removed = purge_expired_vault_objects()
    assert removed >= 1
    remaining = [o for o in list_vault_objects(tenant_id="tenant-vault") if o["scanId"] == "scan-expired-001"]
    assert remaining == []


def test_tenant_evidence_vault_api(vault_client: TestClient) -> None:
    retain_scan_evidence(tenant_id="tenant-vault", scan_id="scan-api-001", content_hash="api-hash")
    response = vault_client.get(
        "/tenant/evidence",
        headers={"Authorization": f"Bearer {vault_client.tenant_key}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["total"] >= 1
