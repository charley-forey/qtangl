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
from app.pqc.report import report_to_json, report_to_pdf
from app.pqc.report_bundle import build_evidence_bundle
from app.remediation.service import completion_pct, list_remediation_status, upsert_remediation_status
from app.pqc.serialize import serialize_bundle
from app.sharing.service import create_share_link, revoke_share_link
from app.store.scan_jobs import delete_job, get_job, list_jobs_for_tenant, load_scan_bundle

router = APIRouter(prefix="/tenant", tags=["tenant"])


class ScheduleCreateRequest(BaseModel):
    scenarioId: str = Field(default="bank-tls-inventory")
    target: str | None = None
    cadenceHours: int = Field(default=168, ge=1, le=8760)
    notifyEmail: str | None = None


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
    format: str = Query(default="pdf", pattern="^(pdf|json|bundle)$"),
) -> Response:
    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan report not found.")

    from app.pqc.bundle_codec import bundle_from_api_dict

    bundle = bundle_from_api_dict(bundle_dict)
    if format == "json":
        return JSONResponse(content=report_to_json(bundle.report))
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


class IntegrationConfigRequest(BaseModel):
    config: dict[str, Any] = Field(default_factory=dict)


class IntegrationPushRequest(BaseModel):
    remediationId: str
    provider: str = Field(default="jira")


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
