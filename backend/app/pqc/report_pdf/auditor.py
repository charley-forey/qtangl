from __future__ import annotations

import io
from typing import Any

from app.pqc.models import MigrationReport

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

from app.pqc.report_pdf.common import company_name, page_header_footer, verify_url
from app.pqc.report_pdf.sections import (
    compliance_section,
    discovery_provenance_section,
    findings_delta_section,
    glossary_and_references,
    provenance_section,
    runtime_diff_section,
    scope_authorization_section,
    scoring_methodology_section,
)
from app.pqc.report_pdf.styles import pdf_styles


def build_auditor_pdf(
    report: MigrationReport,
    *,
    branding: dict[str, Any] | None = None,
    **_: Any,
) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required for PDF generation")

    company = company_name(branding)
    styles = pdf_styles(branding)
    body = styles["body"]
    muted = styles["muted"]
    h2 = styles["h2"]

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title=f"{company or 'Qtangl'} Auditor Annex",
    )

    story: list[Any] = [
        Paragraph("Auditor evidence annex", styles["title"]),
        Paragraph(f"Scan {report.scan_id} · {report.target_domain}", body),
        Spacer(1, 0.15 * inch),
    ]
    story.extend(scope_authorization_section(report, styles))
    story.extend(findings_delta_section(report, styles))
    story.extend(discovery_provenance_section(report, styles))
    story.extend(runtime_diff_section(report, styles))
    story.extend(compliance_section(report, styles))
    pack = report.compliance_pack or {}
    for theme in pack.get("controlThemes", [])[:12]:
        story.append(
            Paragraph(
                f"{theme.get('framework', '')} ({theme.get('controlRef', '')}): {theme.get('theme', '')}",
                muted,
            )
        )
    story.append(PageBreak())
    story.extend(provenance_section(report, styles))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph("Methodology and honesty notes", h2))
    for note in report.honesty_notes:
        story.append(Paragraph(f"• {note}", muted))
    story.append(
        Paragraph(
            "Offline verify: pip install qtangl-verify · "
            "qtangl-verify report.json --api-base https://api.qtangl.com",
            muted,
        )
    )
    story.append(PageBreak())
    story.extend(scoring_methodology_section(report, styles))
    story.append(PageBreak())
    story.extend(glossary_and_references(styles))

    doc.build(
        story,
        onFirstPage=lambda c, d: page_header_footer(
            c, d, scan_id=report.scan_id, company=company, header_suffix="Auditor Annex"
        ),
        onLaterPages=lambda c, d: page_header_footer(
            c, d, scan_id=report.scan_id, company=company, header_suffix="Auditor Annex"
        ),
    )
    return buffer.getvalue()
