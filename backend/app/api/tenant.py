from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse, Response

from app.audit.service import log_action
from app.auth import AuthContext, require_auth, require_auth_readonly, require_auth_write
from app.db.config import persistence_enabled, redis_enabled
from app.monitoring.service import create_schedule, delete_schedule, list_schedules, scheduler_enabled
from app.notifications.email import send_report_email
from app.pqc.report import report_to_json, report_to_pdf, report_to_executive
from app.pqc.report_bundle import build_evidence_bundle
from app.remediation.service import (
    completion_pct,
    list_remediation_status,
    recommend_remediation_plan,
    simulate_post_migration_readiness,
    upsert_remediation_status,
)
from app.pqc.serialize import serialize_bundle
from app.sharing.service import create_share_link, revoke_share_link
from app.store.scan_jobs import delete_job, get_job, list_jobs_for_tenant, load_scan_bundle

router = APIRouter(prefix="/tenant", tags=["tenant"])


class ScheduleCreateRequest(BaseModel):
    scenarioId: str = Field(default="bank-tls-inventory")
    target: str | None = None
    cadenceHours: int = Field(default=168, ge=1, le=8760)
    notifyEmail: str | None = None
    cloudImportPayload: str | None = None


class RemediationUpdateRequest(BaseModel):
    remediationId: str
    status: str
    owner: str | None = None
    notes: str | None = None


class EmailReportRequest(BaseModel):
    email: str


class ShareLinkRequest(BaseModel):
    expiresHours: int = Field(default=168, ge=1, le=720)


@router.get("/me")
def tenant_me(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "persistenceEnabled": persistence_enabled(),
        "schedulerEnabled": scheduler_enabled() and redis_enabled(),
    }


@router.get("/scans")
def tenant_scans(
    auth: AuthContext = Depends(require_auth_readonly),
    limit: int = Query(default=25, ge=1, le=100),
) -> dict:
    scans = list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=limit)
    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "count": len(scans),
        "scans": scans,
    }


@router.get("/scans/{scan_id}")
def tenant_scan_detail(scan_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    job = get_job(scan_id, tenant_id=auth.tenant_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    payload = {
        "status": "success",
        "scanId": job.scan_id,
        "jobStatus": job.status,
        "lifecycleState": _scan_lifecycle_state(job.status, bool(job.bundle), bool(job.error)),
        "error": job.error,
        "timeline": [
            {
                "key": event.key,
                "label": event.label,
                "durationMs": event.duration_ms,
                "status": event.status,
            }
            for event in job.timeline
        ],
    }
    if job.bundle:
        payload.update(serialize_bundle(job.bundle))
        statuses = list_remediation_status(tenant_id=auth.tenant_id, scan_id=scan_id)
        payload["remediationStatus"] = statuses
        payload["remediationCompletionPct"] = completion_pct(
            statuses, len(job.bundle.remediation_backlog)
        )
    return payload


@router.delete("/scans/{scan_id}")
def tenant_delete_scan(scan_id: str, auth: AuthContext = Depends(require_auth)) -> dict:
    deleted = delete_job(scan_id, tenant_id=auth.tenant_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    log_action(tenant_id=auth.tenant_id, action="scan.delete", resource_id=scan_id, actor=auth.tenant_id)
    return {"status": "success", "scanId": scan_id, "deleted": True}


@router.get("/scans/{scan_id}/report")
def tenant_scan_report(
    scan_id: str,
    auth: AuthContext = Depends(require_auth_readonly),
    format: str = Query(default="pdf", pattern="^(pdf|json|bundle|executive|board|auditor)$"),
) -> Response:
    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan report not found.")

    from app.pqc.bundle_codec import bundle_from_api_dict

    bundle = bundle_from_api_dict(bundle_dict)
    if format == "json":
        return JSONResponse(content=report_to_json(bundle.report))
    if format == "executive":
        return JSONResponse(content=report_to_executive(bundle.report))
    if format == "board":
        from app.pqc.report import report_to_board

        return JSONResponse(content=report_to_board(bundle.report))
    if format == "auditor":
        from app.pqc.report import report_to_auditor

        return JSONResponse(content=report_to_auditor(bundle.report))
    if format == "bundle":
        content = build_evidence_bundle(bundle.report)
        return Response(
            content=content,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{scan_id}-evidence.zip"'},
        )
    content = report_to_pdf(bundle.report)
    return Response(content=content, media_type="application/pdf")


@router.post("/scans/{scan_id}/email")
def tenant_email_report(
    scan_id: str,
    body: EmailReportRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan report not found.")
    from app.pqc.bundle_codec import bundle_from_api_dict

    bundle = bundle_from_api_dict(bundle_dict)
    import os

    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    result = send_report_email(
        to_email=body.email,
        scan_id=scan_id,
        target_domain=bundle.report.target_domain,
        report_url=f"{base}/dashboard",
        readiness_band=bundle.report.readiness_band,
    )
    log_action(
        tenant_id=auth.tenant_id,
        action="report.email",
        resource_id=scan_id,
        detail={"email": body.email, "sent": result.get("sent")},
    )
    return {"status": "success", **result}


@router.get("/scans/{scan_id}/remediation")
def tenant_remediation_list(scan_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    statuses = list_remediation_status(tenant_id=auth.tenant_id, scan_id=scan_id)
    return {"status": "success", "scanId": scan_id, "items": statuses}


@router.post("/scans/{scan_id}/remediation")
def tenant_remediation_update(
    scan_id: str,
    body: RemediationUpdateRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    try:
        item = upsert_remediation_status(
            tenant_id=auth.tenant_id,
            scan_id=scan_id,
            remediation_id=body.remediationId,
            status=body.status,
            owner=body.owner,
            notes=body.notes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    log_action(
        tenant_id=auth.tenant_id,
        action="remediation.update",
        resource_id=body.remediationId,
        detail={"status": body.status},
    )
    return {"status": "success", "item": item}


@router.get("/schedules")
def tenant_schedules(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    if not persistence_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Scheduled monitoring requires Postgres persistence. Contact Qtangl for enterprise deploy.",
        )
    return {"status": "success", "schedules": list_schedules(tenant_id=auth.tenant_id)}


@router.post("/schedules")
def tenant_create_schedule(
    body: ScheduleCreateRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    if not persistence_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Scheduled monitoring requires Postgres persistence. Contact Qtangl for enterprise deploy.",
        )
    if not scheduler_enabled() or not redis_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Scheduler requires Redis + worker (QTANGL_ENABLE_SCHEDULER). Contact Qtangl.",
        )
    schedule = create_schedule(
        tenant_id=auth.tenant_id,
        scenario_id=body.scenarioId,
        target=body.target,
        cadence_hours=body.cadenceHours,
        notify_email=body.notifyEmail,
        import_payload_json=body.cloudImportPayload,
    )
    log_action(tenant_id=auth.tenant_id, action="schedule.create", resource_id=schedule["id"])
    return {"status": "success", "schedule": schedule}


@router.delete("/schedules/{schedule_id}")
def tenant_delete_schedule(schedule_id: str, auth: AuthContext = Depends(require_auth)) -> dict:
    if not delete_schedule(tenant_id=auth.tenant_id, schedule_id=schedule_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found.")
    log_action(tenant_id=auth.tenant_id, action="schedule.delete", resource_id=schedule_id)
    return {"status": "success", "scheduleId": schedule_id, "deleted": True}


@router.post("/scans/{scan_id}/share")
def tenant_create_share_link(
    scan_id: str,
    body: ShareLinkRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    if load_scan_bundle(scan_id, tenant_id=auth.tenant_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    link = create_share_link(
        tenant_id=auth.tenant_id,
        scan_id=scan_id,
        expires_hours=body.expiresHours,
    )
    log_action(tenant_id=auth.tenant_id, action="share.create", resource_id=scan_id)
    return {"status": "success", **link}


@router.delete("/share/{link_id}")
def tenant_revoke_share(link_id: str, auth: AuthContext = Depends(require_auth)) -> dict:
    if not revoke_share_link(tenant_id=auth.tenant_id, link_id=link_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found.")
    return {"status": "success", "linkId": link_id, "revoked": True}


class PortfolioTargetRequest(BaseModel):
    target: str
    businessUnit: str = "default"
    label: str | None = None


class WebhookRequest(BaseModel):
    url: str
    events: str = "scan.complete"


@router.get("/portfolio")
def tenant_portfolio(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.portfolio.service import list_portfolio, readiness_rollup

    return {
        "status": "success",
        "targets": list_portfolio(tenant_id=auth.tenant_id),
        "rollup": readiness_rollup(tenant_id=auth.tenant_id),
    }


@router.post("/portfolio")
def tenant_add_portfolio_target(
    body: PortfolioTargetRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    from app.portfolio.service import add_portfolio_target

    target = add_portfolio_target(
        tenant_id=auth.tenant_id,
        target=body.target,
        business_unit=body.businessUnit,
        label=body.label,
    )
    return {"status": "success", "target": target}


@router.get("/webhooks")
def tenant_webhooks(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.notifications.webhook_store import list_webhooks

    return {"status": "success", "webhooks": list_webhooks(tenant_id=auth.tenant_id)}


@router.post("/webhooks")
def tenant_create_webhook(body: WebhookRequest, auth: AuthContext = Depends(require_auth_write)) -> dict:
    from app.notifications.webhook_store import create_webhook

    webhook = create_webhook(tenant_id=auth.tenant_id, url=body.url, events=body.events)
    return {"status": "success", "webhook": webhook}


@router.delete("/webhooks/{webhook_id}")
def tenant_delete_webhook(webhook_id: str, auth: AuthContext = Depends(require_auth_write)) -> dict:
    from app.notifications.webhook_store import delete_webhook

    if not delete_webhook(tenant_id=auth.tenant_id, webhook_id=webhook_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found.")
    return {"status": "success", "webhookId": webhook_id, "deleted": True}


@router.get("/webhooks/dlq")
def tenant_webhook_dlq(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.notifications.webhooks import list_dead_letters

    return {"status": "success", "items": list_dead_letters(tenant_id=auth.tenant_id)}


@router.post("/webhooks/replay")
def tenant_webhook_replay(body: DeadLetterReplayRequest, auth: AuthContext = Depends(require_auth_write)) -> dict:
    from app.notifications.webhooks import replay_dead_letter

    result = replay_dead_letter(tenant_id=auth.tenant_id, dead_letter_id=body.deadLetterId)
    return {"status": "success", **result}


class IntegrationConfigRequest(BaseModel):
    config: dict[str, Any] = Field(default_factory=dict)


class IntegrationPushRequest(BaseModel):
    remediationId: str
    provider: str = Field(default="jira")


class RemediationSimulationRequest(BaseModel):
    remediationIds: list[str] = Field(default_factory=list)


class DeadLetterReplayRequest(BaseModel):
    deadLetterId: str


class IntegrationPullRequest(BaseModel):
    remediationId: str


@router.get("/integrations")
def tenant_integrations(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.integrations.service import list_integrations

    return {"status": "success", "integrations": list_integrations(tenant_id=auth.tenant_id)}


@router.post("/integrations/{provider}")
def tenant_upsert_integration(
    provider: str,
    body: IntegrationConfigRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    from app.integrations.service import upsert_integration

    try:
        integration = upsert_integration(
            tenant_id=auth.tenant_id,
            provider=provider,
            config=body.config,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return {"status": "success", "integration": integration}


@router.post("/scans/{scan_id}/integrations/push")
def tenant_push_remediation(
    scan_id: str,
    body: IntegrationPushRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    from app.integrations.service import push_remediation_ticket

    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    backlog = bundle_dict.get("remediationBacklog") or []
    item = next((row for row in backlog if row.get("id") == body.remediationId), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Remediation item not found.")
    result = push_remediation_ticket(
        tenant_id=auth.tenant_id,
        provider=body.provider,
        item=item,
        scan_id=scan_id,
    )
    return {"status": "success", **result}


@router.post("/integrations/pull")
def tenant_pull_integration_status(
    body: IntegrationPullRequest,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    from app.integrations.service import pull_ticket_status

    result = pull_ticket_status(tenant_id=auth.tenant_id, remediation_id=body.remediationId)
    return {"status": "success", **result}


@router.get("/scans/{scan_id}/remediation/intelligence")
def tenant_remediation_intelligence(
    scan_id: str,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    backlog = bundle_dict.get("remediationBacklog") or []
    plans = [recommend_remediation_plan(item) for item in backlog[:50]]
    return {"status": "success", "scanId": scan_id, "plans": plans}


@router.post("/scans/{scan_id}/remediation/simulate")
def tenant_remediation_simulate(
    scan_id: str,
    body: RemediationSimulationRequest,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    report = bundle_dict.get("report") or {}
    projection = simulate_post_migration_readiness(
        report=report,
        selected_remediation_ids=body.remediationIds,
    )
    return {"status": "success", "scanId": scan_id, "projection": projection}


@router.post("/cloud-import")
def tenant_cloud_import(
    body: dict[str, Any],
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    """Parse cloud PKI JSON/CSV and return normalized inventory rows for upload-bundle scans."""
    from app.pqc.cloud_import import parse_cloud_inventory

    payload = body.get("payload")
    filename = str(body.get("filename", "import.json"))
    if not payload or not isinstance(payload, str):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="payload required.")
    try:
        rows = parse_cloud_inventory(payload, filename=filename)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return {"status": "success", "count": len(rows), "rows": rows}


@router.get("/export")
def tenant_export_data(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    """G4: export tenant scan metadata and remediation status."""
    from app.remediation.service import remediation_velocity

    scans = list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=500)
    velocity = remediation_velocity(tenant_id=auth.tenant_id)
    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "exportedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "scans": scans,
        "remediationVelocity": velocity,
    }


@router.get("/slo")
def tenant_slo(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    scans = list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=100)
    terminal = [scan for scan in scans if scan.get("status") in {"done", "error"}]
    success = sum(1 for scan in terminal if scan.get("status") == "done")
    reliability = round((100.0 * success / len(terminal)), 1) if terminal else 100.0
    report_ready = sum(1 for scan in terminal if scan.get("reportAvailable"))
    report_rate = round((100.0 * report_ready / len(terminal)), 1) if terminal else 100.0
    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "metrics": {
            "scanSuccessRatePct": reliability,
            "reportAvailabilityPct": report_rate,
            "sampleSize": len(terminal),
            "targetSloPct": 99.0,
        },
    }


@router.get("/portfolio/command-center")
def tenant_portfolio_command_center(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.portfolio.service import portfolio_command_center, weekly_executive_digest

    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "commandCenter": portfolio_command_center(tenant_id=auth.tenant_id),
        "weeklyDigest": weekly_executive_digest(tenant_id=auth.tenant_id),
    }


@router.delete("/data")
def tenant_delete_data(auth: AuthContext = Depends(require_auth_write)) -> dict:
    """G4: delete all scan jobs for tenant (retention / offboarding)."""
    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Persistence required.")
    deleted = 0
    for scan in list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=500):
        if delete_job(scan["scanId"], tenant_id=auth.tenant_id):
            deleted += 1
    log_action(tenant_id=auth.tenant_id, action="tenant.data.delete", detail={"deletedScans": deleted})
    return {"status": "success", "deletedScans": deleted}


def _scan_lifecycle_state(job_status: str, has_bundle: bool, has_error: bool) -> str:
    if has_error or job_status == "error":
        return "failed"
    if has_bundle and job_status == "done":
        return "report_ready"
    if job_status in {"running", "queued"}:
        return "collecting"
    return "initialized"
