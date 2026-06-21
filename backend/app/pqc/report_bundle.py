from __future__ import annotations

import io
import json
import zipfile
from typing import Any

from app.pqc.models import MigrationReport
from app.pqc.references import glossary_for_report, references_for_report
from app.pqc.report import report_to_cbom, report_to_csv, report_to_json, report_to_pdf


def build_evidence_bundle(
    report: MigrationReport,
    *,
    remediation_statuses: list[dict[str, Any]] | None = None,
    branding: dict[str, Any] | None = None,
    pdf_options: dict[str, Any] | None = None,
) -> bytes:
    """One-download auditor handoff: PDF variants + CBOM + JSON + CSV + methodology + signature."""
    from app.remediation.service import apply_remediation_to_migration_report, merge_remediation_into_report

    if remediation_statuses:
        report = apply_remediation_to_migration_report(report, statuses=remediation_statuses)

    buffer = io.BytesIO()
    json_payload = report_to_json(report)
    if remediation_statuses:
        json_payload = merge_remediation_into_report(json_payload, statuses=remediation_statuses)

    opts = dict(pdf_options or {})
    brand = branding if isinstance(branding, dict) else opts.pop("branding", None)
    opts.pop("branding", None)

    log_inclusion: dict[str, Any] | None = None
    content_hash = (report.signature or {}).get("contentHash")
    if content_hash:
        try:
            from app.pqc.transparency import log_inclusion_block

            log_inclusion = log_inclusion_block(str(content_hash))
        except Exception:
            log_inclusion = None

    from app.pqc.report_pdf import build_auditor_pdf, build_board_pdf, build_executive_pdf

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("report.pdf", report_to_pdf(report, branding=brand, pdf_options=opts))
        archive.writestr("board.pdf", build_board_pdf(report, branding=brand, **opts))
        archive.writestr("executive.pdf", build_executive_pdf(report, branding=brand, **opts))
        archive.writestr("auditor-annex.pdf", build_auditor_pdf(report, branding=brand, **opts))
        archive.writestr("report.json", json.dumps(json_payload, indent=2))
        if report.compliance_pack:
            archive.writestr(
                "compliance-pack.json",
                json.dumps(report.compliance_pack, indent=2),
            )
        if remediation_statuses:
            archive.writestr(
                "remediation-status.json",
                json.dumps(remediation_statuses, indent=2),
            )
            verified = [
                row for row in remediation_statuses if row.get("verifyScanId")
            ]
            if verified:
                archive.writestr(
                    "verified-remediations.json",
                    json.dumps(verified, indent=2),
                )
        archive.writestr("remediation.csv", report_to_csv(report))
        archive.writestr("cbom.json", json.dumps(report_to_cbom(report), indent=2))
        archive.writestr(
            "methodology.md",
            _methodology_markdown(),
        )
        archive.writestr(
            "scoring-methodology.md",
            _scoring_methodology_markdown(report),
        )
        archive.writestr(
            "glossary.json",
            json.dumps(glossary_for_report(), indent=2),
        )
        archive.writestr(
            "references.json",
            json.dumps(references_for_report(), indent=2),
        )
        if report.signature:
            archive.writestr("signature.json", json.dumps(report.signature, indent=2))
        if log_inclusion and log_inclusion.get("included"):
            archive.writestr("log-inclusion.json", json.dumps(log_inclusion, indent=2))
        archive.writestr(
            "discovery-provenance.json",
            json.dumps(_discovery_provenance_manifest(), indent=2),
        )
    return buffer.getvalue()


def _discovery_provenance_manifest() -> dict[str, Any]:
    from pathlib import Path

    versions: dict[str, str] = {}
    lock = Path(__file__).resolve().parents[2] / "scanner-versions.lock"
    if lock.exists():
        try:
            versions = json.loads(lock.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {
        "sensorAttestation": "Qtangl Unified Sensor v0.1.0",
        "scannerEngines": versions,
        "sourceMethods": [
            "qtangl:agentless-scan",
            "qtangl:host-sensor",
            "qtangl:code-scan",
            "qtangl:binary-scan",
        ],
    }


def _methodology_markdown() -> str:
    return """# Qtangl Q-Day Readiness Methodology

## Discovery scope
Endpoint-scoped inventory of TLS certificates, JWKS signing keys, SSH host keys,
email transport, and uploaded certificate bundles.

## Classification
Assets are classified against Shor/Grover exposure estimates per NIST IR 8547.

## Mosca inequality
X (data shelf-life) + Y (migration time) > Z (years to Q-Day) indicates HNDL risk.

## Readiness score
Composite 0–100 score from quantum-vulnerable share, HNDL exposure, PQC-ready count,
and remediation coverage.

## Limitations
This scan is an inventory aid, not a formal audit. Shadow keys, HSMs, and offline
material may be missed.
"""


def _scoring_methodology_markdown(report: MigrationReport) -> str:
    from app.pqc.risk import crypto_agility_breakdown, readiness_formula_breakdown

    formula = readiness_formula_breakdown(report.assets)
    agility = crypto_agility_breakdown(report.assets)
    return f"""# Scoring methodology (scan {report.scan_id})

Readiness = inventory_baseline + safe% − at_risk% − broken% + hybrid_credit

This scan:
- Inventory baseline: {formula.get('inventoryBaseline', 0)}
- Hybrid credit: {formula.get('hybridCredit', 0)}
- Classified assets: {formula.get('classifiedCount', 0)}
- Score: {report.readiness_score}/100 ({report.readiness_band})

Crypto agility: {agility.get('score', report.crypto_agility_score or 0)} — {agility.get('interpretation', '')}

Shor qubit estimates are order-of-magnitude only, not Q-Day predictions.
"""
