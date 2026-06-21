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

from app.pqc.report_pdf.board import build_board_pdf
from app.pqc.report_pdf.charts import algorithm_breakdown, severity_chart
from app.pqc.report_pdf.common import company_name, page_header_footer, verify_url
from app.pqc.report_pdf.sections import (
    findings_delta_section,
    migration_roadmap_section,
    remediation_table,
    scoreboard_comparison,
)
from app.pqc.report_pdf.styles import pdf_styles


def build_executive_pdf(
    report: MigrationReport,
    *,
    branding: dict[str, Any] | None = None,
    **kwargs: Any,
) -> bytes:
    """Four-page executive summary: board content plus scoreboard, charts, backlog preview."""
    board_bytes = build_board_pdf(report, branding=branding, **kwargs)
    if not _HAS_REPORTLAB:
        return board_bytes

    company = company_name(branding)
    styles = pdf_styles(branding)
    body = styles["body"]
    h2 = styles["h2"]

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title=f"{company or 'Qtangl'} Executive Summary",
    )

    story: list[Any] = [
        Paragraph("Executive summary (extended)", styles["title"]),
        Paragraph(f"{report.target_domain} · score {report.readiness_score}/100", body),
        Spacer(1, 0.12 * inch),
    ]
    if report.scoreboard_summary:
        story.append(Paragraph("Manual vs Qtangl scoreboard", h2))
        story.extend(scoreboard_comparison(report, body))
    story.extend(findings_delta_section(report, styles))
    story.append(PageBreak())
    story.append(Paragraph("Risk dashboard", h2))
    story.append(severity_chart(report, body))
    algo = algorithm_breakdown(report)
    if algo:
        story.append(algo)
    story.append(PageBreak())
    story.append(Paragraph("Remediation preview", h2))
    story.extend(remediation_table(report, body))
    story.extend(migration_roadmap_section(report, styles))

    doc.build(
        story,
        onFirstPage=lambda c, d: page_header_footer(
            c, d, scan_id=report.scan_id, company=company, header_suffix="Executive Summary"
        ),
        onLaterPages=lambda c, d: page_header_footer(
            c, d, scan_id=report.scan_id, company=company, header_suffix="Executive Summary"
        ),
    )
    return buffer.getvalue()
