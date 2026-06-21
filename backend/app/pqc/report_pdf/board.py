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

from app.pqc.report_pdf.charts import mosca_timeline, readiness_gauge
from app.pqc.report_pdf.common import (
    company_name,
    exposure_range_text,
    nearest_deadline,
    page_header_footer,
    qr_drawing,
    verify_url,
)
from app.pqc.report_pdf.sections import watermark_banner
from app.pqc.report_pdf.styles import pdf_styles
from app.pqc.risk import mosca_assessment_for_report


def build_board_pdf(
    report: MigrationReport,
    *,
    branding: dict[str, Any] | None = None,
    watermark: bool = False,
    coherence_issues: list[str] | None = None,
    **_: Any,
) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required for PDF generation")

    company = company_name(branding)
    styles = pdf_styles(branding)
    body = styles["body"]
    muted = styles["muted"]
    title = styles["title"]
    issues = coherence_issues or []

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title=f"{company or 'Qtangl'} Board Brief",
    )

    exec_sum = report.executive_summary or {}
    story: list[Any] = [
        Spacer(1, 0.4 * inch),
        Paragraph("Q-Day Readiness — Board Brief", title),
        Paragraph(f"<b>{report.target_domain}</b> · {report.generated_at[:10] if report.generated_at else ''}", body),
        Paragraph(f"<b>Band:</b> {report.readiness_band or '—'} · <b>Score:</b> {report.readiness_score}/100", body),
    ]
    story.extend(watermark_banner(issues if watermark else [], body))
    story.append(readiness_gauge(report.readiness_score))
    story.append(Spacer(1, 0.15 * inch))
    exp = exposure_range_text(report)
    if exp:
        story.append(Paragraph(f"<b>Migration exposure:</b> {exp}", body))
    story.append(Paragraph(f"<b>Nearest deadline:</b> {nearest_deadline(report)}", muted))
    delta = exec_sum.get("findingsDelta") or {}
    if delta.get("summary"):
        story.append(Paragraph(str(delta["summary"]), muted))
    peer = exec_sum.get("peerComparison")
    if isinstance(peer, dict) and peer.get("available"):
        story.append(
            Paragraph(
                f"Peer: {peer.get('band')} vs {peer.get('industry')} (median {peer.get('median')}).",
                muted,
            )
        )
    story.append(qr_drawing(verify_url(report)))
    story.append(PageBreak())

    story.append(Paragraph("<b>90-day decisions</b>", styles["h2"]))
    backlog = report.remediation_backlog[:3]
    if backlog:
        for item in backlog:
            meta = getattr(item, "metadata", None) or {}
            story.append(
                Paragraph(
                    f"<b>#{item.priority} {item.title}</b> — deadline {item.deadline}, "
                    f"effort {item.effort_days}d, owner {meta.get('owner') or 'TBD'}",
                    body,
                )
            )
    else:
        for item in (exec_sum.get("topPriorities") or [])[:3]:
            story.append(
                Paragraph(
                    f"<b>{item.get('title', '')}</b> — {(item.get('action') or '')[:160]}",
                    body,
                )
            )

    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("<b>Mosca HNDL</b>", styles["h2"]))
    story.append(Paragraph(mosca_assessment_for_report(report.mosca)["summary"], muted))
    story.append(mosca_timeline(report))

    sig = report.signature or {}
    if sig.get("contentHash"):
        story.append(Spacer(1, 0.12 * inch))
        story.append(
            Paragraph(
                f"Verify: {verify_url(report)} · hash {str(sig.get('contentHash', ''))[:16]}…",
                muted,
            )
        )

    doc.build(
        story,
        onFirstPage=lambda c, d: page_header_footer(
            c,
            d,
            scan_id=report.scan_id,
            company=company,
            header_suffix="Board Brief",
            footer_note=verify_url(report),
            minimal=True,
        ),
        onLaterPages=lambda c, d: page_header_footer(
            c,
            d,
            scan_id=report.scan_id,
            company=company,
            header_suffix="Board Brief",
            footer_note=verify_url(report),
            minimal=True,
        ),
    )
    return buffer.getvalue()
