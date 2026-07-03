"""Tests for Command Center Next Wave backend."""

from __future__ import annotations

from app.command_center.guardrails import evaluate_method_honesty, sanitize_ai_output
from app.command_center.graph import build_scan_graph
from app.command_center.hndl import build_hndl_exposure
from app.command_center.correlation import group_alerts
from app.pqc.models import CryptoAsset, MigrationReport, MoscaAssessment, QuantumVulnerability


def _mosca() -> MoscaAssessment:
    return MoscaAssessment(
        data_shelf_life_years=10,
        migration_time_years=5,
        years_to_q_day=12,
        inequality_holds=True,
        summary="Test mosca",
    )


def _report(assets: list[CryptoAsset]) -> MigrationReport:
    return MigrationReport(
        scan_id="scan-1",
        scenario_id="test",
        target_domain="example.com",
        generated_at="2026-01-01T00:00:00Z",
        readiness_score=70.0,
        coverage_confidence=0.8,
        mosca=_mosca(),
        assets=assets,
        remediation_backlog=[],
        standards_summary=[],
        honesty_notes=[],
    )


def _asset(aid: str, host: str, algo: str, hndl: bool = True) -> CryptoAsset:
    vuln = QuantumVulnerability(
        algorithm=algo,
        key_size=2048,
        shor_logical_qubits=None,
        classical_security_bits=112,
        status="at-risk",
        hndl_exposed=hndl,
        pqc_replacement="ML-KEM",
        severity="high",
        summary="Test",
    )
    return CryptoAsset(
        id=aid,
        kind="tls",
        host=host,
        port=443,
        label=f"cert-{host}",
        algorithm=algo,
        key_size=2048,
        validity_days=365,
        san_domains=[host],
        negotiated_cipher=None,
        negotiated_group=None,
        tls_version="TLS1.2",
        vulnerability=vuln,
        hndl_verdict="HNDL exposure",
        already_too_late=False,
        mosca_priority=0.5,
        standards_refs=[],
    )


def test_build_scan_graph_nodes():
    report = _report([_asset("a1", "api.example.com", "RSA-2048")])
    graph = build_scan_graph(scan_id="scan-1", report=report)
    assert graph.scanId == "scan-1"
    assert graph.nodeCount >= 2
    kinds = {n.kind for n in graph.nodes}
    assert "host" in kinds


def test_hndl_exposure_ordering():
    report = _report(
        [
            _asset("a1", "low.example.com", "RSA-2048", hndl=False),
            _asset("a2", "high.example.com", "RSA-4096", hndl=True),
        ]
    )
    payload = build_hndl_exposure(report=report, scan_id="scan-1")
    assert payload.exposedCount == 1
    assert payload.items[0].assetId == "a2"


def test_method_honesty_guardrail_blocks_qday():
    ok, violations = evaluate_method_honesty("We predict Q-Day in 2028.")
    assert not ok
    assert violations


def test_sanitize_ai_output_appends_disclaimer():
    text = sanitize_ai_output("We are certified compliant today.")
    assert "inventory aid" in text.lower()


def test_group_alerts_by_host():
    alerts = [
        {"id": "1", "severity": "high", "message": "drift", "host": "api.acme.com"},
        {"id": "2", "severity": "medium", "message": "drift2", "host": "api.acme.com"},
    ]
    result = group_alerts(alerts)
    assert len(result.incidents) == 1
    assert result.incidents[0].alertIds == ["1", "2"]
