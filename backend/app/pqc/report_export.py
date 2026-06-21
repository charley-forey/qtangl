from __future__ import annotations

import json
from typing import Any

from fastapi import HTTPException, Response, status
from fastapi.responses import JSONResponse

from app.pqc.models import MigrationReport, ScanBundle
from app.pqc.report import (
    report_to_auditor,
    report_to_board,
    report_to_executive,
    report_to_json,
    report_to_pdf,
)
from app.pqc.report_bundle import build_evidence_bundle
from app.pqc.report_validate import coherence_http_headers, validate_report_coherence
from app.pqc.findings_delta import attach_findings_delta
from app.remediation.service import apply_remediation_to_migration_report, merge_remediation_into_report


def _assess_paid(*, tenant_id: str) -> bool:
    try:
        from app.tenant.settings import get_tenant_billing_flags

        billing = get_tenant_billing_flags(tenant_id=tenant_id)
        return bool(billing.get("assessPaidAt"))
    except Exception:
        return tenant_id not in {"sandbox", ""}


def enrich_report_for_export(
    report: MigrationReport,
    *,
    tenant_id: str,
    remediation_statuses: list[dict[str, Any]] | None = None,
    branding: dict[str, Any] | None = None,
) -> MigrationReport:
    """Single enrichment path for all export endpoints."""
    statuses = remediation_statuses or []
    enriched = apply_remediation_to_migration_report(report, statuses=statuses)

    exec_sum = attach_findings_delta(enriched)
    try:
        peer = exec_sum.get("peerComparison")
        if not (isinstance(peer, dict) and peer.get("available")):
            from app.data.benchmarks import compare_to_benchmark
            from app.tenant.settings import get_tenant_settings_raw

            settings = get_tenant_settings_raw(tenant_id=tenant_id)
            if settings.get("benchmarkOptIn"):
                industry = str(settings.get("industry") or "financial")
                peer_data = compare_to_benchmark(score=enriched.readiness_score, industry=industry)
                if peer_data.get("available"):
                    exec_sum["peerComparison"] = peer_data
    except Exception:
        pass

    from dataclasses import replace

    scope_meta = dict(enriched.executive_summary or {})
    scope_meta.update(exec_sum)
    if branding:
        scope_meta["_branding"] = branding

    try:
        from app.pqc.remediation_projection import simulate_remediation_scenarios

        scope_meta["remediationProjection"] = simulate_remediation_scenarios(enriched)
    except Exception:
        pass

    try:
        from app.recommendations.maturity import compute_maturity_stage

        scope_meta["maturityStage"] = compute_maturity_stage(tenant_id=tenant_id)
    except Exception:
        pass

    try:
        from app.pqc.risk import coverage_confidence_for_assets

        scope_meta["coverageBreakdown"] = coverage_confidence_for_assets(enriched.assets)
    except Exception:
        pass

    try:
        from app.tenant.settings import get_tenant_settings_raw

        settings = get_tenant_settings_raw(tenant_id=tenant_id)
        billing = settings.get("billing") or {}
        if billing.get("scanAuthorizationAt"):
            scope_meta["scanAuthorizationAt"] = billing["scanAuthorizationAt"]
    except Exception:
        pass

    return replace(enriched, executive_summary=scope_meta)


def assert_report_exportable(
    report: MigrationReport,
    *,
    tenant_id: str,
    watermark_only: bool = False,
) -> tuple[list[str], bool]:
    """Validate coherence. Returns (issues, watermark_only)."""
    strict = _assess_paid(tenant_id=tenant_id)
    issues = validate_report_coherence(report, strict=strict)
    if not issues:
        return [], False
    if strict and not watermark_only:
        headers = coherence_http_headers(issues)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Report failed coherence validation.", "issues": issues},
            headers=headers,
        )
    return issues, True


def export_report_response(
    *,
    scan_id: str,
    report: MigrationReport,
    export_format: str,
    tenant_id: str,
    branding: dict[str, Any] | None = None,
    remediation_statuses: list[dict[str, Any]] | None = None,
    include_glossary_in_full: bool = False,
) -> Response:
    enriched = enrich_report_for_export(
        report,
        tenant_id=tenant_id,
        remediation_statuses=remediation_statuses,
        branding=branding,
    )
    issues, watermark = assert_report_exportable(enriched, tenant_id=tenant_id)
    fmt = export_format.lower()
    brand = branding if isinstance(branding, dict) else None
    pdf_opts = {
        "branding": brand,
        "watermark": watermark,
        "coherence_issues": issues,
        "include_glossary": include_glossary_in_full,
    }

    if fmt == "executive":
        from app.pqc.report_pdf import build_executive_pdf

        content = build_executive_pdf(enriched, branding=brand, **pdf_opts)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{scan_id}-executive.pdf"',
                **coherence_http_headers(issues),
            },
        )
    if fmt == "json":
        payload = report_to_json(enriched)
        return JSONResponse(
            content=merge_remediation_into_report(payload, statuses=remediation_statuses or []),
            headers=coherence_http_headers(issues),
        )
    if fmt == "board-json":
        payload = report_to_board(enriched)
        return JSONResponse(
            content=merge_remediation_into_report(payload, statuses=remediation_statuses or []),
            headers=coherence_http_headers(issues),
        )
    if fmt == "board":
        from app.pqc.report_pdf import build_board_pdf

        content = build_board_pdf(enriched, **pdf_opts)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{scan_id}-board.pdf"',
                **coherence_http_headers(issues),
            },
        )
    if fmt == "auditor":
        from app.pqc.report_pdf import build_auditor_pdf

        content = build_auditor_pdf(enriched, **pdf_opts)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{scan_id}-auditor.pdf"',
                **coherence_http_headers(issues),
            },
        )
    if fmt == "bundle":
        content = build_evidence_bundle(
            enriched,
            remediation_statuses=remediation_statuses,
            branding=brand,
            pdf_options=pdf_opts,
        )
        return Response(
            content=content,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{scan_id}-evidence.zip"',
                **coherence_http_headers(issues),
            },
        )
    if fmt == "engagement":
        from app.pqc.engagement_kit import build_engagement_kit_zip

        content = build_engagement_kit_zip(enriched, branding=brand)
        return Response(
            content=content,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{scan_id}-engagement.zip"',
                **coherence_http_headers(issues),
            },
        )
    if fmt == "pdf":
        content = report_to_pdf(enriched, branding=brand, pdf_options=pdf_opts)
        media = "application/pdf" if content[:4] == b"%PDF" else "application/json"
        return Response(
            content=content,
            media_type=media,
            headers={
                "Content-Disposition": f'attachment; filename="{scan_id}-report.pdf"',
                **coherence_http_headers(issues),
            },
        )
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Unsupported export format: {export_format}",
    )


def board_pdf_bytes(
    report: MigrationReport,
    *,
    tenant_id: str,
    branding: dict[str, Any] | None = None,
    remediation_statuses: list[dict[str, Any]] | None = None,
) -> bytes:
    """Build board PDF with the same enrichment and coherence rules as HTTP export."""
    enriched = enrich_report_for_export(
        report,
        tenant_id=tenant_id,
        remediation_statuses=remediation_statuses,
        branding=branding,
    )
    issues, watermark = assert_report_exportable(enriched, tenant_id=tenant_id)
    from app.pqc.report_pdf import build_board_pdf

    brand = branding if isinstance(branding, dict) else None
    return build_board_pdf(
        enriched,
        branding=brand,
        watermark=watermark,
        coherence_issues=issues,
    )


def bundle_report(bundle: ScanBundle) -> MigrationReport:
    """Prefer report.assets; fall back to bundle-level assets if report empty."""
    report = bundle.report
    if not report.assets and bundle.assets:
        from dataclasses import replace

        report = replace(report, assets=list(bundle.assets))
    if not report.remediation_backlog and bundle.remediation_backlog:
        from dataclasses import replace

        report = replace(report, remediation_backlog=list(bundle.remediation_backlog))
    return report
