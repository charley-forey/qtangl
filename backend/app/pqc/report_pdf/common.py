from __future__ import annotations

from typing import Any

from app.pqc.models import MigrationReport

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import Spacer

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

from app.pqc.report_pdf.styles import MUTED, NAVY, WHITE


def format_wall_time(seconds: float) -> str:
    if seconds <= 0:
        return "—"
    if seconds < 60:
        return f"{seconds:.1f}s"
    if seconds < 3600:
        return f"{seconds / 60:.1f} min"
    if seconds < 86400:
        return f"{seconds / 3600:.1f} hr"
    if seconds < 86400 * 14:
        return f"{seconds / 86400:.1f} days"
    return f"{seconds / (86400 * 7):.1f} weeks"


def verify_url(report: MigrationReport) -> str:
    return f"https://www.qtangl.com/verify?scanId={report.scan_id}"


def company_name(branding: dict[str, Any] | None) -> str:
    return str((branding or {}).get("companyName") or "").strip()


def page_header_footer(
    canvas: Any,
    doc: Any,
    *,
    scan_id: str = "",
    company: str = "",
    header_suffix: str = "Q-Day Readiness Report",
    footer_note: str = "",
    minimal: bool = False,
) -> None:
    canvas.saveState()
    width, height = letter
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 0.45 * inch, width, 0.45 * inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 9)
    prefix = company or "Qtangl"
    canvas.drawString(0.75 * inch, height - 0.3 * inch, f"{prefix} — {header_suffix}")
    if not minimal:
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(
            width - 0.75 * inch,
            height - 0.3 * inch,
            "Confidential — endpoint-scoped inventory",
        )
    canvas.setFillColor(MUTED)
    footer = f"Page {doc.page}"
    if scan_id:
        footer = f"{scan_id} | Page {doc.page}"
    canvas.drawCentredString(width / 2, 0.45 * inch, footer)
    if footer_note:
        canvas.setFont("Helvetica", 7)
        canvas.drawCentredString(width / 2, 0.28 * inch, footer_note)
    canvas.restoreState()


def qr_drawing(url: str) -> Any:
    try:
        from reportlab.graphics.barcode.qr import QrCodeWidget
        from reportlab.graphics.shapes import Drawing

        widget = QrCodeWidget(url)
        drawing = Drawing(80, 80)
        drawing.add(widget)
        return drawing
    except Exception:
        return Spacer(1, 0.1 * inch)


def exposure_range_text(report: MigrationReport) -> str:
    exec_sum = report.executive_summary or {}
    exposure = exec_sum.get("exposureRangeUsd") or {}
    low = exposure.get("low")
    high = exposure.get("high")
    if low is None or high is None:
        return ""
    return f"${int(low):,}–${int(high):,} (order-of-magnitude migration exposure)"


def nearest_deadline(report: MigrationReport) -> str:
    exec_sum = report.executive_summary or {}
    return str(exec_sum.get("nearestDeadline") or "2030")
