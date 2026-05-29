from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timezone
from typing import Any

from app.pqc.models import CryptoAsset, MigrationReport, MoscaAssessment, RemediationItem, ScanScenario
from app.pqc.risk import readiness_score, remediation_coverage
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
) -> MigrationReport:
    confidence = min(95.0, 40.0 + len(assets) * 4.0)
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
        standards_summary=standards_summary_for_report(assets, standards, deadlines),
        honesty_notes=honesty_notes(),
    )


def report_to_json(report: MigrationReport) -> dict[str, Any]:
    return {
        "scanId": report.scan_id,
        "scenarioId": report.scenario_id,
        "targetDomain": report.target_domain,
        "generatedAt": report.generated_at,
        "readinessScore": report.readiness_score,
        "coverageConfidence": report.coverage_confidence,
        "mosca": {
            "dataShelfLifeYears": report.mosca.data_shelf_life_years,
            "migrationTimeYears": report.mosca.migration_time_years,
            "yearsToQDay": report.mosca.years_to_q_day,
            "inequalityHolds": report.mosca.inequality_holds,
            "summary": report.mosca.summary,
        },
        "assets": [_asset_dict(asset) for asset in report.assets],
        "remediationBacklog": [_remediation_dict(item) for item in report.remediation_backlog],
        "standardsSummary": report.standards_summary,
        "honestyNotes": report.honesty_notes,
    }


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
    components = []
    for asset in report.assets:
        components.append(
            {
                "type": "cryptographic-asset",
                "name": asset.label,
                "version": asset.algorithm,
                "properties": [
                    {"name": "qtangl:host", "value": asset.host},
                    {"name": "qtangl:kind", "value": asset.kind},
                    {"name": "qtangl:severity", "value": asset.vulnerability.severity},
                    {"name": "qtangl:status", "value": asset.vulnerability.status},
                    {"name": "qtangl:pqcReplacement", "value": asset.vulnerability.pqc_replacement},
                ],
            }
        )
    return {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "version": 1,
        "metadata": {
            "timestamp": report.generated_at,
            "component": {"name": "qtangl-pqc-scanner", "version": "0.1.0"},
            "properties": [
                {"name": "qtangl:readinessScore", "value": str(report.readiness_score)},
                {"name": "qtangl:targetDomain", "value": report.target_domain},
            ],
        },
        "components": components,
    }


def report_to_pdf(report: MigrationReport) -> bytes:
    if not _HAS_REPORTLAB:
        payload = json.dumps(report_to_json(report), indent=2).encode("utf-8")
        return payload

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 72
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(72, y, "Qtangl Q-Day Readiness Report")
    y -= 24
    pdf.setFont("Helvetica", 11)
    lines = [
        f"Target: {report.target_domain}",
        f"Scenario: {report.scenario_id}",
        f"Readiness score: {report.readiness_score}/100",
        f"Coverage confidence: {report.coverage_confidence}%",
        f"Assets discovered: {len(report.assets)}",
        f"Remediation items: {len(report.remediation_backlog)}",
        report.mosca.summary,
    ]
    for line in lines:
        pdf.drawString(72, y, line[:95])
        y -= 16
        if y < 72:
            pdf.showPage()
            y = height - 72

    y -= 8
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(72, y, "Top remediation backlog")
    y -= 18
    pdf.setFont("Helvetica", 10)
    for item in report.remediation_backlog[:12]:
        pdf.drawString(72, y, f"{item.priority}. {item.title} — {item.deadline}")
        y -= 14
        if y < 72:
            pdf.showPage()
            y = height - 72

    pdf.save()
    return buffer.getvalue()


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
