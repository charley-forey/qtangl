from __future__ import annotations

import csv
import io
import json
import hashlib
import os
from datetime import datetime, timezone
from typing import Any

from app.pqc.models import CryptoAsset, HandshakeProof, MigrationReport, MoscaAssessment, RemediationItem, ScanScenario
from app.pqc.cbom import CBOM_SCHEMA_ID, CBOM_SPEC_VERSION
from app.pqc.compliance_packs import build_compliance_pack
from app.pqc.compliance_controls import compliance_summary
from app.pqc.explain import explain_asset, top_priorities
from app.pqc.migration_roadmap import build_migration_roadmap
from app.pqc.handshake import handshake_appendix_for_report
from app.pqc.references import attach_framework_urls
from app.pqc.risk import crypto_agility_score, mosca_assessment_for_report, readiness_assessment
from app.pqc.signing import sign_report_payload
from app.pqc.standards import standards_summary_for_report
from app.pqc.vulnerability import vulnerability_dict

try:
    from reportlab.lib.pagesizes import letter  # noqa: F401 — used by report_pdf

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False


def honesty_notes() -> list[str]:
    return [
        "This scan is an inventory aid, not a formal cryptographic audit or penetration test.",
        "Quantum-vulnerable does not mean broken today; RSA/ECC remain classically secure until cryptographically relevant QC.",
        "Shor logical-qubit estimates are order-of-magnitude references, not predictions of Q-Day timing.",
        "Coverage is endpoint-scoped; shadow APIs, HSMs, and offline keys may be missed.",
    ]


def build_migration_report(
    *,
    scan_id: str,
    scenario: ScanScenario,
    assets: list[CryptoAsset],
    backlog: list[RemediationItem],
    mosca: MoscaAssessment,
    standards: dict[str, Any],
    deadlines: dict[str, Any],
    handshake_proof: HandshakeProof | None = None,
    target_domain: str | None = None,
    scan_coverage: list[dict[str, Any]] | None = None,
    readiness_band: str = "",
    readiness_summary: str = "",
    scoreboard_summary: dict[str, Any] | None = None,
    remediation_completion_pct: float | None = None,
) -> MigrationReport:
    classified = [asset for asset in assets if asset.kind != "error"]
    confidence = min(95.0, 40.0 + len(classified) * 4.0)
    assessment = readiness_assessment(assets)
    standards_summary = attach_framework_urls(
        standards_summary_for_report(classified, standards, deadlines)
    )
    backlog_list = backlog
    priorities = top_priorities(classified, backlog_list)
    explanations = {asset.id: explain_asset(asset) for asset in classified[:50]}
    agility = crypto_agility_score(classified)
    roadmap = build_migration_roadmap(classified, backlog_list, deadlines)
    controls = compliance_summary(classified)
    q_vuln = sum(
        1 for a in classified if a.vulnerability.status in {"at-risk", "broken"} and not a.pqc_ready
    )
    exposure_low = q_vuln * 25_000
    exposure_high = q_vuln * 85_000
    pack = build_compliance_pack(scenario, standards_summary)
    pack["complianceSummary"] = controls
    report = MigrationReport(
        scan_id=scan_id,
        scenario_id=scenario.id,
        target_domain=target_domain or scenario.target.domain,
        generated_at=datetime.now(timezone.utc).isoformat(),
        readiness_score=float(assessment["score"]),
        coverage_confidence=round(confidence, 1),
        mosca=mosca,
        assets=classified,
        remediation_backlog=backlog_list,
        standards_summary=standards_summary,
        honesty_notes=honesty_notes(),
        compliance_pack=pack,
        handshake_proof=handshake_proof,
        scan_coverage=list(scan_coverage or []),
        readiness_band=readiness_band or str(assessment["band"]),
        readiness_summary=readiness_summary or str(assessment["summary"]),
        scoreboard_summary=scoreboard_summary or {},
        remediation_completion_pct=remediation_completion_pct,
        asset_explanations=explanations,
        crypto_agility_score=agility,
        migration_roadmap=roadmap,
        executive_summary={
            "verdict": assessment["summary"],
            "readinessBand": readiness_band or str(assessment["band"]),
            "topPriorities": priorities,
            "nearestDeadline": _nearest_deadline(standards_summary),
            "exposureRangeUsd": {"low": exposure_low, "high": exposure_high},
            "cryptoAgilityScore": agility,
        },
    )
    json_payload = report_to_json(report)
    report.signature = sign_report_payload(json_payload)
    return report


def _nearest_deadline(standards_summary: list[dict[str, Any]]) -> str:
    deadlines = [str(entry.get("deadline", "")) for entry in standards_summary if entry.get("deadline")]
    return deadlines[0] if deadlines else "2030"


def report_to_json(report: MigrationReport) -> dict[str, Any]:
    mosca_block = mosca_assessment_for_report(report.mosca)
    payload: dict[str, Any] = {
        "scanId": report.scan_id,
        "scenarioId": report.scenario_id,
        "targetDomain": report.target_domain,
        "generatedAt": report.generated_at,
        "readinessScore": report.readiness_score,
        "readinessBand": report.readiness_band,
        "readinessSummary": report.readiness_summary,
        "coverageConfidence": report.coverage_confidence,
        "moscaAssessment": mosca_block,
        "mosca": {
            "dataShelfLifeYears": report.mosca.data_shelf_life_years,
            "migrationTimeYears": report.mosca.migration_time_years,
            "yearsToQDay": report.mosca.years_to_q_day,
            "inequalityHolds": report.mosca.inequality_holds,
            "summary": report.mosca.summary,
        },
        "compliancePack": report.compliance_pack,
        "assets": [_asset_dict(asset) for asset in report.assets],
        "remediationBacklog": [_remediation_dict(item) for item in report.remediation_backlog],
        "standardsSummary": report.standards_summary,
        "honestyNotes": report.honesty_notes,
        "scanCoverage": report.scan_coverage,
        "scoreboardSummary": report.scoreboard_summary,
        "executiveSummary": report.executive_summary,
        "assetExplanations": report.asset_explanations,
        "cryptoAgilityScore": report.crypto_agility_score,
        "migrationRoadmap": report.migration_roadmap,
        "scanDepth": report.scan_depth,
        "complianceSummary": report.compliance_pack.get("complianceSummary", {}),
        "remediationCompletionPct": report.remediation_completion_pct,
        "reportProvenance": _report_provenance(report),
    }
    if report.previous_scan_id:
        payload["previousScanId"] = report.previous_scan_id
    if report.scan_diff:
        payload["scanDiff"] = report.scan_diff
    if report.signature:
        payload["signature"] = report.signature
    if report.handshake_proof is not None:
        payload["handshakeAppendix"] = handshake_appendix_for_report(report.handshake_proof)
    return payload


def report_to_csv(report: MigrationReport) -> str:
    buffer = io.StringIO()
    writer = csv.DictWriter(
        buffer,
        fieldnames=[
            "priority",
            "assetId",
            "title",
            "action",
            "pqcAlgorithm",
            "deadline",
            "effortDays",
            "severity",
            "summary",
        ],
    )
    writer.writeheader()
    for item in report.remediation_backlog:
        writer.writerow(
            {
                "priority": item.priority,
                "assetId": item.asset_id,
                "title": item.title,
                "action": item.action,
                "pqcAlgorithm": item.pqc_algorithm,
                "deadline": item.deadline,
                "effortDays": item.effort_days,
                "severity": item.severity,
                "summary": item.summary,
            }
        )
    return buffer.getvalue()


def report_to_cbom(report: MigrationReport) -> dict[str, Any]:
    """Export a CycloneDX 1.6 CBOM document (Qtangl profile ``qtangl-cbom-v1``)."""
    backlog_by_asset = {item.asset_id: item for item in report.remediation_backlog}
    components: list[dict[str, Any]] = []

    for asset in report.assets:
        remediation = backlog_by_asset.get(asset.id)
        properties = _cbom_asset_properties(asset, remediation)
        component: dict[str, Any] = {
            "type": "cryptographic-asset",
            "bom-ref": f"qtangl:asset:{asset.id}",
            "name": asset.label,
            "version": asset.algorithm,
            "description": asset.vulnerability.summary,
            "properties": properties,
        }
        if asset.kind == "tls":
            component["cryptoProperties"] = {
                "assetType": "certificate",
                "certificateProperties": {
                    "subjectName": asset.host,
                    "signatureAlgorithm": asset.algorithm,
                    "certificateFormat": "X.509",
                },
            }
        components.append(component)

    scan_uuid = report.scan_id.removeprefix("scan-")
    return {
        "bomFormat": "CycloneDX",
        "specVersion": CBOM_SPEC_VERSION,
        "serialNumber": f"urn:uuid:{scan_uuid}",
        "version": 1,
        "metadata": {
            "timestamp": report.generated_at,
            "tools": [{"vendor": "Qtangl", "name": "pqc-scanner", "version": "0.1.0"}],
            "component": {"type": "application", "name": "qtangl-pqc-scanner", "version": "0.1.0"},
            "properties": [
                {"name": "qtangl:cbomSchemaId", "value": CBOM_SCHEMA_ID},
                {"name": "qtangl:scanId", "value": report.scan_id},
                {"name": "qtangl:scenarioId", "value": report.scenario_id},
                {"name": "qtangl:readinessScore", "value": str(report.readiness_score)},
                {"name": "qtangl:targetDomain", "value": report.target_domain},
                {"name": "qtangl:coverageConfidence", "value": str(report.coverage_confidence)},
            ],
        },
        "components": components,
    }


def _cbom_asset_properties(
    asset: CryptoAsset,
    remediation: RemediationItem | None,
) -> list[dict[str, str]]:
    properties = [
        {"name": "qtangl:assetId", "value": asset.id},
        {"name": "qtangl:host", "value": asset.host},
        {"name": "qtangl:port", "value": str(asset.port or "")},
        {"name": "qtangl:kind", "value": asset.kind},
        {"name": "qtangl:algorithm", "value": asset.algorithm},
        {"name": "qtangl:keySize", "value": str(asset.key_size or "")},
        {"name": "qtangl:vulnerabilityStatus", "value": asset.vulnerability.status},
        {"name": "qtangl:severity", "value": asset.vulnerability.severity},
        {"name": "qtangl:pqcReplacement", "value": asset.vulnerability.pqc_replacement},
        {"name": "qtangl:moscaPriority", "value": str(asset.mosca_priority)},
        {"name": "qtangl:hndlExposed", "value": str(asset.vulnerability.hndl_exposed).lower()},
    ]
    if remediation:
        properties.extend(
            [
                {"name": "qtangl:remediationDeadline", "value": remediation.deadline},
                {"name": "qtangl:remediationPqcAlgorithm", "value": remediation.pqc_algorithm},
                {"name": "qtangl:remediationEffortDays", "value": str(remediation.effort_days)},
                {"name": "qtangl:remediationPriority", "value": str(remediation.priority)},
            ]
        )
    return properties


def report_to_executive(report: MigrationReport) -> dict[str, Any]:
    """One-page board summary for executive export."""
    critical = sum(1 for item in report.remediation_backlog if item.severity in {"critical", "high"})
    top = report.remediation_backlog[:5]
    diff = report.scan_diff or {}
    return {
        "scanId": report.scan_id,
        "targetDomain": report.target_domain,
        "generatedAt": report.generated_at,
        "readinessScore": report.readiness_score,
        "readinessBand": report.readiness_band,
        "coverageConfidence": report.coverage_confidence,
        "cryptoAgilityScore": report.crypto_agility_score,
        "moscaSummary": report.mosca.summary,
        "moscaInequalityHolds": report.mosca.inequality_holds,
        "criticalFindings": critical,
        "topPriorities": [
            {"title": item.title, "severity": item.severity, "deadline": item.deadline}
            for item in top
        ],
        "compliancePackTitle": report.compliance_pack.get("title"),
        "scanDiffSummary": diff.get("summary"),
        "readinessDelta": diff.get("readinessDelta"),
        "executiveSummary": report.executive_summary,
        "verifyUrl": f"/verify?scanId={report.scan_id}",
        "reportProvenance": _report_provenance(report),
    }


def report_to_board(report: MigrationReport) -> dict[str, Any]:
    """Board-focused concise narrative payload."""
    executive = report.executive_summary or {}
    diff = report.scan_diff or {}
    top = report.remediation_backlog[:3]
    return {
        "scanId": report.scan_id,
        "generatedAt": report.generated_at,
        "targetDomain": report.target_domain,
        "readinessBand": report.readiness_band,
        "readinessScore": report.readiness_score,
        "businessRiskDelta": diff.get("summary") or report.readiness_summary,
        "budgetForecastUsd": executive.get("exposureRangeUsd", {}),
        "ninetyDayDecisions": [
            {
                "decision": item.title,
                "deadline": item.deadline,
                "severity": item.severity,
            }
            for item in top
        ],
        "verifyUrl": f"/verify?scanId={report.scan_id}",
        "reportProvenance": _report_provenance(report),
    }


def report_to_auditor(report: MigrationReport) -> dict[str, Any]:
    """Evidence-first payload for auditors and assurance teams."""
    return {
        "scanId": report.scan_id,
        "generatedAt": report.generated_at,
        "targetDomain": report.target_domain,
        "controlMapping": report.compliance_pack.get("controlThemes", []),
        "complianceSummary": report.compliance_pack.get("complianceSummary", {}),
        "chainOfCustody": {
            "signaturePresent": bool(report.signature),
            "verifyUrl": f"/verify?scanId={report.scan_id}",
            "contentHash": (report.signature or {}).get("contentHash", ""),
            "signedAt": (report.signature or {}).get("signedAt", ""),
        },
        "reportProvenance": _report_provenance(report),
    }


def _report_provenance(report: MigrationReport) -> dict[str, Any]:
    signature = report.signature or {}
    signing_key_id = signature.get("keyFingerprint", "")
    payload_for_hash = {
        "scenarioId": report.scenario_id,
        "targetDomain": report.target_domain,
        "scanDepth": report.scan_depth,
        "assetCount": len(report.assets),
        "coverageConfidence": report.coverage_confidence,
    }
    config_hash = hashlib.sha256(json.dumps(payload_for_hash, sort_keys=True).encode("utf-8")).hexdigest()[:20]
    return {
        "signingKeyId": signing_key_id,
        "generatedAt": report.generated_at,
        "scanConfigHash": config_hash,
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "unknown"),
    }


def report_to_pdf(report: MigrationReport) -> bytes:
    if not _HAS_REPORTLAB:
        payload = json.dumps(report_to_json(report), indent=2).encode("utf-8")
        return payload

    from app.pqc.report_pdf import build_pdf

    return build_pdf(report)


def _asset_dict(asset: CryptoAsset) -> dict[str, Any]:
    return {
        "id": asset.id,
        "kind": asset.kind,
        "host": asset.host,
        "port": asset.port,
        "label": asset.label,
        "algorithm": asset.algorithm,
        "keySize": asset.key_size,
        "vulnerability": vulnerability_dict(asset.vulnerability),
        "hndlVerdict": asset.hndl_verdict,
        "alreadyTooLate": asset.already_too_late,
        "moscaPriority": asset.mosca_priority,
        "standardsRefs": asset.standards_refs,
    }


def _remediation_dict(item: RemediationItem) -> dict[str, Any]:
    return {
        "id": item.id,
        "assetId": item.asset_id,
        "priority": item.priority,
        "title": item.title,
        "action": item.action,
        "pqcAlgorithm": item.pqc_algorithm,
        "deadline": item.deadline,
        "effortDays": item.effort_days,
        "severity": item.severity,
        "summary": item.summary,
        "standardsRefs": item.standards_refs,
    }
