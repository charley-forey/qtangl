from __future__ import annotations

from typing import Any

from app.pqc.models import MigrationReport
from app.pqc.risk import mosca_assessment_for_report

try:
    from reportlab.graphics.charts.piecharts import Pie
    from reportlab.graphics.shapes import Drawing, Rect, String
    from reportlab.platypus import Paragraph

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

from app.pqc.report_pdf.styles import ACCENT, AMBER, MUTED, RED, SEVERITY, SKY


def readiness_gauge(score: float, *, size: int = 100) -> Drawing:
    drawing = Drawing(size + 40, size + 30)
    clamped = max(0.0, min(100.0, score))
    drawing.add(String(10, size + 10, "Readiness", fontName="Helvetica-Bold", fontSize=10))
    drawing.add(String(10, size - 20, f"{clamped:.0f}/100", fontName="Helvetica-Bold", fontSize=18))
    bar_width = size
    filled = bar_width * (clamped / 100.0)
    drawing.add(Rect(10, 5, bar_width, 12, fillColor=MUTED, strokeColor=MUTED))
    drawing.add(Rect(10, 5, filled, 12, fillColor=ACCENT, strokeColor=ACCENT))
    return drawing


def severity_chart(report: MigrationReport, body: Any) -> Any:
    counts: dict[str, int] = {}
    for asset in report.assets:
        key = asset.vulnerability.severity
        counts[key] = counts.get(key, 0) + 1
    n = len(report.assets)
    if not counts or n == 0:
        return Paragraph("Severity mix: insufficient classified assets to chart.", body)

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
    drawing.add(String(220, 120, f"Severity mix (n={n})", fontName="Helvetica-Bold", fontSize=11))
    return drawing


def mosca_timeline(report: MigrationReport) -> Drawing:
    mosca = report.mosca
    x = mosca.data_shelf_life_years
    y = mosca.migration_time_years
    z = mosca.years_to_q_day
    max_val = max(x + y, z, 1.0)
    drawing = Drawing(400, 110)
    drawing.add(String(0, 95, "Mosca timeline (years)", fontName="Helvetica-Bold", fontSize=11))
    bars = [
        (f"X data shelf ({x}y)", x, SKY),
        (f"Y migration ({y}y)", y, AMBER),
        (f"Z to Q-Day ({z}y)", z, RED),
    ]
    y_pos = 70
    for label, value, color in bars:
        width = max(4, 280 * (value / max_val))
        drawing.add(String(0, y_pos + 2, label, fontName="Helvetica", fontSize=8))
        drawing.add(Rect(130, y_pos - 2, width, 10, fillColor=color, strokeColor=color))
        y_pos -= 22
    assessment = mosca_assessment_for_report(mosca)
    drawing.add(String(0, 8, assessment.get("interpretation", "")[:90], fontName="Helvetica", fontSize=7))
    return drawing


def algorithm_breakdown(report: MigrationReport) -> Drawing | None:
    families: dict[str, int] = {}
    for asset in report.assets:
        alg = (asset.algorithm or "unknown").upper()
        if "ML-KEM" in alg or "MLKEM" in alg or "HYBRID" in alg or asset.pqc_ready:
            key = "PQC / hybrid"
        elif "RSA" in alg:
            key = "RSA"
        elif "EC" in alg or "ECD" in alg:
            key = "ECDSA/ECDH"
        elif "ED" in alg:
            key = "EdDSA"
        else:
            key = alg.split("-")[0][:12]
        families[key] = families.get(key, 0) + 1
    if not families:
        return None
    drawing = Drawing(400, 120)
    drawing.add(String(0, 105, f"Algorithm families (n={len(report.assets)})", fontName="Helvetica-Bold", fontSize=11))
    y_pos = 85
    max_count = max(families.values())
    for label, count in sorted(families.items(), key=lambda item: -item[1])[:6]:
        width = max(4, 250 * (count / max_count))
        drawing.add(String(0, y_pos, f"{label} ({count})", fontName="Helvetica", fontSize=8))
        drawing.add(Rect(120, y_pos - 2, width, 8, fillColor=ACCENT, strokeColor=ACCENT))
        y_pos -= 14
    return drawing


def risk_quadrant(report: MigrationReport, body: Any) -> Any:
    """Severity × HNDL exposure quadrant — no dummy slices when inventory empty."""
    if not report.assets:
        return Paragraph("Risk quadrant: insufficient classified assets.", body)

    buckets = {
        "Critical + HNDL": 0,
        "Critical, no HNDL": 0,
        "Lower + HNDL": 0,
        "Lower, no HNDL": 0,
    }
    for asset in report.assets:
        critical = asset.vulnerability.severity in {"critical", "high", "broken"}
        hndl = bool(asset.vulnerability.hndl_exposed)
        if critical and hndl:
            buckets["Critical + HNDL"] += 1
        elif critical:
            buckets["Critical, no HNDL"] += 1
        elif hndl:
            buckets["Lower + HNDL"] += 1
        else:
            buckets["Lower, no HNDL"] += 1

    drawing = Drawing(400, 150)
    drawing.add(String(0, 135, "Risk quadrant (severity × HNDL)", fontName="Helvetica-Bold", fontSize=11))
    y_pos = 115
    max_count = max(buckets.values()) or 1
    for label, count in buckets.items():
        width = max(4, 280 * (count / max_count))
        drawing.add(String(0, y_pos, f"{label}: {count}", fontName="Helvetica", fontSize=8))
        color = RED if "Critical + HNDL" in label else AMBER if "HNDL" in label else SKY
        drawing.add(Rect(150, y_pos - 2, width, 10, fillColor=color, strokeColor=color))
        y_pos -= 22
    return drawing
