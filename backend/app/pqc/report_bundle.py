from __future__ import annotations

import io
import json
import zipfile
from typing import Any

from app.pqc.models import MigrationReport
from app.pqc.references import glossary_for_report, references_for_report
from app.pqc.report import report_to_cbom, report_to_csv, report_to_json, report_to_pdf


def build_evidence_bundle(report: MigrationReport) -> bytes:
    """One-download auditor handoff: PDF + CBOM + JSON + CSV + methodology + signature."""
    buffer = io.BytesIO()
    json_payload = report_to_json(report)
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("report.pdf", report_to_pdf(report))
        archive.writestr("report.json", json.dumps(json_payload, indent=2))
        archive.writestr("remediation.csv", report_to_csv(report))
        archive.writestr("cbom.json", json.dumps(report_to_cbom(report), indent=2))
        archive.writestr(
            "methodology.md",
            _methodology_markdown(),
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
    return buffer.getvalue()


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
