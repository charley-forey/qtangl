from __future__ import annotations

import io
from datetime import datetime
from typing import Any

from app.pqc.models import MigrationReport

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

from app.pqc.report_pdf.charts import algorithm_breakdown, mosca_timeline, risk_quadrant, severity_chart
from app.pqc.report_pdf.common import company_name, page_header_footer, qr_drawing, verify_url
from app.pqc.report_pdf.sections import (
    compliance_section,
    cover_section,
    executive_summary_text,
    findings_delta_section,
    glossary_and_references,
    handshake_section,
    hndl_deep_dive,
    inventory_table_chunk,
    migration_roadmap_section,
    provenance_section,
    remediation_table,
    scope_authorization_section,
    score_kpi_table,
    scoreboard_comparison,
    discovery_provenance_section,
    runtime_diff_section,
    cbom_summary_section,
    scoring_methodology_section,
)
from app.pqc.report_pdf.styles import pdf_styles
from app.pqc.risk import mosca_assessment_for_report


def build_pdf(
    report: MigrationReport,
    *,
    branding: dict[str, Any] | None = None,
    watermark: bool = False,
    coherence_issues: list[str] | None = None,
    include_glossary: bool = False,
    **_: Any,
) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required for PDF generation")

    company = company_name(branding)
    styles = pdf_styles(branding)
    body = styles["body"]
    muted = styles["muted"]
    h2 = styles["h2"]
    issues = coherence_issues or []

    buffer = io.BytesIO()
    header_label = f"{company} — Q-Day Readiness" if company else "Qtangl — Q-Day Readiness Report"
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title=header_label,
        author=company or "Qtangl",
    )

    story: list[Any] = []
    story.extend(cover_section(report, styles, coherence_issues=issues if watermark else None))
    story.append(PageBreak())

    story.extend(scope_authorization_section(report, styles))
    story.append(Spacer(1, 0.15 * inch))
    story.extend(findings_delta_section(report, styles))
    story.append(Spacer(1, 0.15 * inch))

    if report.scoreboard_summary:
        story.append(Paragraph("Manual vs Qtangl scoreboard", h2))
        story.extend(scoreboard_comparison(report, body))
        story.append(Spacer(1, 0.12 * inch))

    story.append(score_kpi_table(report))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph(executive_summary_text(report), body))
    exec_sum = report.executive_summary or {}
    for priority in exec_sum.get("topPriorities", [])[:3]:
        story.append(
            Paragraph(
                f"<b>Priority:</b> {priority.get('title', '')} — {(priority.get('action') or '')[:200]}",
                muted,
            )
        )
    story.append(PageBreak())

    story.append(Paragraph("Risk dashboard", h2))
    story.append(severity_chart(report, body))
    story.append(Spacer(1, 0.08 * inch))
    story.append(risk_quadrant(report, body))
    story.append(Spacer(1, 0.1 * inch))
    algo = algorithm_breakdown(report)
    if algo:
        story.append(algo)
        story.append(Spacer(1, 0.1 * inch))

    mosca = mosca_assessment_for_report(report.mosca)
    story.append(Paragraph("Mosca inequality (HNDL)", h2))
    story.append(Paragraph(mosca["summary"], body))
    story.append(mosca_timeline(report))
    story.append(Spacer(1, 0.15 * inch))

    story.append(Paragraph("Cryptographic inventory", h2))
    explanations = report.asset_explanations or {}
    for chunk_start in range(0, max(len(report.assets), 1), 20):
        chunk = report.assets[chunk_start : chunk_start + 20]
        if chunk:
            story.extend(inventory_table_chunk(chunk, body, muted, explanations))
            story.append(Spacer(1, 0.08 * inch))

    story.extend(hndl_deep_dive(report, styles))
    story.append(Spacer(1, 0.12 * inch))

    story.append(Paragraph("Prioritized remediation backlog", h2))
    story.extend(remediation_table(report, body))
    story.extend(migration_roadmap_section(report, styles))
    exec_sum = report.executive_summary or {}
    projection = exec_sum.get("remediationProjection") or []
    if projection:
        story.append(Paragraph("Remediation what-if (estimate only)", h2))
        rows = [["Scenario", "Items", "Projected score", "Delta"]]
        for row in projection:
            rows.append(
                [
                    str(row.get("label", "")),
                    str(row.get("items", "")),
                    str(row.get("projectedScore", "")),
                    f"+{row.get('delta', 0)}",
                ]
            )
        table = Table(rows, colWidths=[2.4 * inch, 0.6 * inch, 1.0 * inch, 0.6 * inch])
        table.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1"))]))
        story.append(table)
    maturity = exec_sum.get("maturityStage") or {}
    if maturity.get("stage") is not None:
        story.append(Spacer(1, 0.08 * inch))
        story.append(
            Paragraph(
                f"Maturity stage {maturity.get('stage')}: {maturity.get('name', '')} — "
                f"next: {maturity.get('nextStageName', 'Monitor')}",
                muted,
            )
        )
    story.append(Spacer(1, 0.12 * inch))

    story.extend(compliance_section(report, styles))
    story.extend(discovery_provenance_section(report, styles))
    story.extend(runtime_diff_section(report, styles))
    story.extend(cbom_summary_section(report, styles))
    story.extend(scoring_methodology_section(report, styles))
    story.extend(handshake_section(report, styles))

    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph("Methodology and honesty notes", h2))
    for note in report.honesty_notes:
        story.append(Paragraph(f"• {note}", muted))

    story.extend(provenance_section(report, styles))
    story.append(qr_drawing(verify_url(report)))

    if include_glossary:
        story.append(PageBreak())
        story.extend(glossary_and_references(styles))

    doc.build(
        story,
        onFirstPage=lambda c, d: page_header_footer(
            c, d, scan_id=report.scan_id, company=company, footer_note=verify_url(report)
        ),
        onLaterPages=lambda c, d: page_header_footer(
            c, d, scan_id=report.scan_id, company=company, footer_note=verify_url(report)
        ),
    )
    return buffer.getvalue()
