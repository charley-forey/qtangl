from __future__ import annotations

import io
from datetime import datetime
from typing import Any

from app.pqc.handshake import handshake_appendix_for_report
from app.pqc.models import MigrationReport
from app.pqc.risk import mosca_assessment_for_report

try:
    from reportlab.graphics.charts.barcharts import VerticalBarChart
    from reportlab.graphics.charts.piecharts import Pie
    from reportlab.graphics.shapes import Drawing, String
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_LEFT
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        PageBreak,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

NAVY = colors.HexColor("#0B1220")
CHARCOAL = colors.HexColor("#1A2332")
ACCENT = colors.HexColor("#38BDF8")
MUTED = colors.HexColor("#64748B")
WHITE = colors.white
SEVERITY = {
    "critical": colors.HexColor("#DC2626"),
    "high": colors.HexColor("#EA580C"),
    "medium": colors.HexColor("#CA8A04"),
    "low": colors.HexColor("#16A34A"),
    "info": colors.HexColor("#64748B"),
}


def build_pdf(report: MigrationReport) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required for PDF generation")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title="Qtangl Q-Day Readiness Report",
        author="Qtangl",
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "QtTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=NAVY,
        spaceAfter=12,
    )
    h2 = ParagraphStyle(
        "QtH2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=CHARCOAL,
        spaceBefore=14,
        spaceAfter=8,
    )
    body = ParagraphStyle(
        "QtBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=CHARCOAL,
    )
    muted = ParagraphStyle(
        "QtMuted",
        parent=body,
        textColor=MUTED,
        fontSize=9,
    )
    mono = ParagraphStyle(
        "QtMono",
        parent=body,
        fontName="Courier",
        fontSize=8,
        leading=10,
    )

    story: list[Any] = []
    generated = report.generated_at[:10] if report.generated_at else datetime.utcnow().date().isoformat()

    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph("Qtangl Q-Day Readiness Report", title_style))
    story.append(Paragraph(f"<b>Target:</b> {report.target_domain}", body))
    story.append(Paragraph(f"<b>Scenario:</b> {report.scenario_id}", body))
    story.append(Paragraph(f"<b>Generated:</b> {generated}", body))
    story.append(Spacer(1, 0.25 * inch))

    score_table = Table(
        [
            ["Readiness score", f"{report.readiness_score}/100"],
            ["Readiness band", report.readiness_band or "—"],
            ["Coverage confidence", f"{report.coverage_confidence}%"],
            ["Assets classified", str(len(report.assets))],
            ["Remediation items", str(len(report.remediation_backlog))],
        ],
        colWidths=[2.2 * inch, 3.8 * inch],
    )
    score_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#E2E8F0")),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(score_table)
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(report.readiness_summary or "", body))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(_executive_summary(report), body))
    story.append(PageBreak())

    story.append(Paragraph("Executive scoreboard", h2))
    story.append(_severity_chart(report))
    story.append(Spacer(1, 0.15 * inch))

    mosca = mosca_assessment_for_report(report.mosca)
    story.append(Paragraph("Mosca inequality (HNDL)", h2))
    story.append(_mosca_chart(report))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(mosca["summary"], body))
    story.append(Paragraph(mosca["interpretation"], muted))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("Cryptographic inventory", h2))
    story.extend(_inventory_table(report, body))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("Prioritized remediation backlog", h2))
    story.extend(_remediation_table(report, body))
    story.append(PageBreak())

    pack = report.compliance_pack
    story.append(Paragraph("Compliance framework mapping", h2))
    if pack.get("title"):
        story.append(Paragraph(str(pack["title"]), body))
    if pack.get("mandate"):
        story.append(Paragraph(f"Mandate: {pack['mandate']}", muted))
    for framework in pack.get("primaryFrameworks", [])[:6]:
        story.append(
            Paragraph(
                f"<b>{framework.get('name', '')}</b>: {framework.get('relevance', '')}",
                body,
            )
        )
    for theme in pack.get("controlThemes", [])[:6]:
        story.append(
            Paragraph(
                f"{theme.get('framework', '')} ({theme.get('controlRef', '')}): {theme.get('theme', '')}",
                muted,
            )
        )
    story.append(Spacer(1, 0.15 * inch))

    if report.scan_coverage:
        story.append(Paragraph("Scan coverage (unreachable / errored endpoints)", h2))
        story.extend(_coverage_table(report))
        story.append(Spacer(1, 0.15 * inch))

    if report.handshake_proof is not None:
        appendix = handshake_appendix_for_report(report.handshake_proof)
        story.append(Paragraph(str(appendix.get("title", "Post-quantum handshake appendix")), h2))
        story.append(
            Paragraph(
                f"Mode: {appendix.get('mode', '')} | Server: {appendix.get('server', '')}:"
                f"{appendix.get('port', '')} | TLS: {appendix.get('tlsVersion', '')}",
                body,
            )
        )
        story.append(
            Paragraph(
                f"Hybrid group: {appendix.get('hybridGroup', '')} | KEM: {appendix.get('kemAlgorithm', '')}",
                body,
            )
        )
        story.append(Paragraph(str(appendix.get("summary", "")), muted))
        excerpt = str(appendix.get("clientHelloExcerpt", ""))
        if excerpt:
            story.append(Paragraph(f"ClientHello excerpt: {excerpt[:120]}…", mono))

    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("Methodology and honesty notes", h2))
    for note in report.honesty_notes:
        story.append(Paragraph(f"• {note}", muted))

    doc.build(story, onFirstPage=_page_header_footer, onLaterPages=_page_header_footer)
    return buffer.getvalue()


def _executive_summary(report: MigrationReport) -> str:
    vuln = sum(
        1
        for asset in report.assets
        if asset.vulnerability.status in {"at-risk", "broken"} and not asset.pqc_ready
    )
    pqc_ready = sum(1 for asset in report.assets if asset.pqc_ready)
    return (
        f"This endpoint-scoped Q-Day readiness assessment identified <b>{len(report.assets)}</b> "
        f"classified cryptographic assets against <b>{report.target_domain}</b>. "
        f"<b>{vuln}</b> require migration under current NIST timelines; "
        f"<b>{pqc_ready}</b> already negotiate hybrid/PQC. "
        f"Mosca HNDL assessment: {report.mosca.summary}"
    )


def _severity_chart(report: MigrationReport) -> Drawing:
    counts: dict[str, int] = {}
    for asset in report.assets:
        key = asset.vulnerability.severity
        counts[key] = counts.get(key, 0) + 1
    if not counts:
        counts = {"info": 1}

    drawing = Drawing(400, 160)
    pie = Pie()
    pie.x = 60
    pie.y = 15
    pie.width = 120
    pie.height = 120
    pie.data = list(counts.values())
    pie.labels = [f"{label} ({count})" for label, count in counts.items()]
    pie.slices.strokeWidth = 0.5
    for index, label in enumerate(counts.keys()):
        pie.slices[index].fillColor = SEVERITY.get(label, MUTED)
    drawing.add(pie)
    drawing.add(String(220, 120, "Severity mix", fontName="Helvetica-Bold", fontSize=11))
    return drawing


def _mosca_chart(report: MigrationReport) -> Drawing:
    mosca = report.mosca
    drawing = Drawing(400, 150)
    chart = VerticalBarChart()
    chart.x = 50
    chart.y = 25
    chart.width = 280
    chart.height = 100
    chart.data = [[mosca.data_shelf_life_years, mosca.migration_time_years, mosca.years_to_q_day]]
    chart.categoryAxis.categoryNames = ["X data shelf", "Y migration", "Z to Q-Day"]
    chart.valueAxis.valueMin = 0
    chart.bars[0].fillColor = ACCENT
    drawing.add(chart)
    drawing.add(String(50, 130, "Mosca timeline (years)", fontName="Helvetica-Bold", fontSize=11))
    return drawing


def _inventory_table(report: MigrationReport, body: ParagraphStyle) -> list[Any]:
    if not report.assets:
        return [Paragraph("No classified assets in this scan.", body)]

    rows: list[list[Any]] = [
        ["Asset", "Algorithm", "Status", "Severity", "PQC ready", "HNDL verdict"],
    ]
    for asset in report.assets[:20]:
        rows.append(
            [
                Paragraph(asset.label[:60], body),
                Paragraph(asset.algorithm[:40], body),
                asset.vulnerability.status,
                asset.vulnerability.severity,
                "Yes" if asset.pqc_ready else "No",
                Paragraph((asset.hndl_verdict or "—")[:120], body),
            ]
        )
    table = Table(rows, colWidths=[1.4 * inch, 1.0 * inch, 0.7 * inch, 0.65 * inch, 0.6 * inch, 2.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#F8FAFC")]),
            ]
        )
    )
    return [table]


def _remediation_table(report: MigrationReport, body: ParagraphStyle) -> list[Any]:
    if not report.remediation_backlog:
        return [Paragraph("No remediation items required.", body)]

    rows: list[list[Any]] = [["#", "Title", "Action", "Deadline", "Effort"]]
    for item in report.remediation_backlog[:15]:
        rows.append(
            [
                str(item.priority),
                Paragraph(item.title[:70], body),
                Paragraph(item.action[:120], body),
                item.deadline,
                f"{item.effort_days}d",
            ]
        )
    table = Table(rows, colWidths=[0.35 * inch, 1.5 * inch, 3.0 * inch, 0.9 * inch, 0.5 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), CHARCOAL),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return [table]


def _coverage_table(report: MigrationReport) -> list[Any]:
    rows = [["Host", "Port", "Kind", "Status", "Detail"]]
    for entry in report.scan_coverage[:20]:
        rows.append(
            [
                entry.get("host", ""),
                str(entry.get("port", "")),
                entry.get("kind", ""),
                entry.get("status", ""),
                (entry.get("detail", "") or "")[:100],
            ]
        )
    table = Table(rows, colWidths=[1.6 * inch, 0.5 * inch, 0.6 * inch, 0.8 * inch, 3.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#475569")),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    return [table]


def _page_header_footer(canvas: Any, doc: Any) -> None:
    canvas.saveState()
    width, height = letter
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 0.45 * inch, width, 0.45 * inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(0.75 * inch, height - 0.3 * inch, "Qtangl — Q-Day Readiness Report")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(width - 0.75 * inch, height - 0.3 * inch, "Confidential — endpoint-scoped inventory")
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(width / 2, 0.45 * inch, f"Page {doc.page}")
    canvas.restoreState()
