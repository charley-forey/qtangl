"""Tests for alert auto-resolve on remediation verify."""

from __future__ import annotations

import pytest

from app.store.tenant_alerts import list_alerts, persist_alert, resolve_alerts_for_remediation


@pytest.fixture(autouse=True)
def clear_memory_alerts(monkeypatch):
    monkeypatch.setattr("app.db.config.persistence_enabled", lambda: False)
    from app.store import tenant_alerts

    tenant_alerts._memory_alerts.clear()
    yield
    tenant_alerts._memory_alerts.clear()


def test_resolve_alerts_on_verify():
    tenant_id = "tenant-test"
    scan_id = "scan-baseline"
    remediation_id = "rem-critical-1"
    verify_scan_id = "scan-verify"

    persist_alert(
        tenant_id=tenant_id,
        rule="new_quantum_vulnerable",
        severity="critical",
        message="New QV asset detected",
        source="scan",
        payload={"scanId": scan_id, "remediationId": remediation_id},
    )
    persist_alert(
        tenant_id=tenant_id,
        rule="new_quantum_vulnerable",
        severity="critical",
        message="Other scan alert",
        source="scan",
        payload={"scanId": "other-scan", "remediationId": "rem-other"},
    )

    before = list_alerts(tenant_id=tenant_id)
    assert len(before) == 2

    count = resolve_alerts_for_remediation(
        tenant_id=tenant_id,
        scan_id=scan_id,
        remediation_id=remediation_id,
        verify_scan_id=verify_scan_id,
    )
    assert count == 1

    after = list_alerts(tenant_id=tenant_id)
    assert len(after) == 1
    assert after[0]["payload"]["scanId"] == "other-scan"

    resolved = list_alerts(tenant_id=tenant_id, include_resolved=True)
    resolved_match = [a for a in resolved if a.get("payload", {}).get("scanId") == scan_id]
    assert len(resolved_match) == 1
    assert resolved_match[0].get("resolvedAt") or resolved_match[0].get("resolution") == "verified"
