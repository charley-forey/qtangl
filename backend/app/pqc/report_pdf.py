from __future__ import annotations

import io
from datetime import datetime
from typing import Any

from app.pqc.handshake import handshake_appendix_for_report
from app.pqc.models import MigrationReport
from app.pqc.references import glossary_for_report, references_for_report
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
    try:
        from reportlab.graphics.barcode.qr import QrCodeWidget  # noqa: F401

        _HAS_QR = True
    except ImportError:
        _HAS_QR = False
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False
    _HAS_QR = False

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

    # Cover / executive one-pager
    story.extend(_cover_section(report, title_style, body, muted))
    story.append(PageBreak())

    story.extend(_how_to_read_box(body, muted))
    story.append(Spacer(1, 0.2 * inch))

    if report.scan_diff:
        story.extend(_scan_diff_section(report, h2, body, muted))
        story.append(Spacer(1, 0.15 * inch))

    if report.scoreboard_summary:
        story.append(Paragraph("Manual vs Qtangl scoreboard", h2))
        story.extend(_scoreboard_comparison(report, body))
        story.append(Spacer(1, 0.15 * inch))

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
    exec_sum = report.executive_summary or {}
    for priority in exec_sum.get("topPriorities", [])[:3]:
        story.append(
            Paragraph(
                f"<b>Priority:</b> {priority.get('title', '')} — {priority.get('action', '')[:200]}",
                muted,
            )
        )
    story.append(PageBreak())

    story.append(Paragraph("Executive scoreboard", h2))
    story.append(_severity_chart(report))
    story.append(Spacer(1, 0.15 * inch))

    mosca = mosca_assessment_for_report(report.mosca)
    story.append(Paragraph("Mosca inequality (HNDL)", h2))
    story.append(Paragraph(f"<b>{mosca['headline']}</b>", body))
    story.append(Paragraph(f"Formula: {mosca['formula']} → sum X+Y = {mosca['sumXY']} yr", body))
    story.append(
        Paragraph(
            f"X data shelf-life: {mosca['variables']['dataShelfLifeYears']} yr | "
            f"Y migration time: {mosca['variables']['migrationTimeYears']} yr | "
            f"Z to Q-Day: {mosca['variables']['yearsToQDay']} yr",
            muted,
        )
    )
    story.append(Paragraph(f"HNDL risk level: {mosca['hndlRiskLevel']}", body))
    story.append(_mosca_chart(report))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(mosca["summary"], body))
    story.append(Paragraph(mosca["interpretation"], muted))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("Cryptographic inventory", h2))
    for chunk_start in range(0, max(len(report.assets), 1), 25):
        chunk = report.assets[chunk_start : chunk_start + 25]
        if chunk:
            story.extend(_inventory_table_chunk(chunk, body))
            story.append(Spacer(1, 0.1 * inch))

    hndl_assets = [a for a in report.assets if a.vulnerability.hndl_exposed][:5]
    if hndl_assets:
        story.append(Paragraph("Top HNDL-exposed assets (deep dive)", h2))
        story.extend(_asset_deep_dive(hndl_assets, body, muted))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("Prioritized remediation backlog", h2))
    if report.remediation_completion_pct is not None:
        story.append(
            Paragraph(f"Remediation completion: {report.remediation_completion_pct}%", body)
        )
    story.extend(_remediation_table(report, body))
    story.append(PageBreak())

    if report.standards_summary:
        story.append(Paragraph("Standards summary", h2))
        story.extend(_standards_table(report))
        story.append(Spacer(1, 0.15 * inch))

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
    for gap in pack.get("gapFindings", [])[:8]:
        story.append(
            Paragraph(
                f"<b>{gap.get('framework', '')}</b> [{gap.get('status', '')}]: {gap.get('finding', '')}",
                body,
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

    story.append(PageBreak())
    story.append(Paragraph("Glossary", h2))
    for entry in glossary_for_report():
        story.append(Paragraph(f"<b>{entry['term']}</b>: {entry['plain']}", muted))

    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("References", h2))
    for ref in references_for_report()[:20]:
        story.append(
            Paragraph(
                f"[{ref['index']}] {ref['term']} — {ref.get('url', '')}",
                muted,
            )
        )

    if report.signature:
        story.append(Spacer(1, 0.15 * inch))
        story.append(Paragraph("Report integrity &amp; provenance", h2))
        sig = report.signature
        story.append(Paragraph(f"Algorithm: {sig.get('alg', '—')}", body))
        story.append(Paragraph(f"Key fingerprint: {sig.get('keyFingerprint', '—')}", mono))
        story.append(Paragraph(f"Content hash (SHA-256): {sig.get('contentHash', '—')}", mono))
        story.append(Paragraph(f"Signed at: {sig.get('signedAt', '—')}", muted))
        verify_url = f"https://www.qtangl.com/verify?scanId={report.scan_id}"
        story.append(Paragraph(f"Verify: {verify_url}", muted))
        if _HAS_QR:
            story.append(_qr_drawing(verify_url))

    doc.build(
        story,
        onFirstPage=lambda c, d: _page_header_footer(c, d, report.scan_id),
        onLaterPages=lambda c, d: _page_header_footer(c, d, report.scan_id),
    )
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
    return _inventory_table_chunk(report.assets[:20], body)


def _inventory_table_chunk(assets: list[Any], body: ParagraphStyle) -> list[Any]:
    if not assets:
        return [Paragraph("No classified assets in this scan.", body)]

    rows: list[list[Any]] = [
        ["Asset", "Algorithm", "Key", "Status", "Severity", "PQC", "Shor qubits"],
    ]
    for asset in assets:
        rows.append(
            [
                Paragraph(asset.label[:50], body),
                Paragraph(asset.algorithm[:30], body),
                str(asset.key_size or "—"),
                asset.vulnerability.status,
                asset.vulnerability.severity,
                "Yes" if asset.pqc_ready else "No",
                str(asset.vulnerability.shor_logical_qubits or "—"),
            ]
        )
    table = Table(rows, colWidths=[1.2 * inch, 0.9 * inch, 0.45 * inch, 0.55 * inch, 0.55 * inch, 0.4 * inch, 0.7 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
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

    rows: list[list[Any]] = [["#", "Title", "Severity", "PQC alg", "Action", "Deadline"]]
    for item in report.remediation_backlog[:25]:
        rows.append(
            [
                str(item.priority),
                Paragraph(item.title[:60], body),
                item.severity,
                Paragraph(item.pqc_algorithm[:40], body),
                Paragraph(item.action[:100], body),
                item.deadline,
            ]
        )
    table = Table(rows, colWidths=[0.3 * inch, 1.2 * inch, 0.55 * inch, 0.8 * inch, 2.5 * inch, 0.7 * inch])
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


def _page_header_footer(canvas: Any, doc: Any, scan_id: str = "") -> None:
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
    footer = f"Page {doc.page}"
    if scan_id:
        footer = f"{scan_id} | Page {doc.page}"
    canvas.drawCentredString(width / 2, 0.45 * inch, footer)
    canvas.restoreState()


def _cover_section(
    report: MigrationReport,
    title_style: ParagraphStyle,
    body: ParagraphStyle,
    muted: ParagraphStyle,
) -> list[Any]:
    generated = report.generated_at[:10] if report.generated_at else ""
    band = report.readiness_band or "—"
    items: list[Any] = [
        Spacer(1, 0.75 * inch),
        Paragraph("Qtangl Q-Day Readiness Report", title_style),
        Paragraph(f"<b>Scan ID:</b> {report.scan_id}", body),
        Paragraph(f"<b>Target:</b> {report.target_domain}", body),
        Paragraph(f"<b>Readiness band:</b> {band}", body),
        Paragraph(f"<b>Generated:</b> {generated}", body),
        Spacer(1, 0.2 * inch),
        Paragraph(f"<b>Mosca verdict:</b> {report.mosca.summary}", muted),
    ]
    if report.readiness_summary:
        items.append(Paragraph(report.readiness_summary, body))
    return items


def _how_to_read_box(body: ParagraphStyle, muted: ParagraphStyle) -> list[Any]:
    return [
        Paragraph("<b>How to read this report</b>", body),
        Paragraph(
            "• <b>Readiness score</b> (0–100): composite quantum-migration preparedness. "
            "• <b>Coverage confidence</b>: scan completeness heuristic. "
            "• <b>Mosca X+Y&gt;Z</b>: harvest-now-decrypt-later timeline test. "
            "• <b>Severity</b> vs <b>status</b> vs <b>PQC ready</b>: see glossary.",
            muted,
        ),
    ]


def _scoreboard_comparison(report: MigrationReport, body: ParagraphStyle) -> list[Any]:
    sb = report.scoreboard_summary
    manual = sb.get("manual", sb.get("qtangl", {}))
    qtangl = sb.get("qtangl", manual)
    rows = [
        ["Metric", "Manual baseline", "Qtangl scan"],
        ["Wall time", f"{manual.get('scan_wall_time_seconds', 0):.0f}s", f"{qtangl.get('scan_wall_time_seconds', 0):.1f}s"],
        ["Assets", str(manual.get("assets_discovered", 0)), str(qtangl.get("assets_discovered", 0))],
        ["Quantum vulnerable", str(manual.get("quantum_vulnerable", 0)), str(qtangl.get("quantum_vulnerable", 0))],
        ["HNDL exposed", str(manual.get("hndl_exposed", 0)), str(qtangl.get("hndl_exposed", 0))],
        ["Readiness", str(manual.get("readiness_score", 0)), str(qtangl.get("readiness_score", 0))],
    ]
    table = Table(rows, colWidths=[1.8 * inch, 2.0 * inch, 2.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    return [table]


def _asset_deep_dive(assets: list[Any], body: ParagraphStyle, muted: ParagraphStyle) -> list[Any]:
    blocks: list[Any] = []
    for asset in assets:
        blocks.append(Paragraph(f"<b>{asset.label}</b> ({asset.host}:{asset.port or 443})", body))
        blocks.append(
            Paragraph(
                f"TLS {asset.tls_version or '—'} | Cipher: {asset.negotiated_cipher or '—'} | "
                f"Group: {asset.negotiated_group or '—'} | Validity: {asset.validity_days or '—'}d",
                muted,
            )
        )
        if asset.san_domains:
            blocks.append(Paragraph(f"SANs: {', '.join(asset.san_domains[:5])}", muted))
        blocks.append(Spacer(1, 0.08 * inch))
    return blocks


def _standards_table(report: MigrationReport) -> list[Any]:
    rows = [["ID", "Framework", "Assets", "Deadline", "URL"]]
    for entry in report.standards_summary:
        rows.append(
            [
                entry.get("id", ""),
                entry.get("name", "")[:40],
                str(entry.get("assetCount", 0)),
                str(entry.get("deadline", "—"))[:12],
                (entry.get("url", "") or "")[:50],
            ]
        )
    table = Table(rows, colWidths=[0.9 * inch, 1.5 * inch, 0.5 * inch, 0.8 * inch, 2.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), CHARCOAL),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    return [table]


def _scan_diff_section(report: MigrationReport, h2: Any, body: Any, muted: Any) -> list[Any]:
    diff = report.scan_diff or {}
    blocks = [Paragraph("Changes since last scan", h2)]
    prev_id = report.previous_scan_id or diff.get("previousScanId", "")
    blocks.append(Paragraph(f"Compared to scan: {prev_id}", muted))
    blocks.append(Paragraph(str(diff.get("summary", "")), body))
    delta = diff.get("readinessDelta")
    if delta is not None:
        color = "green" if float(delta) >= 0 else "red"
        blocks.append(
            Paragraph(
                f'Readiness delta: <font color="{color}">{delta:+.1f}</font> '
                f'({diff.get("previousReadinessScore")} → {diff.get("currentReadinessScore")})',
                body,
            )
        )
    for label, key in (
        ("New quantum-vulnerable", "newQuantumVulnerable"),
        ("New assets", "newAssets"),
        ("Removed assets", "removedAssets"),
        ("Degraded", "degradedAlgorithms"),
    ):
        items = diff.get(key) or []
        if items:
            blocks.append(Paragraph(f"<b>{label}</b> ({len(items)})", body))
            for item in items[:8]:
                blocks.append(
                    Paragraph(
                        f"• {item.get('label', item.get('assetId', ''))} — {item.get('status', item.get('currentStatus', ''))}",
                        muted,
                    )
                )
    return blocks


def _qr_drawing(url: str) -> Any:
    try:
        from reportlab.graphics.barcode.qr import QrCodeWidget
        from reportlab.graphics.shapes import Drawing

        widget = QrCodeWidget(url)
        bounds = widget.getBounds()
        size = 80
        drawing = Drawing(size, size)
        drawing.add(widget)
        return drawing
    except Exception:
        return Spacer(1, 0.1 * inch)
