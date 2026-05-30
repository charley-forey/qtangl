from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timezone
from typing import Any

from app.pqc.models import CryptoAsset, HandshakeProof, MigrationReport, MoscaAssessment, RemediationItem, ScanScenario
from app.pqc.cbom import CBOM_SCHEMA_ID, CBOM_SPEC_VERSION
from app.pqc.compliance_packs import build_compliance_pack
from app.pqc.handshake import handshake_appendix_for_report
from app.pqc.risk import mosca_assessment_for_report, readiness_score, remediation_coverage
from app.pqc.standards import standards_summary_for_report
from app.pqc.vulnerability import vulnerability_dict

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

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
) -> MigrationReport:
    confidence = min(95.0, 40.0 + len(assets) * 4.0)
    standards_summary = standards_summary_for_report(assets, standards, deadlines)
    return MigrationReport(
        scan_id=scan_id,
        scenario_id=scenario.id,
        target_domain=scenario.target.domain,
        generated_at=datetime.now(timezone.utc).isoformat(),
        readiness_score=readiness_score(assets),
        coverage_confidence=round(confidence, 1),
        mosca=mosca,
        assets=assets,
        remediation_backlog=backlog,
        standards_summary=standards_summary,
        honesty_notes=honesty_notes(),
        compliance_pack=build_compliance_pack(scenario, standards_summary),
        handshake_proof=handshake_proof,
    )


def report_to_json(report: MigrationReport) -> dict[str, Any]:
    mosca_block = mosca_assessment_for_report(report.mosca)
    payload: dict[str, Any] = {
        "scanId": report.scan_id,
        "scenarioId": report.scenario_id,
        "targetDomain": report.target_domain,
        "generatedAt": report.generated_at,
        "readinessScore": report.readiness_score,
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
    }
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


def report_to_pdf(report: MigrationReport) -> bytes:
    if not _HAS_REPORTLAB:
        payload = json.dumps(report_to_json(report), indent=2).encode("utf-8")
        return payload

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 72

    y = _pdf_draw_heading(pdf, y, height, "Qtangl Q-Day Readiness Report", size=16)
    y = _pdf_draw_lines(
        pdf,
        y,
        height,
        [
            f"Target: {report.target_domain}",
            f"Scenario: {report.scenario_id}",
            f"Readiness score: {report.readiness_score}/100",
            f"Coverage confidence: {report.coverage_confidence}%",
            f"Assets discovered: {len(report.assets)}",
            f"Remediation items: {len(report.remediation_backlog)}",
        ],
    )

    mosca = mosca_assessment_for_report(report.mosca)
    y = _pdf_draw_heading(pdf, y, height, mosca["headline"], size=13)
    y = _pdf_draw_lines(
        pdf,
        y,
        height,
        [
            f"Formula: {mosca['formula']} — sum X+Y = {mosca['sumXY']} yr, Z = {mosca['variables']['yearsToQDay']} yr",
            f"HNDL risk level: {mosca['hndlRiskLevel']} (inequality holds: {mosca['inequalityHolds']})",
            mosca["summary"],
            mosca["interpretation"],
        ],
    )

    pack = report.compliance_pack
    y = _pdf_draw_heading(pdf, y, height, "Compliance framework mapping", size=13)
    if pack.get("title"):
        y = _pdf_draw_lines(pdf, y, height, [pack["title"], f"Mandate: {pack.get('mandate', '')}"])
    for framework in pack.get("primaryFrameworks", [])[:5]:
        y = _pdf_draw_lines(
            pdf,
            y,
            height,
            [f"{framework['name']}: {framework['relevance']}"],
            font_size=10,
        )
    for theme in pack.get("controlThemes", [])[:5]:
        y = _pdf_draw_lines(
            pdf,
            y,
            height,
            [f"{theme['framework']} ({theme['controlRef']}): {theme['theme']}"],
            font_size=10,
        )
    for gap in pack.get("gapFindings", [])[:6]:
        y = _pdf_draw_lines(
            pdf,
            y,
            height,
            [f"[{gap.get('status', 'gap')}] {gap.get('asset', '')}: {gap.get('finding', '')}"],
            font_size=9,
        )

    y = _pdf_draw_heading(pdf, y, height, "Top remediation backlog", size=12)
    for item in report.remediation_backlog[:12]:
        y = _pdf_draw_lines(pdf, y, height, [f"{item.priority}. {item.title} — {item.deadline}"], font_size=10)

    if report.handshake_proof is not None:
        appendix = handshake_appendix_for_report(report.handshake_proof)
        y = _pdf_draw_heading(pdf, y, height, appendix["title"], size=12)
        y = _pdf_draw_lines(
            pdf,
            y,
            height,
            [
                f"Mode: {appendix['mode']} | Server: {appendix['server']}:{appendix['port']}",
                f"TLS: {appendix['tlsVersion']} | Hybrid group: {appendix['hybridGroup']}",
                f"KEM: {appendix['kemAlgorithm']} | Groups: {', '.join(appendix['namedGroups'][:4])}",
                f"ClientHello excerpt ({appendix['clientHelloHexLength']} hex chars): {appendix['clientHelloExcerpt']}…",
                appendix["summary"],
            ],
            font_size=9,
        )

    pdf.save()
    return buffer.getvalue()


def _pdf_draw_heading(pdf: Any, y: float, height: float, text: str, *, size: int = 12) -> float:
    y -= 8
    if y < 72:
        pdf.showPage()
        y = height - 72
    pdf.setFont("Helvetica-Bold", size)
    pdf.drawString(72, y, text[:95])
    return y - (size + 6)


def _pdf_draw_lines(
    pdf: Any,
    y: float,
    height: float,
    lines: list[str],
    *,
    font_size: int = 11,
) -> float:
    pdf.setFont("Helvetica", font_size)
    for line in lines:
        if y < 72:
            pdf.showPage()
            y = height - 72
            pdf.setFont("Helvetica", font_size)
        pdf.drawString(72, y, line[:115])
        y -= font_size + 4
    return y


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
