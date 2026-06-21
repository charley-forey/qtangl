from __future__ import annotations

from typing import Any

try:
    from reportlab.lib import colors
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False
    colors = None  # type: ignore

NAVY = colors.HexColor("#0B1220") if _HAS_REPORTLAB else None
CHARCOAL = colors.HexColor("#1A2332") if _HAS_REPORTLAB else None
ACCENT = colors.HexColor("#38BDF8") if _HAS_REPORTLAB else None
MUTED = colors.HexColor("#64748B") if _HAS_REPORTLAB else None
WHITE = colors.white if _HAS_REPORTLAB else None
SKY = colors.HexColor("#0EA5E9") if _HAS_REPORTLAB else None
AMBER = colors.HexColor("#F59E0B") if _HAS_REPORTLAB else None
RED = colors.HexColor("#EF4444") if _HAS_REPORTLAB else None

SEVERITY = {
    "critical": colors.HexColor("#DC2626"),
    "high": colors.HexColor("#EA580C"),
    "medium": colors.HexColor("#CA8A04"),
    "low": colors.HexColor("#16A34A"),
    "info": colors.HexColor("#64748B"),
} if _HAS_REPORTLAB else {}


def accent_color(branding: dict[str, Any] | None) -> Any:
    raw = str((branding or {}).get("primaryColor") or "").strip()
    if raw.startswith("#") and _HAS_REPORTLAB:
        try:
            return colors.HexColor(raw)
        except Exception:
            pass
    return ACCENT


def pdf_styles(branding: dict[str, Any] | None = None) -> dict[str, ParagraphStyle]:
    styles = getSampleStyleSheet()
    accent = accent_color(branding)
    return {
        "title": ParagraphStyle(
            "QtTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=NAVY,
            spaceAfter=12,
        ),
        "h2": ParagraphStyle(
            "QtH2",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            textColor=CHARCOAL,
            spaceBefore=14,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "QtBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=CHARCOAL,
        ),
        "muted": ParagraphStyle(
            "QtMuted",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=MUTED,
        ),
        "mono": ParagraphStyle(
            "QtMono",
            parent=styles["BodyText"],
            fontName="Courier",
            fontSize=8,
            leading=10,
            textColor=CHARCOAL,
        ),
        "accent": ParagraphStyle(
            "QtAccent",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=accent,
        ),
    }
