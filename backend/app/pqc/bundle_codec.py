from __future__ import annotations

import json
from typing import Any

from app.pqc.models import (
    HandshakeProof,
    MigrationReport,
    MoscaAssessment,
    ScanBundle,
    ScanScenario,
)
from app.pqc.report import report_to_json


def bundle_from_api_dict(payload: dict[str, Any]) -> ScanBundle:
    """Rebuild a ScanBundle from serialized API output (report-focused subset)."""
    report_payload = payload.get("report", {})
    mosca_payload = payload.get("mosca", report_payload.get("moscaAssessment", {}))
    mosca = MoscaAssessment(
        data_shelf_life_years=float(mosca_payload.get("dataShelfLifeYears", mosca_payload.get("variables", {}).get("dataShelfLifeYears", 10))),
        migration_time_years=float(mosca_payload.get("migrationTimeYears", mosca_payload.get("variables", {}).get("migrationTimeYears", 5))),
        years_to_q_day=float(mosca_payload.get("yearsToQDay", mosca_payload.get("variables", {}).get("yearsToQDay", 12))),
        inequality_holds=bool(mosca_payload.get("inequalityHolds", False)),
        summary=str(mosca_payload.get("summary", "")),
    )
    handshake_raw = payload.get("handshakeProof", {})
    handshake = HandshakeProof(
        mode=handshake_raw.get("mode", "fixture"),
        server=handshake_raw.get("server", ""),
        port=int(handshake_raw.get("port", 443)),
        tls_version=handshake_raw.get("tlsVersion", ""),
        hybrid_group=handshake_raw.get("hybridGroup", ""),
        kem_algorithm=handshake_raw.get("kemAlgorithm", ""),
        client_hello_hex=handshake_raw.get("clientHelloExcerpt", "00"),
        named_groups=list(handshake_raw.get("namedGroups", [])),
        cipher_suites=list(handshake_raw.get("cipherSuites", [])),
        summary=handshake_raw.get("summary", ""),
        captured_at=handshake_raw.get("capturedAt", ""),
        metadata=dict(handshake_raw.get("metadata", {})),
    )
    scenario_raw = payload.get("scenario", {})
    report = MigrationReport(
        scan_id=str(report_payload.get("scanId", payload.get("scanId", ""))),
        scenario_id=str(report_payload.get("scenarioId", scenario_raw.get("id", ""))),
        target_domain=str(report_payload.get("targetDomain", "")),
        generated_at=str(report_payload.get("generatedAt", "")),
        readiness_score=float(report_payload.get("readinessScore", 0)),
        coverage_confidence=float(report_payload.get("coverageConfidence", 0)),
        mosca=mosca,
        assets=[],
        remediation_backlog=[],
        standards_summary=list(report_payload.get("standardsSummary", [])),
        honesty_notes=list(report_payload.get("honestyNotes", [])),
        compliance_pack=dict(report_payload.get("compliancePack", {})),
        handshake_proof=handshake,
        scan_coverage=list(report_payload.get("scanCoverage", [])),
        readiness_band=str(report_payload.get("readinessBand", "")),
        readiness_summary=str(report_payload.get("readinessSummary", "")),
        scoreboard_summary=dict(report_payload.get("scoreboardSummary", {})),
        signature=dict(report_payload.get("signature", {})) or None,
        executive_summary=dict(report_payload.get("executiveSummary", {})),
        remediation_completion_pct=report_payload.get("remediationCompletionPct"),
        asset_explanations=dict(report_payload.get("assetExplanations", {})),
        crypto_agility_score=report_payload.get("cryptoAgilityScore"),
        migration_roadmap=list(report_payload.get("migrationRoadmap", [])),
        scan_depth=str(report_payload.get("scanDepth", "standard")),
        scan_diff=dict(report_payload.get("scanDiff", {})) or None,
        previous_scan_id=report_payload.get("previousScanId"),
    )
    scenario = ScanScenario(
        id=str(scenario_raw.get("id", report.scenario_id)),
        title=str(scenario_raw.get("title", report.scenario_id)),
        summary=str(scenario_raw.get("summary", "")),
        target=_placeholder_target(scenario_raw),
        manual_baseline=_placeholder_baseline(scenario_raw),
    )
    return ScanBundle(
        scan_id=str(payload.get("scanId", report.scan_id)),
        scenario=scenario,
        assets=[],
        remediation_backlog=[],
        scoreboard=_placeholder_scoreboard(payload.get("scoreboard", {})),
        handshake_proof=handshake,
        report=report,
        mosca=mosca,
        timeline=[],
        details=dict(payload.get("details", {})),
    )


def report_dict_from_bundle_payload(payload: dict[str, Any]) -> dict[str, Any]:
    return dict(payload.get("report", {}))


def _placeholder_target(scenario_raw: dict[str, Any]):
    from app.pqc.models import ScanTarget

    target = scenario_raw.get("target", {})
    return ScanTarget(
        domain=str(target.get("domain", "unknown.example")),
        ports=list(target.get("ports", [443])),
        persona=str(target.get("persona", "")),
        organization=str(target.get("organization", "")),
        mandate=str(target.get("mandate", "")),
    )


def _placeholder_baseline(scenario_raw: dict[str, Any]):
    from app.pqc.models import ManualBaseline

    baseline = scenario_raw.get("manualBaseline", scenario_raw.get("manual_baseline", {}))
    return ManualBaseline(
        inventory_weeks=int(baseline.get("inventoryWeeks", baseline.get("inventory_weeks", 0))),
        assets_found=int(baseline.get("assetsFound", baseline.get("assets_found", 0))),
        quantum_vulnerable=int(
            baseline.get("quantumVulnerable", baseline.get("quantum_vulnerable", 0))
        ),
        readiness_score=float(
            baseline.get("readinessScore", baseline.get("readiness_score", 0))
        ),
        summary=str(baseline.get("summary", "")),
    )


def _placeholder_scoreboard(raw: dict[str, Any]):
    from app.pqc.models import RiskScoreboard, ScoreboardColumn

    def col(data: dict[str, Any]) -> ScoreboardColumn:
        return ScoreboardColumn(
            label=str(data.get("label", "")),
            scan_wall_time_seconds=float(
                data.get("scan_wall_time_seconds", data.get("scanWallTimeSeconds", 0))
            ),
            assets_discovered=int(
                data.get("assets_discovered", data.get("assetsDiscovered", 0))
            ),
            quantum_vulnerable=int(
                data.get("quantum_vulnerable", data.get("quantumVulnerable", 0))
            ),
            hndl_exposed=int(data.get("hndl_exposed", data.get("hndlExposed", 0))),
            readiness_score=float(
                data.get("readiness_score", data.get("readinessScore", 0))
            ),
            remediation_coverage=float(
                data.get("remediation_coverage", data.get("remediationCoverage", 0))
            ),
            audit_pack_available=bool(
                data.get("audit_pack_available", data.get("auditPackAvailable", False))
            ),
            summary=str(data.get("summary", "")),
            readiness_band=str(data.get("readiness_band", data.get("readinessBand", ""))),
        )

    return RiskScoreboard(
        manual=col(raw.get("manual", {})),
        qtangl=col(raw.get("qtangl", {})),
    )
