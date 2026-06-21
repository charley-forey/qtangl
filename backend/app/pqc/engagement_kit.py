from __future__ import annotations

import io
from typing import Any

from app.pqc.models import MigrationReport

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

from app.pqc.report_pdf.common import company_name, page_header_footer
from app.pqc.report_pdf.styles import NAVY, WHITE, pdf_styles


def build_workshop_worksheet_pdf(report: MigrationReport, *, branding: dict[str, Any] | None = None) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required")
    styles = pdf_styles(branding)
    body = styles["body"]
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=0.75 * inch, rightMargin=0.75 * inch)
    rows = [["#", "Title", "Owner", "Target date", "Notes"]]
    for item in report.remediation_backlog[:20]:
        rows.append([str(item.priority), item.title[:40], "", "", ""])
    table = Table(rows, colWidths=[0.3 * inch, 2.2 * inch, 1.0 * inch, 1.0 * inch, 1.5 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("GRID", (0, 0), (-1, -1), 0.25, NAVY),
            ]
        )
    )
    story = [
        Paragraph("Remediation workshop worksheet", styles["title"]),
        Paragraph(f"{report.target_domain} · {report.scan_id}", body),
        Spacer(1, 0.15 * inch),
        table,
    ]
    company = company_name(branding)
    doc.build(
        story,
        onFirstPage=lambda c, d: page_header_footer(c, d, scan_id=report.scan_id, company=company),
        onLaterPages=lambda c, d: page_header_footer(c, d, scan_id=report.scan_id, company=company),
    )
    return buffer.getvalue()


def build_engagement_kit_zip(report: MigrationReport, *, branding: dict[str, Any] | None = None) -> bytes:
    import zipfile

    from app.pqc.report_pdf import build_board_pdf

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("workshop-worksheet.pdf", build_workshop_worksheet_pdf(report, branding=branding))
        archive.writestr("board.pdf", build_board_pdf(report, branding=branding))
        archive.writestr(
            "speaker-notes.md",
            _speaker_notes_markdown(report),
        )
        archive.writestr("attestation-template.md", _attestation_template(report))
        archive.writestr("engagement-timeline.md", _engagement_timeline_markdown())
        archive.writestr("monitor-conversion.md", _monitor_conversion_markdown(report))
    return buffer.getvalue()


def _speaker_notes_markdown(report: MigrationReport) -> str:
    return f"""# Executive readout speaker notes

Scan: {report.scan_id}
Target: {report.target_domain}
Readiness: {report.readiness_score}/100 ({report.readiness_band})

1. Open with readiness score and band.
2. Explain Mosca HNDL timeline and nearest regulatory deadline.
3. Walk top 3 remediation decisions and owners.
4. Close with verify link and Monitor proposal for drift detection.
"""


def _attestation_template(report: MigrationReport) -> str:
    return f"""# Customer attestation (optional)

Qtangl Q-Day Readiness Assessment performed on __________ against {report.target_domain}.
Scan ID: {report.scan_id}
Verify: https://www.qtangl.com/verify?scanId={report.scan_id}

Customer signature: ______________________  Date: __________
"""


def _engagement_timeline_markdown() -> str:
    return """# Assess engagement timeline (4 weeks)

| Week | Activity | Deliverable | Owner |
|------|----------|-------------|-------|
| Week 1 | Baseline scan | Evidence bundle + CBOM | Qtangl + customer |
| Week 2 | Remediation workshop | Workshop worksheet + updated backlog | Customer security |
| Week 3 | Sprint planning | Owner assignment in dashboard | Customer |
| Week 4 | Executive readout | Board PDF + speaker notes | CISO |
"""


def _monitor_conversion_markdown(report: MigrationReport) -> str:
    return f"""# What changes with Monitor

After baseline scan `{report.scan_id}` ({report.target_domain}), Monitor adds:

- Scheduled re-scans and drift detection when crypto posture changes
- Peer benchmark when cohort size allows
- Automated board pack email on your cadence
- Readiness trend charts (populated after the second scan)

**Next step:** Enable Monitor from the dashboard or contact sales for pilot pricing.
Verify baseline: https://www.qtangl.com/verify?scanId={report.scan_id}
"""
