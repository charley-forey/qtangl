"""QROS board deck PDF generation from slide payloads."""

from __future__ import annotations

import io
from typing import Any

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

from app.pqc.report_pdf.styles import pdf_styles


def build_qros_board_pdf(*, title: str, slides: list[dict[str, str]]) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required for PDF generation")
    styles = pdf_styles(None)
    body = styles["body"]
    heading = styles["title"]
    muted = styles["muted"]

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title=title,
    )
    story: list[Any] = []
    story.append(Paragraph(title, heading))
    story.append(Spacer(1, 0.2 * inch))
    story.append(
        Paragraph(
            "Inventory aid — not a formal audit. Verification confirms report integrity, not estate coverage.",
            muted,
        )
    )
    story.append(Spacer(1, 0.3 * inch))
    for idx, slide in enumerate(slides):
        if idx > 0:
            story.append(PageBreak())
        story.append(Paragraph(slide.get("title", "Slide"), heading))
        story.append(Spacer(1, 0.15 * inch))
        text = (slide.get("body") or "").replace("\n", "<br/>")
        story.append(Paragraph(text, body))
    doc.build(story)
    return buffer.getvalue()
