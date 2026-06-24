"""MSSP portfolio board PDF — cover summary + merged per-child board packs."""

from __future__ import annotations

import io
from typing import Any

from app.branding.resolve import resolve_branding

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    _HAS_REPORTLAB = True
except ImportError:  # pragma: no cover
    _HAS_REPORTLAB = False

from app.pqc.report_pdf.common import branding_display_name, logo_flowable
from app.pqc.report_pdf.styles import pdf_styles


def _merge_pdfs(chunks: list[bytes]) -> bytes:
    filtered = [chunk for chunk in chunks if chunk and chunk.startswith(b"%PDF")]
    if not filtered:
        raise RuntimeError("No PDF content to merge")
    if len(filtered) == 1:
        return filtered[0]
    try:
        from pypdf import PdfReader, PdfWriter
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError("pypdf is required to merge portfolio board PDFs") from exc

    writer = PdfWriter()
    for chunk in filtered:
        reader = PdfReader(io.BytesIO(chunk))
        for page in reader.pages:
            writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def _build_portfolio_cover_pdf(
    *,
    parent_tenant_id: str,
    child_summaries: list[dict[str, Any]],
) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required for PDF generation")

    branding = resolve_branding(parent_tenant_id).get("reportBranding") or {}
    company = branding_display_name(branding) or "Partner portfolio"
    styles = pdf_styles(branding)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title=f"{company} Portfolio QBR",
    )
    story: list[Any] = []
    logo = logo_flowable(branding)
    if logo:
        story.append(logo)
        story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(f"{company} — Portfolio board pack", styles["title"]))
    story.append(Spacer(1, 0.15 * inch))
    story.append(
        Paragraph(
            f"Aggregate view across {len(child_summaries)} customer workspace(s). "
            "Following sections include per-customer board briefs where baselines exist.",
            styles["muted"],
        )
    )
    story.append(Spacer(1, 0.25 * inch))

    rows = [["Customer", "Readiness", "Open alerts", "Schedules", "Last scan (days)"]]
    for child in child_summaries:
        name = str(child.get("childTenantName") or child.get("label") or child.get("childTenantId") or "—")
        score = child.get("latestReadiness")
        rows.append(
            [
                name,
                str(score) if score is not None else "—",
                str(child.get("openAlerts") or 0),
                str(child.get("activeSchedules") or 0),
                str(child.get("lastScanAgeDays") if child.get("lastScanAgeDays") is not None else "—"),
            ]
        )
    table = Table(rows, colWidths=[2.2 * inch, 0.9 * inch, 0.9 * inch, 0.9 * inch, 1.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ]
        )
    )
    story.append(table)
    footer = str(branding.get("footerText") or "").strip()
    if footer:
        story.append(Spacer(1, 0.3 * inch))
        story.append(Paragraph(footer, styles["muted"]))

    doc.build(story)
    return buffer.getvalue()


def _build_child_divider_pdf(*, child_name: str, branding: dict[str, Any]) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required for PDF generation")

    styles = pdf_styles(branding)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title=f"{child_name} board brief",
    )
    story = [
        Paragraph("Customer board brief", styles["muted"]),
        Spacer(1, 0.2 * inch),
        Paragraph(child_name, styles["title"]),
        Spacer(1, 0.15 * inch),
        Paragraph("Prepared for MSSP portfolio QBR.", styles["body"]),
        PageBreak(),
    ]
    doc.build(story)
    return buffer.getvalue()


def _build_child_placeholder_pdf(*, child_name: str, branding: dict[str, Any]) -> bytes:
    if not _HAS_REPORTLAB:
        raise RuntimeError("reportlab is required for PDF generation")

    styles = pdf_styles(branding)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.75 * inch,
        title=f"{child_name} — no baseline",
    )
    story = [
        Paragraph(child_name, styles["title"]),
        Spacer(1, 0.2 * inch),
        Paragraph(
            "No completed baseline scan is available for this customer workspace yet. "
            "Run an Assess or Monitor baseline to include a full board brief in the next export.",
            styles["body"],
        ),
        PageBreak(),
    ]
    doc.build(story)
    return buffer.getvalue()


def _child_board_pdf_bytes(
    *,
    child_tenant_id: str,
    parent_tenant_id: str,
    child_name: str,
) -> bytes:
    from app.branding.resolve import resolved_report_branding
    from app.pqc.bundle_codec import bundle_from_api_dict
    from app.pqc.report_export import board_pdf_bytes, bundle_report
    from app.remediation.service import list_remediation_status
    from app.store.scan_jobs import list_jobs_for_tenant, load_scan_bundle

    branding = resolved_report_branding(tenant_id=parent_tenant_id)
    if not isinstance(branding, dict):
        branding = {}

    scans = list_jobs_for_tenant(tenant_id=child_tenant_id, limit=50)
    latest = next((scan for scan in scans if scan.get("status") == "done"), None)
    if latest is None:
        return _build_child_placeholder_pdf(child_name=child_name, branding=branding)

    scan_id = str(latest.get("scanId") or "")
    bundle_dict = load_scan_bundle(scan_id, tenant_id=child_tenant_id)
    if bundle_dict is None:
        return _build_child_placeholder_pdf(child_name=child_name, branding=branding)

    report = bundle_report(bundle_from_api_dict(bundle_dict))
    statuses = list_remediation_status(tenant_id=child_tenant_id, scan_id=scan_id)
    return board_pdf_bytes(
        report,
        tenant_id=child_tenant_id,
        branding=branding,
        remediation_statuses=statuses,
    )


def build_portfolio_board_pdf(
    *,
    parent_tenant_id: str,
    child_summaries: list[dict[str, Any]],
) -> bytes:
    """Cover summary table plus merged per-child board PDFs (pypdf required for merge)."""
    cover = _build_portfolio_cover_pdf(parent_tenant_id=parent_tenant_id, child_summaries=child_summaries)
    if not child_summaries:
        return cover

    branding = resolve_branding(parent_tenant_id).get("reportBranding") or {}
    parts = [cover]
    for child in child_summaries:
        child_id = str(child.get("childTenantId") or child.get("tenantId") or "").strip()
        name = str(child.get("childTenantName") or child.get("tenantName") or child.get("label") or child_id or "Customer")
        if not child_id:
            continue
        parts.append(_build_child_divider_pdf(child_name=name, branding=branding))
        try:
            parts.append(
                _child_board_pdf_bytes(
                    child_tenant_id=child_id,
                    parent_tenant_id=parent_tenant_id,
                    child_name=name,
                )
            )
        except Exception:
            parts.append(_build_child_placeholder_pdf(child_name=name, branding=branding))

    return _merge_pdfs(parts)


def portfolio_board_csv(*, child_summaries: list[dict[str, Any]]) -> str:
    lines = ["customer,readiness,open_alerts,active_schedules,last_scan_age_days"]
    for child in child_summaries:
        name = str(child.get("childTenantName") or child.get("label") or child.get("childTenantId") or "")
        score = child.get("latestReadiness")
        lines.append(
            ",".join(
                [
                    _csv_cell(name),
                    _csv_cell(str(score) if score is not None else ""),
                    _csv_cell(str(child.get("openAlerts") or 0)),
                    _csv_cell(str(child.get("activeSchedules") or 0)),
                    _csv_cell(str(child.get("lastScanAgeDays") if child.get("lastScanAgeDays") is not None else "")),
                ]
            )
        )
    return "\n".join(lines) + "\n"


def _csv_cell(value: str) -> str:
    if "," in value or '"' in value:
        return '"' + value.replace('"', '""') + '"'
    return value
