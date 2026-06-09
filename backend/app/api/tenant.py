from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse, Response

from app.audit.service import log_action
from app.auth import AuthContext, require_auth, require_auth_admin, require_auth_readonly, require_auth_write
from app.db.config import persistence_enabled, redis_enabled
import os
from app.billing.entitlements import check_schedule_quota
from app.monitoring.service import (
    create_schedule,
    delete_schedule,
    list_schedules,
    schedule_run_history,
    scheduler_enabled,
    update_schedule,
)
from app.notifications.email import send_report_email
from app.pqc.report import report_to_json, report_to_pdf, report_to_executive
from app.pqc.report_bundle import build_evidence_bundle
from app.remediation.service import (
    completion_pct,
    list_remediation_status,
    apply_remediation_to_migration_report,
    merge_remediation_into_report,
    recommend_remediation_plan,
    simulate_post_migration_readiness,
    upsert_remediation_status,
    verify_remediation_fix,
)
from app.pqc.serialize import serialize_bundle
from app.sharing.service import create_share_link, list_share_links, revoke_share_link
from app.store.scan_jobs import delete_job, get_job, list_jobs_for_tenant, load_scan_bundle

router = APIRouter(prefix="/tenant", tags=["tenant"])


class ScheduleCreateRequest(BaseModel):
    scenarioId: str = Field(default="bank-tls-inventory")
    target: str | None = None
    cadenceHours: int = Field(default=168, ge=1, le=8760)
    notifyEmail: str | None = None
    cloudImportPayload: str | None = None
    jobType: str = Field(default="scan", pattern="^(scan|cloud_pull)$")
    integrationProvider: str | None = None


class TenantSettingsRequest(BaseModel):
    readinessDropThreshold: float | None = None
    alertOnNewQuantumVulnerable: bool | None = None
    certExpiryDays: int | None = None
    webhookSigningSecret: str | None = None
    autoRetainScans: bool | None = None
    evidenceRetentionMonths: int | None = Field(default=None, ge=1, le=120)
    benchmarkOptIn: bool | None = None
    industry: str | None = None


class SchedulePatchRequest(BaseModel):
    cadenceHours: int | None = Field(default=None, ge=1, le=8760)
    notifyEmail: str | None = None
    active: bool | None = None


class RemediationUpdateRequest(BaseModel):
    remediationId: str
    status: str
    owner: str | None = None
    notes: str | None = None
    targetDate: str | None = None
    assetId: str | None = None


class RemediationVerifyRequest(BaseModel):
    remediationId: str
    verifyScanId: str


class OidcConfigRequest(BaseModel):
    issuerUrl: str
    clientId: str
    clientSecret: str = ""
    enabled: bool = False


class KeyfactorIntegrationRequest(BaseModel):
    baseUrl: str
    apiToken: str
    collectionId: str | None = None
    writeBackEnabled: bool = False


class ClmIntegrationRequest(BaseModel):
    apiKey: str | None = None
    host: str | None = None
    token: str | None = None
    tenant: str | None = None


class CloudIntegrationRequest(BaseModel):
    region: str | None = None
    vaultName: str | None = None
    roleArn: str | None = None
    externalId: str | None = None
    projectId: str | None = None
    credentialsJson: str | None = None
    kubeconfigJson: str | None = None
    namespace: str | None = None
    context: str | None = None
    tenantId: str | None = None
    clientId: str | None = None
    clientSecret: str | None = None


class EmailReportRequest(BaseModel):
    email: str


class ShareLinkRequest(BaseModel):
    expiresHours: int = Field(default=168, ge=1, le=720)
    label: str = Field(default="", max_length=255)
    scope: str = Field(default="report", pattern="^(report|bundle|passport)$")


@router.get("/me")
def tenant_me(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.billing.entitlements import tenant_entitlements

    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "role": auth.role,
        "persistenceEnabled": persistence_enabled(),
        "schedulerEnabled": scheduler_enabled() and redis_enabled(),
        "entitlements": tenant_entitlements(tenant_id=auth.tenant_id),
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
    statuses = list_remediation_status(tenant_id=auth.tenant_id, scan_id=scan_id)

    if format == "json":
        payload = report_to_json(bundle.report)
        return JSONResponse(content=merge_remediation_into_report(payload, statuses=statuses))
    if format == "executive":
        payload = report_to_executive(bundle.report)
        return JSONResponse(content=merge_remediation_into_report(payload, statuses=statuses))
    if format == "board":
        from app.pqc.report import report_to_board

        payload = report_to_board(bundle.report)
        return JSONResponse(content=merge_remediation_into_report(payload, statuses=statuses))
    if format == "auditor":
        from app.pqc.report import report_to_auditor

        payload = report_to_auditor(bundle.report)
        return JSONResponse(content=merge_remediation_into_report(payload, statuses=statuses))
    if format == "bundle":
        content = build_evidence_bundle(bundle.report, remediation_statuses=statuses)
        return Response(
            content=content,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{scan_id}-evidence.zip"'},
        )
    report_for_pdf = apply_remediation_to_migration_report(bundle.report, statuses=statuses)
    content = report_to_pdf(report_for_pdf)
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
        target_dt = None
        if body.targetDate:
            from datetime import datetime

            target_dt = datetime.fromisoformat(body.targetDate.replace("Z", "+00:00"))
        item = upsert_remediation_status(
            tenant_id=auth.tenant_id,
            scan_id=scan_id,
            remediation_id=body.remediationId,
            status=body.status,
            owner=body.owner,
            notes=body.notes,
            target_date=target_dt,
            asset_id=body.assetId,
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
    quota_error = check_schedule_quota(tenant_id=auth.tenant_id)
    if quota_error:
        from app.telemetry.events import track_event

        track_event("tier_upgrade_clicked", tenant_id=auth.tenant_id, properties=quota_error)
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=quota_error)
    if body.jobType == "cloud_pull" and body.integrationProvider not in {"aws", "azure"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="integrationProvider must be aws or azure for cloud_pull schedules.",
        )
    schedule = create_schedule(
        tenant_id=auth.tenant_id,
        scenario_id=body.scenarioId,
        target=body.target,
        cadence_hours=body.cadenceHours,
        notify_email=body.notifyEmail,
        import_payload_json=body.cloudImportPayload,
        job_type=body.jobType,
        integration_provider=body.integrationProvider,
    )
    log_action(tenant_id=auth.tenant_id, action="schedule.create", resource_id=schedule["id"])
    from app.telemetry.events import track_event

    track_event("schedule_created", tenant_id=auth.tenant_id, properties={"scheduleId": schedule["id"]})
    return {"status": "success", "schedule": schedule}


@router.patch("/schedules/{schedule_id}")
def tenant_patch_schedule(
    schedule_id: str,
    body: SchedulePatchRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    schedule = update_schedule(
        tenant_id=auth.tenant_id,
        schedule_id=schedule_id,
        cadence_hours=body.cadenceHours,
        notify_email=body.notifyEmail,
        active=body.active,
    )
    if schedule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found.")
    log_action(tenant_id=auth.tenant_id, action="schedule.update", resource_id=schedule_id)
    return {"status": "success", "schedule": schedule}


@router.get("/schedules/{schedule_id}/runs")
def tenant_schedule_runs(schedule_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {
        "status": "success",
        "scheduleId": schedule_id,
        "runs": schedule_run_history(tenant_id=auth.tenant_id, schedule_id=schedule_id),
    }


@router.get("/settings")
def tenant_settings_get(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.tenant.settings import get_tenant_settings

    return {"status": "success", "settings": get_tenant_settings(tenant_id=auth.tenant_id)}


@router.put("/settings")
def tenant_settings_put(
    body: TenantSettingsRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    from app.tenant.settings import get_tenant_settings_raw, upsert_tenant_settings

    current = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    updates = body.model_dump(exclude_none=True)
    current.update(updates)
    saved = upsert_tenant_settings(tenant_id=auth.tenant_id, settings=current)
    log_action(tenant_id=auth.tenant_id, action="settings.update", detail=updates)
    return {"status": "success", "settings": saved}


@router.get("/audit")
def tenant_audit(
    auth: AuthContext = Depends(require_auth_admin),
    limit: int = Query(default=50, ge=1, le=500),
    action: str | None = None,
    since: str | None = None,
    cursor: str | None = None,
) -> dict:
    from datetime import datetime

    from app.audit.service import list_audit

    since_dt = None
    if since:
        since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
    entries, next_cursor = list_audit(
        tenant_id=auth.tenant_id,
        limit=limit,
        action_prefix=action,
        since=since_dt,
        cursor=cursor,
    )
    return {"status": "success", "entries": entries, "nextCursor": next_cursor}


@router.get("/audit/export")
def tenant_audit_export(
    auth: AuthContext = Depends(require_auth_admin),
    limit: int = Query(default=500, ge=1, le=5000),
    since: str | None = None,
) -> Response:
    import json
    from datetime import datetime

    from app.audit.service import list_audit

    since_dt = None
    if since:
        since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
    entries, _ = list_audit(tenant_id=auth.tenant_id, limit=limit, since=since_dt)
    ndjson = "\n".join(json.dumps(entry, default=str) for entry in entries) + "\n"
    return Response(content=ndjson, media_type="application/x-ndjson")


@router.post("/scans/{scan_id}/remediation/verify")
def tenant_remediation_verify(
    scan_id: str,
    body: RemediationVerifyRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    result = verify_remediation_fix(
        tenant_id=auth.tenant_id,
        remediation_id=body.remediationId,
        baseline_scan_id=scan_id,
        verify_scan_id=body.verifyScanId,
    )
    log_action(
        tenant_id=auth.tenant_id,
        action="remediation.verify",
        resource_id=body.remediationId,
        detail=result,
    )
    if result.get("verified"):
        from app.telemetry.events import track_event

        track_event(
            "remediation_verified",
            tenant_id=auth.tenant_id,
            properties={"remediationId": body.remediationId, "scanId": scan_id},
        )
    return {"status": "success", **result}


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
        label=body.label,
        scope=body.scope,
    )
    log_action(tenant_id=auth.tenant_id, action="passport.create" if body.scope == "passport" else "share.create", resource_id=scan_id)
    return {"status": "success", **link}


@router.get("/passports")
def tenant_list_passports(
    auth: AuthContext = Depends(require_auth_readonly),
    scanId: str | None = Query(default=None),
) -> dict:
    return {"status": "success", "links": list_share_links(tenant_id=auth.tenant_id, scan_id=scanId)}


@router.delete("/share/{link_id}")
def tenant_revoke_share(link_id: str, auth: AuthContext = Depends(require_auth)) -> dict:
    if not revoke_share_link(tenant_id=auth.tenant_id, link_id=link_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found.")
    return {"status": "success", "linkId": link_id, "revoked": True}


class PortfolioTargetRequest(BaseModel):
    target: str
    businessUnit: str = "default"
    label: str | None = None
    autoSchedule: bool = False
    cadenceHours: int = Field(default=168, ge=1, le=8760)
    notifyEmail: str | None = None


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
    schedule = None
    if body.autoSchedule and persistence_enabled():
        quota_error = check_schedule_quota(tenant_id=auth.tenant_id)
        if quota_error is None and scheduler_enabled() and redis_enabled():
            schedule = create_schedule(
                tenant_id=auth.tenant_id,
                scenario_id="bank-tls-inventory",
                target=body.target,
                cadence_hours=body.cadenceHours,
                notify_email=body.notifyEmail,
            )
    return {"status": "success", "target": target, "schedule": schedule}


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
    from app.tenant.settings import get_tenant_settings_raw

    secret = str(get_tenant_settings_raw(tenant_id=auth.tenant_id).get("webhookSigningSecret", ""))
    result = replay_dead_letter(
        tenant_id=auth.tenant_id,
        dead_letter_id=body.deadLetterId,
        signing_secret=secret,
    )
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
    """Export tenant scan metadata and live remediation status."""
    from app.remediation.service import remediation_velocity

    scans = list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=500)
    velocity = remediation_velocity(tenant_id=auth.tenant_id)
    remediation_by_scan: dict[str, list] = {}
    for scan in scans:
        if scan.get("status") == "done" and scan.get("scanId"):
            remediation_by_scan[scan["scanId"]] = list_remediation_status(
                tenant_id=auth.tenant_id, scan_id=scan["scanId"]
            )
    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "exportedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "scans": scans,
        "remediationByScan": remediation_by_scan,
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
    """Delete all tenant data (retention / offboarding)."""
    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Persistence required.")
    from app.db.offboarding import offboard_tenant

    counts = offboard_tenant(tenant_id=auth.tenant_id)
    log_action(tenant_id=auth.tenant_id, action="tenant.offboard", detail=counts)
    return {"status": "success", **counts}


@router.post("/offboard")
def tenant_offboard(auth: AuthContext = Depends(require_auth_admin)) -> dict:
    """Admin-only alias for full tenant offboarding."""
    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Persistence required.")
    from app.db.offboarding import offboard_tenant

    counts = offboard_tenant(tenant_id=auth.tenant_id)
    log_action(tenant_id=auth.tenant_id, action="tenant.offboard", detail=counts)
    return {"status": "success", **counts}


@router.post("/coverage/code-scan")
def tenant_code_scan(body: dict[str, Any], auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.coverage.code_deps import scan_github_repository, scan_source_snippet

    if body.get("githubOwner") and body.get("githubRepo") and body.get("githubToken"):
        result = scan_github_repository(
            owner=str(body["githubOwner"]),
            repo=str(body["githubRepo"]),
            token=str(body["githubToken"]),
            ref=str(body.get("ref", "HEAD")),
        )
        return {"status": "success", **result}

    content = str(body.get("content", ""))
    path = str(body.get("path", "upload"))
    return {"status": "success", "findings": scan_source_snippet(content=content, path=path)}


@router.get("/coverage/cloud/{provider}")
def tenant_cloud_pull(provider: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.integrations.cloud import test_cloud_connection

    result = test_cloud_connection(tenant_id=auth.tenant_id, provider=provider.lower())
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=result.get("reason", "cloud_pull_failed"),
        )
    return {"status": "success", "provider": provider, "previewCount": result.get("previewCount", 0)}


@router.post("/ai/explain")
def tenant_ai_explain(body: dict[str, Any], auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.ai.copilot import explain_finding

    finding = body.get("finding") or {}
    return {"status": "success", **explain_finding(finding=finding, context=str(body.get("context", "")))}


@router.get("/analytics/anomaly")
def tenant_anomaly(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.monitoring.anomaly import detect_readiness_anomalies

    scores = [
        float(scan["readinessScore"])
        for scan in list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=50)
        if scan.get("readinessScore") is not None
    ]
    scores.reverse()
    return {"status": "success", "alerts": detect_readiness_anomalies(scores=scores)}


@router.get("/analytics/forecast")
def tenant_forecast(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.monitoring.anomaly import forecast_readiness

    scores = [
        float(scan["readinessScore"])
        for scan in list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=50)
        if scan.get("readinessScore") is not None
    ]
    scores.reverse()
    return {"status": "success", **forecast_readiness(scores=scores)}


@router.get("/benchmarks")
def tenant_benchmarks(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.data.benchmarks import compare_to_benchmark, readiness_index_snapshot
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    industry = str(settings.get("industry") or "financial")
    latest = next(
        (
            float(s["readinessScore"])
            for s in list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=10)
            if s.get("readinessScore") is not None
        ),
        None,
    )
    bench = readiness_index_snapshot(industry=industry)
    comparison = compare_to_benchmark(score=latest, industry=industry) if latest is not None else None
    return {
        "status": "success",
        "index": bench,
        "comparison": comparison,
        "benchmarkOptIn": bool(settings.get("benchmarkOptIn")),
    }


@router.get("/drift-intel")
def tenant_drift_intel(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    if not settings.get("benchmarkOptIn"):
        return {"status": "success", "available": False, "reason": "opt_in_required"}
    industry = str(settings.get("industry") or "financial")
    try:
        from app.db.engine import db_session
        from app.db.models import DriftAggregate
        import json

        with db_session() as session:
            row = (
                session.query(DriftAggregate)
                .filter(DriftAggregate.industry == industry)
                .order_by(DriftAggregate.created_at.desc())
                .first()
            )
            if row is None:
                return {"status": "success", "available": False, "reason": "insufficient_cohort"}
            return {
                "status": "success",
                "available": True,
                "industry": industry,
                "patternType": row.pattern_type,
                "sampleSize": row.sample_size,
                "metrics": json.loads(row.metric_json or "{}"),
                "asOf": row.as_of,
            }
    except Exception:
        return {"status": "success", "available": False, "reason": "unavailable"}


@router.get("/oidc")
def tenant_oidc_get(auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.auth.oidc import get_oidc_config

    config = get_oidc_config(tenant_id=auth.tenant_id)
    return {"status": "success", "oidc": config}


@router.put("/oidc")
def tenant_oidc_put(body: OidcConfigRequest, auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.auth.oidc import upsert_oidc_config

    saved = upsert_oidc_config(
        tenant_id=auth.tenant_id,
        issuer_url=body.issuerUrl,
        client_id=body.clientId,
        client_secret=body.clientSecret,
        enabled=body.enabled,
    )
    log_action(tenant_id=auth.tenant_id, action="oidc.update")
    return {"status": "success", "oidc": saved}


@router.get("/compliance/posture")
def tenant_compliance_posture(
    scan_id: str = Query(...),
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    from app.compliance.posture import map_scan_to_frameworks

    bundle = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    report = bundle.get("report") or {}
    return {"status": "success", "frameworks": map_scan_to_frameworks(report=report)}


@router.get("/partner/children")
def tenant_partner_children(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.partner.service import list_child_tenants

    return {"status": "success", "children": list_child_tenants(parent_tenant_id=auth.tenant_id)}


@router.post("/partner/children")
def tenant_partner_link_child(
    body: dict[str, Any],
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    from app.partner.service import link_child_tenant

    child = link_child_tenant(
        parent_tenant_id=auth.tenant_id,
        child_tenant_id=str(body.get("childTenantId", "")),
        label=str(body.get("label", "")),
    )
    return {"status": "success", "child": child}


@router.get("/billing/portal")
def tenant_billing_portal(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    import os

    from app.billing.entitlements import tenant_entitlements
    from app.billing.service import create_billing_portal_session, stripe_configured
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantSubscription as SubscriptionRow

    if not stripe_configured():
        return {"status": "success", "configured": False, "portalUrl": None}
    customer_id = None
    if persistence_enabled():
        with db_session() as session:
            row = (
                session.query(SubscriptionRow)
                .filter(SubscriptionRow.tenant_id == auth.tenant_id)
                .one_or_none()
            )
            if row:
                customer_id = row.stripe_customer_id
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    if customer_id:
        session_result = create_billing_portal_session(
            customer_id=customer_id,
            return_url=f"{base}/dashboard",
        )
        if session_result.get("ok"):
            return {
                "status": "success",
                "configured": True,
                "portalUrl": session_result.get("portalUrl"),
                "entitlements": tenant_entitlements(tenant_id=auth.tenant_id),
            }
    return {
        "status": "success",
        "configured": True,
        "portalUrl": os.environ.get("QTANGL_STRIPE_PORTAL_URL"),
        "entitlements": tenant_entitlements(tenant_id=auth.tenant_id),
        "message": "Contact Qtangl to link Stripe customer for self-serve portal.",
    }


def _scan_lifecycle_state(job_status: str, has_bundle: bool, has_error: bool) -> str:
    if has_error or job_status == "error":
        return "failed"
    if has_bundle and job_status == "done":
        return "report_ready"
    if job_status in {"running", "queued"}:
        return "collecting"
    return "initialized"


@router.get("/evidence")
def tenant_evidence_vault(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.evidence.vault import vault_summary

    return {"status": "success", **vault_summary(tenant_id=auth.tenant_id)}


@router.post("/evidence/{scan_id}/retain")
def tenant_retain_evidence(scan_id: str, auth: AuthContext = Depends(require_auth)) -> dict:
    from app.evidence.vault import retain_scan_evidence
    from app.pqc.report import report_to_json
    from app.pqc.bundle_codec import bundle_from_api_dict

    payload = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    content_hash = ""
    if payload:
        bundle = bundle_from_api_dict(payload)
        report_json = report_to_json(bundle.report)
        content_hash = str((report_json.get("signature") or {}).get("contentHash") or "")
    result = retain_scan_evidence(
        tenant_id=auth.tenant_id,
        scan_id=scan_id,
        content_hash=content_hash,
    )
    log_action(tenant_id=auth.tenant_id, action="evidence.retain", resource_id=scan_id)
    return {"status": "success", **result}


@router.get("/integrations/cloud")
def tenant_cloud_integrations(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.integrations.cloud import list_cloud_integrations

    return {"status": "success", "integrations": list_cloud_integrations(tenant_id=auth.tenant_id)}


@router.post("/integrations/cloud/{provider}")
def tenant_upsert_cloud_integration(
    provider: str,
    body: CloudIntegrationRequest,
    auth: AuthContext = Depends(require_auth),
) -> dict:
    from app.integrations.cloud import upsert_cloud_integration
    from app.telemetry.events import track_event

    config = body.model_dump(exclude_none=True)
    try:
        row = upsert_cloud_integration(tenant_id=auth.tenant_id, provider=provider.lower(), config=config)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    track_event("integration_connected", tenant_id=auth.tenant_id, properties={"provider": provider})
    return {"status": "success", "integration": row}


@router.post("/integrations/cloud/{provider}/test")
def tenant_test_cloud_integration(provider: str, auth: AuthContext = Depends(require_auth)) -> dict:
    from app.integrations.cloud import test_cloud_connection

    return {"status": "success", **test_cloud_connection(tenant_id=auth.tenant_id, provider=provider.lower())}


@router.post("/integrations/keyfactor")
def tenant_upsert_keyfactor(body: KeyfactorIntegrationRequest, auth: AuthContext = Depends(require_auth)) -> dict:
    from app.integrations.service import upsert_integration

    integration = upsert_integration(
        tenant_id=auth.tenant_id,
        provider="keyfactor",
        config=body.model_dump(exclude_none=True),
    )
    return {"status": "success", "integration": integration}


@router.post("/integrations/keyfactor/test")
def tenant_test_keyfactor(auth: AuthContext = Depends(require_auth)) -> dict:
    from app.integrations.keyfactor import pull_keyfactor_inventory
    from app.integrations.pull import _load_integration_config

    config = _load_integration_config(tenant_id=auth.tenant_id, provider="keyfactor") or {}
    result = pull_keyfactor_inventory(
        base_url=str(config.get("baseUrl") or ""),
        api_token=str(config.get("apiToken") or ""),
        collection_id=str(config.get("collectionId") or ""),
    )
    ok = result.get("status") == "ok"
    return {"status": "success", "ok": ok, "previewCount": result.get("count", 0), "message": result.get("message")}


@router.post("/integrations/clm/{clm_provider}")
def tenant_upsert_clm(
    clm_provider: str,
    body: ClmIntegrationRequest,
    auth: AuthContext = Depends(require_auth),
) -> dict:
    from app.integrations.service import upsert_integration

    provider = f"clm-{clm_provider.lower()}"
    integration = upsert_integration(
        tenant_id=auth.tenant_id,
        provider=provider,
        config=body.model_dump(exclude_none=True),
    )
    return {"status": "success", "integration": integration}


@router.post("/integrations/clm/{clm_provider}/test")
def tenant_test_clm(clm_provider: str, auth: AuthContext = Depends(require_auth)) -> dict:
    from app.integrations.clm import pull_clm
    from app.integrations.pull import _load_integration_config

    provider = f"clm-{clm_provider.lower()}"
    config = _load_integration_config(tenant_id=auth.tenant_id, provider=provider) or {}
    result = pull_clm(clm_provider.lower(), **config)
    ok = result.get("status") in {"ok", "stub"}
    return {"status": "success", "ok": ok, "previewCount": result.get("count", 0), "message": result.get("message")}
