"""API-level deep link contract tests."""

from __future__ import annotations

from app.store.tenant_alerts import _action_url_for_rule


def test_new_quantum_vulnerable_deep_link():
    url = _action_url_for_rule(
        "new_quantum_vulnerable",
        {"scanId": "scan-1", "remediationId": "rem-1"},
    )
    assert "tab=remediate" in url
    assert "scanId=scan-1" in url
    assert "remediationId=rem-1" in url


def test_drift_alert_monitor_link():
    url = _action_url_for_rule("drift_external", {"scanId": "scan-1"})
    assert "tab=monitor" in url
    assert "action=drift" in url


def test_readiness_drop_scans_link():
    url = _action_url_for_rule("readiness_drop", {"scanId": "scan-9"})
    assert url == "/command-center?tab=scans&scanId=scan-9"
