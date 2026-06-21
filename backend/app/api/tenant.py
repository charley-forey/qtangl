from __future__ import annotations

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse, Response, StreamingResponse

from app.audit.service import log_action
from app.auth import AuthContext, require_auth, require_auth_admin, require_auth_operator, require_auth_readonly, require_auth_write
from app.db.config import persistence_enabled, redis_enabled
import os
from app.billing.entitlements import (
    check_scan_quota,
    check_schedule_cadence,
    check_schedule_quota,
    scans_created_this_month,
    tenant_entitlements,
)
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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tenant", tags=["tenant"])


class ScheduleCreateRequest(BaseModel):
    scenarioId: str = Field(default="production-baseline")
    target: str | None = None
    cadenceHours: int = Field(default=168, ge=1, le=8760)
    notifyEmail: str | None = None
    cloudImportPayload: str | None = None
    jobType: str = Field(default="scan", pattern="^(scan|cloud_pull|host_fleet_scan|code_scan|binary_scan)$")
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


class TenantWorkspacePatchRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    timezone: str | None = Field(default=None, max_length=64)


class AuthorizedDomainsRequest(BaseModel):
    domains: list[str] = Field(default_factory=list, max_length=50)
    attestation: str = Field(min_length=10, max_length=4000)


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


class RemediationAutomateRequest(BaseModel):
    remediationId: str
    action: str = Field(pattern="^(acme|github_pr|venafi)$")
    domain: str | None = None
    repo: str | None = None
    branch: str | None = None
    title: str | None = None
    policyId: str | None = None


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


class TrackEventRequest(BaseModel):
    event: str = Field(min_length=1, max_length=128)
    properties: dict[str, Any] = Field(default_factory=dict)


def _first_scan_at(*, tenant_id: str) -> str | None:
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=500)
    done = [s for s in scans if s.get("status") == "done" and s.get("createdAt")]
    if not done:
        return None
    earliest = min(done, key=lambda s: str(s.get("createdAt")))
    return str(earliest.get("createdAt"))


def _tenant_scan_metrics(*, tenant_id: str) -> dict[str, Any]:
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=500)
    latest_done = next(
        (scan for scan in scans if scan.get("status") == "done" and scan.get("readinessScore") is not None),
        None,
    )
    latest_scan_at = latest_done.get("createdAt") if latest_done else None
    open_critical = _open_critical_count(
        tenant_id=tenant_id,
        scan_id=str(latest_done["scanId"]) if latest_done else None,
    )
    schedule_count = len(list_schedules(tenant_id=tenant_id)) if persistence_enabled() else 0
    return {
        "scanCount": len(scans),
        "scansThisMonth": _scans_this_month_count(tenant_id=tenant_id),
        "latestReadinessScore": latest_done.get("readinessScore") if latest_done else None,
        "latestReadinessBand": latest_done.get("readinessBand") if latest_done else None,
        "latestScanAt": latest_scan_at,
        "scheduleCount": schedule_count,
        "openCriticalCount": open_critical,
    }


def _scans_this_month_count(*, tenant_id: str) -> int:
    if persistence_enabled():
        return scans_created_this_month(tenant_id=tenant_id)
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return sum(
        1
        for scan in list_jobs_for_tenant(tenant_id=tenant_id, limit=500)
        if scan.get("createdAt")
        and datetime.fromisoformat(str(scan["createdAt"]).replace("Z", "+00:00")) >= month_start
    )


def _open_critical_count(*, tenant_id: str, scan_id: str | None) -> int:
    if not scan_id:
        return 0
    bundle = load_scan_bundle(scan_id, tenant_id=tenant_id)
    if not bundle:
        return 0
    backlog = bundle.get("remediationBacklog") or []
    statuses = {
        str(row.get("remediationId")): str(row.get("status", "open"))
        for row in list_remediation_status(tenant_id=tenant_id, scan_id=scan_id)
    }
    return sum(
        1
        for item in backlog
        if str(item.get("severity", "")).lower() == "critical"
        and statuses.get(str(item.get("id") or ""), "open") in {"open", "in_progress"}
    )


def _build_tenant_me_payload(*, auth: AuthContext) -> dict[str, Any]:
    from app.db.engine import db_session
    from app.db.models import Tenant

    auth_mode = "magic_link"
    tenant_name = auth.tenant_id
    if persistence_enabled():
        with db_session() as session:
            tenant = session.get(Tenant, auth.tenant_id)
            if tenant is not None:
                auth_mode = tenant.auth_mode
                tenant_name = tenant.name

    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "tenantName": tenant_name,
        "role": auth.role,
        "userId": auth.user_id,
        "email": auth.email,
        "authMethod": auth.auth_method,
        "authMode": auth_mode,
        "persistenceEnabled": persistence_enabled(),
        "schedulerEnabled": scheduler_enabled() and redis_enabled(),
        "entitlements": tenant_entitlements(tenant_id=auth.tenant_id),
        **_tenant_scan_metrics(tenant_id=auth.tenant_id),
    }


def _readiness_trend_points(*, tenant_id: str, limit: int = 30) -> list[dict[str, Any]]:
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=limit)
    points = [
        {
            "date": scan.get("createdAt"),
            "score": float(scan["readinessScore"]),
            "scanId": scan["scanId"],
            "band": scan.get("readinessBand"),
        }
        for scan in scans
        if scan.get("readinessScore") is not None and scan.get("status") == "done"
    ]
    points.reverse()
    return points


def _dashboard_kpis(*, tenant_id: str, metrics: dict[str, Any]) -> dict[str, Any]:
    entitlements = tenant_entitlements(tenant_id=tenant_id)
    max_scans = int(entitlements.get("maxScansPerMonth", 100))
    max_schedules = int(entitlements.get("maxSchedules", 10))
    trend = _readiness_trend_points(tenant_id=tenant_id)
    delta = None
    if len(trend) >= 2:
        delta = round(float(trend[-1]["score"]) - float(trend[-2]["score"]), 1)
    return {
        **metrics,
        "delta": delta,
        "scanQuota": {
            "used": metrics.get("scansThisMonth", 0),
            "limit": max_scans,
        },
        "scheduleQuota": {
            "used": metrics.get("scheduleCount", 0),
            "limit": max_schedules,
        },
        "tier": entitlements.get("tier"),
    }


def _dashboard_alerts(*, tenant_id: str) -> list[dict[str, Any]]:
    from app.monitoring.anomaly import detect_readiness_anomalies
    from app.store.tenant_alerts import list_alerts
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    read_ids = set(settings.get("notificationReadIds") or [])

    alerts: list[dict[str, Any]] = []

    for row in list_alerts(tenant_id=tenant_id, since_days=30):
        alert_id = str(row.get("id", ""))
        if alert_id in read_ids or row.get("readAt"):
            continue
        alerts.append(
            {
                "id": alert_id,
                "source": row.get("source", "persisted"),
                "type": row.get("rule", "alert"),
                "rule": row.get("rule"),
                "severity": row.get("severity", "info"),
                "message": row.get("message"),
                "actionUrl": row.get("actionUrl"),
                "firedAt": row.get("firedAt"),
            }
        )

    scores = [
        float(scan["readinessScore"])
        for scan in list_jobs_for_tenant(tenant_id=tenant_id, limit=50)
        if scan.get("readinessScore") is not None
    ]
    scores.reverse()
    for anomaly in detect_readiness_anomalies(scores=scores):
        key = f"anomaly-{anomaly.get('from')}-{anomaly.get('to')}"
        if key in read_ids:
            continue
        message = (
            f"Readiness dropped {abs(anomaly.get('delta', 0))} pts "
            f"({anomaly.get('from')} → {anomaly.get('to')})"
        )
        alerts.append(
            {
                "id": key,
                "source": "anomaly",
                "type": "readiness_drop",
                "message": message,
                "actionUrl": "/dashboard?tab=overview",
                **anomaly,
            }
        )

    scan_quota = check_scan_quota(tenant_id=tenant_id)
    if scan_quota:
        key = "quota-scan"
        if key not in read_ids:
            alerts.append(
                {
                    "id": key,
                    "source": "quota",
                    "type": "scan_quota",
                    "severity": "high",
                    "actionUrl": "/dashboard?upgrade=monitor",
                    **scan_quota,
                }
            )

    schedule_quota = check_schedule_quota(tenant_id=tenant_id)
    if schedule_quota:
        key = "quota-schedule"
        if key not in read_ids:
            alerts.append(
                {
                    "id": key,
                    "source": "quota",
                    "type": "schedule_quota",
                    "severity": "medium",
                    "actionUrl": "/dashboard?upgrade=monitor",
                    **schedule_quota,
                }
            )

    return alerts


def _schedules_summary(*, tenant_id: str) -> dict[str, Any]:
    schedules = list_schedules(tenant_id=tenant_id) if persistence_enabled() else []
    entitlements = tenant_entitlements(tenant_id=tenant_id)
    return {
        "count": len(schedules),
        "active": len(schedules),
        "schedulerEnabled": scheduler_enabled() and redis_enabled(),
        "nextRunAt": schedules[0].get("nextRunAt") if schedules else None,
        "quota": {
            "used": len(schedules),
            "limit": int(entitlements.get("maxSchedules", 10)),
        },
    }


def _dashboard_health(*, tenant_id: str, role: str = "operator") -> dict[str, Any]:
    from app.customer_success.health import compute_customer_health
    from app.tenant.settings import get_tenant_settings_raw

    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=100)
    terminal = [scan for scan in scans if scan.get("status") in {"done", "error"}]
    success = sum(1 for scan in terminal if scan.get("status") == "done")
    reliability = round((100.0 * success / len(terminal)), 1) if terminal else 100.0
    report_ready = sum(
        1
        for scan in terminal
        if scan.get("status") == "done" and scan.get("readinessScore") is not None
    )
    report_rate = round((100.0 * report_ready / len(terminal)), 1) if terminal else 100.0
    latest_done = next((scan for scan in scans if scan.get("status") == "done"), None)
    last_scan_at = None
    if latest_done:
        last_scan_at = latest_done.get("updatedAt") or latest_done.get("createdAt")
    metrics = _tenant_scan_metrics(tenant_id=tenant_id)
    schedules = list_schedules(tenant_id=tenant_id) if persistence_enabled() else []
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    velocity = _remediation_velocity_summary(tenant_id=tenant_id)
    cs_health = compute_customer_health(
        tenant_id=tenant_id,
        last_scan_at=last_scan_at,
        open_critical=int(metrics.get("openCriticalCount") or 0),
        schedule_active=len(schedules) > 0,
        has_scans=len(scans) > 0,
        remediation_velocity=velocity,
        role=role,
        settings=settings,
    )
    return {
        "scanSuccessRatePct": reliability,
        "reportAvailabilityPct": report_rate,
        "sampleSize": len(terminal),
        "lastScanAt": last_scan_at,
        "persistenceEnabled": persistence_enabled(),
        "schedulerEnabled": scheduler_enabled() and redis_enabled(),
        "score": cs_health["score"],
        "band": cs_health["band"],
        "signals": cs_health["signals"],
    }


def _recent_scan_summaries(*, tenant_id: str, limit: int = 10) -> list[dict[str, Any]]:
    return [
        {
            **scan,
            "reportAvailable": scan.get("status") == "done" and scan.get("readinessScore") is not None,
            "lifecycleState": _scan_lifecycle_state(
                str(scan.get("status", "")),
                scan.get("readinessScore") is not None,
                bool(scan.get("error")),
            ),
        }
        for scan in list_jobs_for_tenant(tenant_id=tenant_id, limit=limit)
    ]


async def _dashboard_events_generator(*, tenant_id: str):
    seen: dict[str, str] = {}
    seen_alert_count = 0

    def _progress_pct(status: str) -> int:
        return {"queued": 10, "running": 55, "done": 100, "error": 100}.get(status, 0)

    while True:
        for scan in list_jobs_for_tenant(tenant_id=tenant_id, limit=25):
            scan_id = str(scan.get("scanId", ""))
            job_status = str(scan.get("status", ""))
            previous = seen.get(scan_id)
            if previous is None:
                seen[scan_id] = job_status
                if job_status in {"queued", "running"}:
                    payload = {
                        "scanId": scan_id,
                        "status": job_status,
                        "progressPct": _progress_pct(job_status),
                        "targetDomain": scan.get("targetDomain"),
                        "updatedAt": scan.get("updatedAt"),
                    }
                    yield f"event: scan\ndata: {json.dumps(payload)}\n\n"
            elif previous != job_status:
                seen[scan_id] = job_status
                payload = {
                    "scanId": scan_id,
                    "status": job_status,
                    "previousStatus": previous,
                    "progressPct": _progress_pct(job_status),
                    "targetDomain": scan.get("targetDomain"),
                    "readinessScore": scan.get("readinessScore"),
                    "readinessBand": scan.get("readinessBand"),
                    "updatedAt": scan.get("updatedAt"),
                }
                yield f"event: scan\ndata: {json.dumps(payload)}\n\n"

        try:
            from app.store.tenant_alerts import list_alerts

            alerts = list_alerts(tenant_id=tenant_id, since_days=7, unread_only=True)
            if len(alerts) != seen_alert_count:
                seen_alert_count = len(alerts)
                alert_payload = {"count": len(alerts), "latest": alerts[0] if alerts else None}
                yield f"event: alert\ndata: {json.dumps(alert_payload)}\n\n"
        except Exception:
            pass

        heartbeat = {"ts": datetime.now(timezone.utc).isoformat(), "tenantId": tenant_id}
        yield f"event: heartbeat\ndata: {json.dumps(heartbeat)}\n\n"
        await asyncio.sleep(30)


@router.get("/me")
def tenant_me(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return _build_tenant_me_payload(auth=auth)


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
def tenant_delete_scan(scan_id: str, auth: AuthContext = Depends(require_auth_write)) -> dict:
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
        try:
            from app.coaching.milestones import record_milestone

            record_milestone(tenant_id=auth.tenant_id, name="firstBoardExportAt")
        except Exception:
            pass
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
    from app.tenant.settings import get_tenant_settings_raw

    branding = get_tenant_settings_raw(tenant_id=auth.tenant_id).get("reportBranding") or {}
    content = report_to_pdf(report_for_pdf, branding=branding if isinstance(branding, dict) else None)
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
    cadence_error = check_schedule_cadence(tenant_id=auth.tenant_id, cadence_hours=body.cadenceHours)
    if cadence_error:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=cadence_error)
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
    try:
        from app.coaching.milestones import record_milestone

        record_milestone(tenant_id=auth.tenant_id, name="firstScheduleAt")
    except Exception:
        pass
    return {"status": "success", "schedule": schedule}


@router.patch("/schedules/{schedule_id}")
def tenant_patch_schedule(
    schedule_id: str,
    body: SchedulePatchRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    if body.cadenceHours is not None:
        cadence_error = check_schedule_cadence(tenant_id=auth.tenant_id, cadence_hours=body.cadenceHours)
        if cadence_error:
            raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=cadence_error)
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


@router.patch("/workspace")
def tenant_workspace_patch(
    body: TenantWorkspacePatchRequest,
    auth: AuthContext = Depends(require_auth_admin),
) -> dict:
    from app.db.engine import db_session
    from app.db.models import Tenant

    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable.")
    name = body.name.strip()
    with db_session() as session:
        tenant = session.get(Tenant, auth.tenant_id)
        if tenant is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found.")
        tenant.name = name
    if body.timezone:
        from app.tenant.settings import get_tenant_settings_raw, upsert_tenant_settings

        current = get_tenant_settings_raw(tenant_id=auth.tenant_id)
        current["timezone"] = body.timezone.strip()
        upsert_tenant_settings(tenant_id=auth.tenant_id, settings=current)
    log_action(tenant_id=auth.tenant_id, action="workspace.rename", detail={"name": name, "timezone": body.timezone})
    return {"status": "success", "tenantId": auth.tenant_id, "tenantName": name, "timezone": body.timezone}


@router.get("/authorized-domains")
def tenant_authorized_domains_get(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.tenant.settings import get_tenant_scan_allowlist

    domains = get_tenant_scan_allowlist(tenant_id=auth.tenant_id)
    return {"status": "success", "domains": domains, "tenantId": auth.tenant_id}


@router.post("/authorized-domains")
def tenant_authorized_domains_post(
    body: AuthorizedDomainsRequest,
    auth: AuthContext = Depends(require_auth_admin),
) -> dict:
    from app.tenant.settings import set_tenant_scan_allowlist

    domains = set_tenant_scan_allowlist(tenant_id=auth.tenant_id, domains=body.domains)
    log_action(
        tenant_id=auth.tenant_id,
        action="authorized_domains.update",
        actor=auth.role,
        detail={"domains": domains, "attestation": body.attestation[:500]},
    )
    return {"status": "success", "domains": domains, "tenantId": auth.tenant_id}


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


@router.post("/scans/{scan_id}/remediation/automate")
def tenant_remediation_automate(
    scan_id: str,
    body: RemediationAutomateRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    from app.billing.entitlements import check_convert_feature
    from app.remediation.automation import open_hybrid_tls_pr, request_acme_reissue, venafi_policy_check

    tier_error = check_convert_feature(tenant_id=auth.tenant_id)
    if tier_error:
        from app.telemetry.events import track_event

        track_event("tier_upgrade_clicked", tenant_id=auth.tenant_id, properties=tier_error)
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=tier_error)

    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    backlog = bundle_dict.get("remediationBacklog") or []
    item = next((row for row in backlog if row.get("id") == body.remediationId), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Remediation item not found.")

    report = bundle_dict.get("report") or {}
    if body.action == "acme":
        domain = body.domain or report.get("targetDomain") or str(item.get("asset_id") or item.get("assetId") or "example.com")
        result = request_acme_reissue(domain=domain, pqc_preferred=True)
    elif body.action == "github_pr":
        repo = body.repo or os.environ.get("QTANGL_REMEDIATION_GITHUB_REPO", "")
        if not repo:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="repo required (body.repo or QTANGL_REMEDIATION_GITHUB_REPO).",
            )
        result = open_hybrid_tls_pr(
            repo=repo,
            branch=body.branch or f"qtangl/remediation-{body.remediationId[:8]}",
            title=body.title or f"Hybrid TLS: {item.get('title', body.remediationId)}",
        )
    else:
        policy_id = body.policyId or str(item.get("id") or body.remediationId)
        result = venafi_policy_check(policy_id=policy_id)

    log_action(
        tenant_id=auth.tenant_id,
        action="remediation.automate",
        resource_id=body.remediationId,
        detail={"action": body.action, "status": result.get("status")},
    )
    payload = {"status": "success", "scanId": scan_id, "remediationId": body.remediationId, "result": result}
    return JSONResponse(
        content=payload,
        headers={
            "Deprecation": "true",
            "Link": '</docs/reference/crypto-flip-api>; rel="successor-version"',
            "Sunset": "Sat, 07 Sep 2026 00:00:00 GMT",
        },
    )


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
def tenant_delete_schedule(schedule_id: str, auth: AuthContext = Depends(require_auth_write)) -> dict:
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
def tenant_revoke_share(link_id: str, auth: AuthContext = Depends(require_auth_write)) -> dict:
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
    from app.remediation.playbooks import playbook_for_item

    playbooks = {str(item.get("id", idx)): playbook_for_item(item) for idx, item in enumerate(backlog[:50])}
    return {"status": "success", "scanId": scan_id, "plans": plans, "playbooks": playbooks}


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
    program_velocity_data: dict[str, object] = {}
    program_items: list[dict] = []
    try:
        from app.remediation.program import list_program_items, program_velocity as program_vel

        program_items, _ = list_program_items(tenant_id=auth.tenant_id, limit=500)
        program_velocity_data = program_vel(tenant_id=auth.tenant_id)
    except Exception:
        pass
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
        "remediationProgramItems": program_items,
        "remediationProgramVelocity": program_velocity_data,
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

    if body.get("scanId"):
        from app.recommendations.service import explain_scan_brief

        return explain_scan_brief(
            tenant_id=auth.tenant_id,
            scan_id=str(body["scanId"]),
            persona=str(body.get("persona") or "executive"),
        )

    finding = body.get("finding") or {}
    return {"status": "success", **explain_finding(finding=finding, context=str(body.get("context", "")))}


@router.post("/ai/explain-scan")
def tenant_ai_explain_scan(body: dict[str, Any], auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.recommendations.service import explain_scan_brief

    scan_id = str(body.get("scanId") or "")
    if not scan_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="scanId required")
    return explain_scan_brief(
        tenant_id=auth.tenant_id,
        scan_id=scan_id,
        persona=str(body.get("persona") or "executive"),
    )


@router.post("/ai/explain-portfolio")
def tenant_ai_explain_portfolio(body: dict[str, Any], auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.recommendations.service import explain_portfolio_brief

    return explain_portfolio_brief(
        tenant_id=auth.tenant_id,
        persona=str(body.get("persona") or "executive"),
        prompt=str(body.get("prompt") or body.get("question") or "") or None,
    )


@router.get("/dashboard/recommendations")
def tenant_dashboard_recommendations(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.recommendations.service import build_recommendations

    role = str(auth.role or "operator")
    recs = build_recommendations(tenant_id=auth.tenant_id, role=role)
    return {"status": "success", "recommendations": recs}


@router.post("/recommendations/{recommendation_id}/dismiss")
def tenant_dismiss_recommendation(
    recommendation_id: str,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    from app.recommendations.service import dismiss_recommendation

    dismiss_recommendation(tenant_id=auth.tenant_id, recommendation_id=recommendation_id)
    return {"status": "success", "dismissed": recommendation_id}


@router.patch("/alerts/{alert_id}/read")
def tenant_mark_alert_read(alert_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.store.tenant_alerts import mark_alert_read
    from app.tenant.settings import get_tenant_settings_raw, upsert_tenant_settings

    ok = mark_alert_read(tenant_id=auth.tenant_id, alert_id=alert_id)
    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    read_ids = list(settings.get("notificationReadIds") or [])
    if alert_id not in read_ids:
        read_ids.append(alert_id)
    upsert_tenant_settings(tenant_id=auth.tenant_id, settings={"notificationReadIds": read_ids[-200:]})
    return {"status": "success", "read": ok, "alertId": alert_id}


@router.post("/alerts/read-all")
def tenant_mark_all_alerts_read(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.store.tenant_alerts import mark_all_alerts_read

    count = mark_all_alerts_read(tenant_id=auth.tenant_id)
    alerts = _dashboard_alerts(tenant_id=auth.tenant_id)
    read_ids = [str(a.get("id", "")) for a in alerts if a.get("id")]
    from app.tenant.settings import get_tenant_settings_raw, upsert_tenant_settings

    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    merged = list(settings.get("notificationReadIds") or []) + read_ids
    upsert_tenant_settings(tenant_id=auth.tenant_id, settings={"notificationReadIds": list(dict.fromkeys(merged))[-200:]})
    return {"status": "success", "marked": count}


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


@router.get("/analytics/readiness-trend")
def tenant_readiness_trend(
    auth: AuthContext = Depends(require_auth_readonly),
    limit: int = Query(default=30, ge=1, le=100),
) -> dict:
    points = _readiness_trend_points(tenant_id=auth.tenant_id, limit=limit)
    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "count": len(points),
        "points": points,
    }


@router.post("/analytics/track")
def tenant_track_event(body: TrackEventRequest, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.telemetry.events import is_allowed_event, track_event

    if not is_allowed_event(body.event):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown analytics event")
    track_event(body.event, tenant_id=auth.tenant_id, properties=body.properties)
    return {"status": "success", "event": body.event}


def _remediation_velocity_summary(*, tenant_id: str) -> dict[str, Any]:
    from app.remediation.service import remediation_velocity

    return remediation_velocity(tenant_id=tenant_id)


def _slo_metrics_summary(*, tenant_id: str) -> dict[str, Any]:
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=100)
    terminal = [scan for scan in scans if scan.get("status") in {"done", "error"}]
    success = sum(1 for scan in terminal if scan.get("status") == "done")
    reliability = round((100.0 * success / len(terminal)), 1) if terminal else 100.0
    report_ready = sum(1 for scan in terminal if scan.get("reportAvailable"))
    report_rate = round((100.0 * report_ready / len(terminal)), 1) if terminal else 100.0
    return {
        "scanSuccessRatePct": reliability,
        "reportAvailabilityPct": report_rate,
        "sampleSize": len(terminal),
        "targetSloPct": 99.0,
    }


def _integrations_summary(*, tenant_id: str) -> dict[str, Any]:
    from app.integrations.service import list_integrations

    rows = list_integrations(tenant_id=tenant_id)
    configured = {str(r.get("provider", "")).lower(): bool(r.get("configured")) for r in rows}
    settings = {}
    try:
        from app.tenant.settings import get_tenant_settings_raw

        settings = get_tenant_settings_raw(tenant_id=tenant_id)
    except Exception:
        pass
    return {
        "jiraConfigured": configured.get("jira", False),
        "webhookConfigured": bool(settings.get("webhookSigningSecret")),
        "providers": rows,
    }


def _layout_defaults(*, tenant_id: str) -> dict[str, Any]:
    from app.billing.entitlements import tenant_entitlements
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    layout = settings.get("dashboardLayout") or {}
    tier = str(tenant_entitlements(tenant_id=tenant_id).get("tier") or "free")
    hidden = list(layout.get("hidden") or [])
    if tier == "free" and "heatmap" not in hidden:
        hidden = [*hidden, "heatmap"]
    return {
        "persona": layout.get("persona") or "operator",
        "pinned": layout.get("pinned") or ["kpi", "trend", "digest"],
        "hidden": hidden,
        "tier": tier,
    }


def _forecast_summary(*, tenant_id: str) -> dict[str, Any]:
    from app.monitoring.anomaly import forecast_readiness

    scores = [
        float(scan["readinessScore"])
        for scan in list_jobs_for_tenant(tenant_id=tenant_id, limit=50)
        if scan.get("readinessScore") is not None
    ]
    scores.reverse()
    return forecast_readiness(scores=scores)


def _latest_scan_detail(*, tenant_id: str) -> dict[str, Any] | None:
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=20)
    latest_done = next((s for s in scans if s.get("status") == "done"), None)
    if not latest_done:
        return None
    scan_id = str(latest_done["scanId"])
    bundle = load_scan_bundle(scan_id, tenant_id=tenant_id)
    if not bundle:
        return {"scanId": scan_id, "readinessScore": latest_done.get("readinessScore")}
    report = bundle.get("report") or {}
    backlog = report.get("remediationBacklog") or []
    critical = [
        {"id": i.get("id"), "title": i.get("title"), "severity": i.get("severity")}
        for i in backlog
        if str(i.get("severity", "")).lower() == "critical"
    ][:10]
    return {
        "scanId": scan_id,
        "readinessScore": report.get("readinessScore") or latest_done.get("readinessScore"),
        "readinessBand": report.get("readinessBand") or latest_done.get("readinessBand"),
        "scanDiff": report.get("scanDiff"),
        "complianceSummary": report.get("complianceSummary"),
        "compliancePack": report.get("compliancePack"),
        "openCriticalItems": critical,
    }


@router.get("/dashboard/summary")
def tenant_dashboard_summary(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.coaching.milestones import get_milestones
    from app.partner.service import list_child_tenants
    from app.portfolio.service import portfolio_command_center, weekly_executive_digest
    from app.recommendations.maturity import compute_maturity_stage
    from app.recommendations.service import build_recommendations
    from app.tenant.settings import get_tenant_settings_raw

    started = time.perf_counter()
    metrics = _tenant_scan_metrics(tenant_id=auth.tenant_id)
    role = str(auth.role or "operator")
    recommendations = build_recommendations(tenant_id=auth.tenant_id, role=role)
    maturity = compute_maturity_stage(tenant_id=auth.tenant_id)
    settings_raw = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    coaching_settings = settings_raw.get("coaching") or {}
    partner_children = list_child_tenants(parent_tenant_id=auth.tenant_id)
    payload = {
        "status": "success",
        "tenantId": auth.tenant_id,
        "me": _build_tenant_me_payload(auth=auth),
        "kpis": _dashboard_kpis(tenant_id=auth.tenant_id, metrics=metrics),
        "trend": _readiness_trend_points(tenant_id=auth.tenant_id, limit=30),
        "digest": weekly_executive_digest(tenant_id=auth.tenant_id),
        "commandCenter": portfolio_command_center(tenant_id=auth.tenant_id),
        "alerts": _dashboard_alerts(tenant_id=auth.tenant_id),
        "recommendations": recommendations,
        "maturity": maturity,
        "recentScans": _recent_scan_summaries(tenant_id=auth.tenant_id, limit=10),
        "schedulesSummary": _schedules_summary(tenant_id=auth.tenant_id),
        "health": _dashboard_health(tenant_id=auth.tenant_id, role=role),
        "firstScanAt": _first_scan_at(tenant_id=auth.tenant_id),
        "latestScanDetail": _latest_scan_detail(tenant_id=auth.tenant_id),
        "forecast": _forecast_summary(tenant_id=auth.tenant_id),
        "remediationVelocity": _remediation_velocity_summary(tenant_id=auth.tenant_id),
        "sloMetrics": _slo_metrics_summary(tenant_id=auth.tenant_id),
        "integrationsSummary": _integrations_summary(tenant_id=auth.tenant_id),
        "layoutDefaults": _layout_defaults(tenant_id=auth.tenant_id),
        "membershipHealth": _membership_health_for_tenant(tenant_id=auth.tenant_id),
        "portfolioSummary": {"childrenCount": len(partner_children)},
        "coaching": {
            "phase": coaching_settings.get("phase", "first_run"),
            "milestones": get_milestones(tenant_id=auth.tenant_id),
            "bannersDismissed": coaching_settings.get("bannersDismissed") or [],
        },
    }
    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info("dashboard.summary tenant=%s duration_ms=%.1f", auth.tenant_id, elapsed_ms)
    threshold = float(os.environ.get("QTANGL_DASHBOARD_SUMMARY_WARN_MS", "800"))
    if elapsed_ms > threshold:
        logger.warning(
            "dashboard.summary slow tenant=%s duration_ms=%.1f threshold_ms=%.0f",
            auth.tenant_id,
            elapsed_ms,
            threshold,
        )
    return payload


def _membership_health_for_tenant(*, tenant_id: str) -> list[dict[str, Any]]:
    from app.partner.service import list_child_tenants

    children = list_child_tenants(parent_tenant_id=tenant_id)
    if not children:
        metrics = _tenant_scan_metrics(tenant_id=tenant_id)
        return [
            {
                "tenantId": tenant_id,
                "latestReadinessScore": metrics.get("latestReadinessScore"),
                "latestReadinessBand": metrics.get("latestReadinessBand"),
            }
        ]
    health: list[dict[str, Any]] = []
    for child in children:
        child_id = str(child.get("childTenantId", ""))
        if not child_id:
            continue
        metrics = _tenant_scan_metrics(tenant_id=child_id)
        health.append(
            {
                "tenantId": child_id,
                "tenantName": child.get("childTenantName") or child_id,
                "latestReadinessScore": metrics.get("latestReadinessScore"),
                "latestReadinessBand": metrics.get("latestReadinessBand"),
            }
        )
    return health


def _dashboard_tab_scans(*, tenant_id: str) -> dict[str, Any]:
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=100)
    detail = _latest_scan_detail(tenant_id=tenant_id)
    return {"scans": scans, "latestScanDetail": detail}


def _dashboard_tab_monitor(*, tenant_id: str) -> dict[str, Any]:
    schedules = list_schedules(tenant_id=tenant_id) if persistence_enabled() else []
    cbom: dict[str, Any] = {}
    try:
        from app.cbom.service import aggregate_cbom

        cbom = aggregate_cbom(tenant_id=tenant_id) or {}
    except Exception:
        cbom = {}
    return {
        "schedules": schedules,
        "schedulesSummary": _schedules_summary(tenant_id=tenant_id),
        "integrationsSummary": _integrations_summary(tenant_id=tenant_id),
        "cbomAggregate": cbom.get("aggregate"),
        "commandCenter": __import__("app.portfolio.service", fromlist=["portfolio_command_center"]).portfolio_command_center(
            tenant_id=tenant_id
        ),
    }


def _dashboard_tab_remediate(*, tenant_id: str, scan_id: str | None = None) -> dict[str, Any]:
    detail = _latest_scan_detail(tenant_id=tenant_id)
    target_scan_id = scan_id
    if not target_scan_id and detail and detail.get("scanId"):
        target_scan_id = str(detail["scanId"])
    remediation_scan = None
    if target_scan_id:
        bundle = load_scan_bundle(target_scan_id, tenant_id=tenant_id)
        backlog = (bundle or {}).get("report", {}).get("remediationBacklog") or []
        statuses = list_remediation_status(tenant_id=tenant_id, scan_id=target_scan_id)
        remediation_scan = {
            "scanId": target_scan_id,
            "items": backlog[:20],
            "statuses": statuses,
        }
    return {
        "remediationScan": remediation_scan,
        "remediationVelocity": _remediation_velocity_summary(tenant_id=tenant_id),
        "sloMetrics": _slo_metrics_summary(tenant_id=tenant_id),
    }


def _dashboard_tab_settings(*, tenant_id: str) -> dict[str, Any]:
    from app.tenant.settings import get_tenant_settings

    return {
        "settings": get_tenant_settings(tenant_id=tenant_id),
        "layoutDefaults": _layout_defaults(tenant_id=tenant_id),
        "billingPortalConfigured": False,
    }


def _dashboard_tab_portfolio(*, tenant_id: str) -> dict[str, Any]:
    from datetime import datetime, timezone

    from app.partner.service import list_child_tenants
    from app.portfolio.service import readiness_rollup
    from app.store.tenant_alerts import list_alerts

    children = list_child_tenants(parent_tenant_id=tenant_id)
    child_summaries = []
    below_threshold = 0
    scores: list[float] = []
    total_open_alerts = 0
    now = datetime.now(timezone.utc)
    for child in children:
        child_id = str(child.get("childTenantId", ""))
        if not child_id:
            continue
        metrics = _tenant_scan_metrics(tenant_id=child_id)
        score = metrics.get("latestReadinessScore")
        band = metrics.get("latestReadinessBand") or ""
        open_alerts = len(list_alerts(tenant_id=child_id, since_days=90, include_resolved=False))
        total_open_alerts += open_alerts
        if score is not None:
            scores.append(float(score))
            if float(score) < 70 or str(band).lower() in {"lagging", "critical", "high-risk"}:
                below_threshold += 1
        last_scan_at = metrics.get("latestScanAt")
        last_scan_age_days: int | None = None
        if last_scan_at:
            try:
                parsed = datetime.fromisoformat(str(last_scan_at).replace("Z", "+00:00"))
                last_scan_age_days = max(0, (now - parsed).days)
            except Exception:
                last_scan_age_days = None
        velocity = _remediation_velocity_summary(tenant_id=child_id)
        from app.monitoring.service import list_schedules

        active_schedules = len(list_schedules(tenant_id=child_id)) if persistence_enabled() else 0
        child_summaries.append(
            {
                **child,
                "latestReadiness": score,
                "latestBand": band,
                "openCritical": metrics.get("openCriticalCount", 0),
                "openAlerts": open_alerts,
                "lastScanAt": last_scan_at,
                "lastScanAgeDays": last_scan_age_days,
                "remediationVelocityPct": velocity.get("completionRatePct"),
                "activeSchedules": active_schedules,
            }
        )
    rollup = readiness_rollup(tenant_id=tenant_id)
    return {
        "children": child_summaries,
        "rollup": rollup,
        "aggregateReadiness": round(sum(scores) / len(scores), 1) if scores else 0,
        "customersBelowThreshold": below_threshold,
        "atRiskCount": below_threshold,
        "totalOpenAlerts": total_open_alerts,
    }


@router.get("/dashboard/tab/{tab_name}")
def tenant_dashboard_tab(
    tab_name: str,
    scan_id: str | None = None,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    builders = {
        "scans": _dashboard_tab_scans,
        "monitor": _dashboard_tab_monitor,
        "remediate": lambda tenant_id: _dashboard_tab_remediate(tenant_id=tenant_id, scan_id=scan_id),
        "settings": _dashboard_tab_settings,
        "portfolio": _dashboard_tab_portfolio,
    }
    builder = builders.get(tab_name.lower())
    if builder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown dashboard tab.")
    return {"status": "success", "tab": tab_name, "data": builder(tenant_id=auth.tenant_id)}


@router.get("/partner/portfolio-summary")
def tenant_partner_portfolio_summary(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {"status": "success", **(_dashboard_tab_portfolio(tenant_id=auth.tenant_id))}


class DigestPreviewRequest(BaseModel):
    recipients: list[str] = Field(default_factory=list)


@router.post("/dashboard/digest/preview")
def tenant_dashboard_digest_preview(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.notifications.digest_email import build_weekly_digest_html
    from app.portfolio.service import weekly_executive_digest

    digest = weekly_executive_digest(tenant_id=auth.tenant_id)
    children = _dashboard_tab_portfolio(tenant_id=auth.tenant_id).get("children", [])
    html = build_weekly_digest_html(
        tenant_id=auth.tenant_id,
        digest=digest,
        child_summaries=children if len(children) > 1 else [],
    )
    return {"status": "success", "digest": digest, "html": html}


@router.post("/dashboard/digest/send-test")
def tenant_dashboard_digest_send_test(
    body: DigestPreviewRequest,
    auth: AuthContext = Depends(require_auth_admin),
) -> dict:
    from app.notifications.digest_email import send_weekly_digest_email
    from app.portfolio.service import weekly_executive_digest

    digest = weekly_executive_digest(tenant_id=auth.tenant_id)
    children = _dashboard_tab_portfolio(tenant_id=auth.tenant_id).get("children", [])
    results = []
    for recipient in body.recipients[:5]:
        results.append(
            send_weekly_digest_email(
                to_email=recipient,
                tenant_id=auth.tenant_id,
                digest=digest,
                child_summaries=children if len(children) > 1 else [],
            )
        )
    return {"status": "success", "results": results}


class BulkExportRequest(BaseModel):
    scanIds: list[str] = Field(default_factory=list)


@router.post("/scans/bulk-export")
def tenant_scans_bulk_export(
    body: BulkExportRequest,
    auth: AuthContext = Depends(require_auth_readonly),
) -> Response:
    import zipfile
    from io import BytesIO

    if not body.scanIds:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="scanIds required.")
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for scan_id in body.scanIds[:25]:
            bundle = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
            if not bundle:
                continue
            archive.writestr(f"{scan_id}/bundle.json", json.dumps(bundle))
    buffer.seek(0)
    return Response(
        content=buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="qtangl-evidence-bundles.zip"'},
    )


@router.get("/dashboard/events")
async def tenant_dashboard_events(auth: AuthContext = Depends(require_auth_readonly)) -> StreamingResponse:
    return StreamingResponse(
        _dashboard_events_generator(tenant_id=auth.tenant_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


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
    from app.auth_oidc import get_oidc_config

    config = get_oidc_config(tenant_id=auth.tenant_id)
    return {"status": "success", "oidc": config}


@router.put("/oidc")
def tenant_oidc_put(body: OidcConfigRequest, auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.auth_oidc import upsert_oidc_config

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
    posture = map_scan_to_frameworks(report=report)
    frameworks = [
        {
            "name": name.replace("-", " ").upper(),
            "status": "mapped" if values.get("coveragePct", 0) >= 70 else "gap",
            "coveragePct": values.get("coveragePct"),
        }
        for name, values in posture.items()
    ]
    return {"status": "success", "frameworks": frameworks, "posture": posture}


@router.get("/partner/children")
def tenant_partner_children(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.partner.service import list_child_tenants

    return {"status": "success", "children": list_child_tenants(parent_tenant_id=auth.tenant_id)}


@router.post("/partner/children")
def tenant_partner_link_child(
    body: dict[str, Any],
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    from app.billing.entitlements import tenant_entitlements
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import Tenant as TenantRow
    from app.partner.service import link_child_tenant

    child_tenant_id = str(body.get("childTenantId", "")).strip()
    if not child_tenant_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="childTenantId required.")
    if child_tenant_id == auth.tenant_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Cannot link tenant to itself.")

    tier = str(tenant_entitlements(tenant_id=auth.tenant_id).get("tier", ""))
    if tier not in {"enterprise", "convert"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner child linking requires enterprise or convert tier.",
        )

    if persistence_enabled():
        with db_session() as session:
            child = session.get(TenantRow, child_tenant_id)
            if child is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child tenant not found.")

    child = link_child_tenant(
        parent_tenant_id=auth.tenant_id,
        child_tenant_id=child_tenant_id,
        label=str(body.get("label", "")),
    )
    log_action(
        tenant_id=auth.tenant_id,
        action="partner.child_linked",
        resource_id=child_tenant_id,
        detail={"label": body.get("label", "")},
    )
    return {"status": "success", "child": child}


class BillingCheckoutBody(BaseModel):
    product: str = Field(pattern="^(assess|monitor)$")
    successUrl: str | None = None
    cancelUrl: str | None = None


class OnboardingPatchBody(BaseModel):
    step: str | None = None
    dismissed: bool | None = None
    complete: bool | None = None
    toursCompleted: list[str] | None = None


class LegalAcceptBody(BaseModel):
    termsVersion: str = Field(min_length=4, max_length=32)
    scanAuthorization: bool | None = None
    domain: str | None = None


@router.patch("/onboarding")
def tenant_patch_onboarding(
    body: OnboardingPatchBody,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    from app.tenant.settings import patch_tenant_onboarding_state

    patch: dict = {}
    if body.step is not None:
        patch["step"] = body.step
    if body.dismissed is not None:
        patch["dismissed"] = body.dismissed
    if body.complete is not None:
        patch["complete"] = body.complete
    if body.toursCompleted is not None:
        patch["toursCompleted"] = body.toursCompleted
    state = patch_tenant_onboarding_state(tenant_id=auth.tenant_id, patch=patch)
    return {"status": "success", "onboarding": state}


@router.post("/legal/accept")
def tenant_legal_accept(
    body: LegalAcceptBody,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    from datetime import datetime, timezone

    from app.audit.service import log_action
    from app.tenant.settings import patch_tenant_billing_flags

    now = datetime.now(timezone.utc).isoformat()
    billing_patch: dict = {
        "termsAcceptedAt": now,
        "termsVersion": body.termsVersion,
    }
    if body.scanAuthorization:
        billing_patch["scanAuthorizationAt"] = now
        billing_patch["scanAuthorizedBy"] = auth.user_id or auth.email
        if body.domain:
            billing_patch["scanAuthorizedDomain"] = body.domain.strip()
    flags = patch_tenant_billing_flags(tenant_id=auth.tenant_id, patch=billing_patch)
    log_action(
        tenant_id=auth.tenant_id,
        action="legal.accepted",
        actor=auth.email or auth.role,
        detail={"termsVersion": body.termsVersion, "scanAuthorization": bool(body.scanAuthorization)},
    )
    return {"status": "success", "billing": flags}


@router.post("/billing/checkout")
def tenant_billing_checkout(
    body: BillingCheckoutBody,
    auth: AuthContext = Depends(require_auth_admin),
) -> dict:
    import os

    from app.billing.service import create_tenant_checkout_session, stripe_configured
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantSubscription as SubscriptionRow

    if not stripe_configured():
        return {"status": "error", "code": "stripe_unconfigured", "message": "Stripe is not configured."}

    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com").rstrip("/")
    success = body.successUrl or f"{base}/dashboard?checkout={body.product}&session=refresh"
    cancel = body.cancelUrl or f"{base}/dashboard?checkout=cancelled"

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

    result = create_tenant_checkout_session(
        tenant_id=auth.tenant_id,
        email=auth.email or "",
        product=body.product,
        success_url=success,
        cancel_url=cancel,
        stripe_customer_id=customer_id,
    )
    if not result.get("ok"):
        return {"status": "error", "code": result.get("reason", "checkout_failed")}
    return {
        "status": "success",
        "checkoutUrl": result.get("checkoutUrl"),
        "sessionId": result.get("sessionId"),
    }


@router.get("/billing/portal")
@router.post("/billing/portal")
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
def tenant_retain_evidence(scan_id: str, auth: AuthContext = Depends(require_auth_write)) -> dict:
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
def tenant_test_cloud_integration(provider: str, auth: AuthContext = Depends(require_auth_operator)) -> dict:
    from app.integrations.cloud import test_cloud_connection

    return {"status": "success", **test_cloud_connection(tenant_id=auth.tenant_id, provider=provider.lower())}


@router.post("/integrations/keyfactor")
def tenant_upsert_keyfactor(body: KeyfactorIntegrationRequest, auth: AuthContext = Depends(require_auth_operator)) -> dict:
    from app.integrations.service import upsert_integration

    integration = upsert_integration(
        tenant_id=auth.tenant_id,
        provider="keyfactor",
        config=body.model_dump(exclude_none=True),
    )
    return {"status": "success", "integration": integration}


@router.post("/integrations/keyfactor/test")
def tenant_test_keyfactor(auth: AuthContext = Depends(require_auth_operator)) -> dict:
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
def tenant_test_clm(clm_provider: str, auth: AuthContext = Depends(require_auth_operator)) -> dict:
    from app.integrations.clm import pull_clm
    from app.integrations.pull import _load_integration_config

    provider = f"clm-{clm_provider.lower()}"
    config = _load_integration_config(tenant_id=auth.tenant_id, provider=provider) or {}
    result = pull_clm(clm_provider.lower(), **config)
    ok = result.get("status") in {"ok", "stub"}
    return {"status": "success", "ok": ok, "previewCount": result.get("count", 0), "message": result.get("message")}


class ApiKeyCreateRequest(BaseModel):
    label: str = Field(default="automation", max_length=64)
    role: str = Field(default="operator", pattern="^(admin|operator|executive|viewer)$")


class TeamInviteRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    role: str = Field(default="operator", pattern="^(admin|operator|executive|viewer)$")


class MemberRoleUpdate(BaseModel):
    role: str = Field(pattern="^(admin|operator|executive|viewer)$")


class SsoPortalRequest(BaseModel):
    returnUrl: str = Field(min_length=8, max_length=2048)

    returnUrl: str = Field(min_length=8, max_length=2048)


@router.get("/api-keys")
def tenant_list_api_keys(auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.tenants.service import list_tenant_keys

    return {"status": "success", "keys": list_tenant_keys(tenant_id=auth.tenant_id)}


@router.post("/api-keys")
def tenant_create_api_key(
    body: ApiKeyCreateRequest,
    auth: AuthContext = Depends(require_auth_admin),
) -> dict:
    from app.billing.entitlements import check_api_key_quota
    from app.tenants.service import issue_api_key

    blocked = check_api_key_quota(tenant_id=auth.tenant_id)
    if blocked:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=blocked)
    key = issue_api_key(
        tenant_id=auth.tenant_id,
        label=body.label,
        role=body.role,
        created_by_user_id=auth.user_id,
    )
    log_action(
        tenant_id=auth.tenant_id,
        action="api_key.created",
        actor=auth.email or auth.user_id or "admin",
        resource_id=key["keyId"],
        detail={"label": body.label, "role": body.role, "authMethod": auth.auth_method},
    )
    return {"status": "success", **key}


@router.delete("/api-keys/{key_id}")
def tenant_revoke_api_key(key_id: str, auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.tenants.service import revoke_api_key

    try:
        result = revoke_api_key(key_id=key_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if result["tenantId"] != auth.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Key belongs to another tenant.")
    log_action(
        tenant_id=auth.tenant_id,
        action="api_key.revoked",
        actor=auth.email or auth.user_id or "admin",
        resource_id=key_id,
        detail={"authMethod": auth.auth_method},
    )
    return {"status": "success", **result}


@router.get("/members")
def tenant_list_members(auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.db.engine import db_session
    from app.db.models import TenantMembership, User

    if not persistence_enabled():
        return {"status": "success", "members": []}
    with db_session() as session:
        rows = session.query(TenantMembership).filter(TenantMembership.tenant_id == auth.tenant_id).all()
        members = []
        for row in rows:
            user = session.get(User, row.user_id)
            members.append(
                {
                    "membershipId": row.id,
                    "userId": row.user_id,
                    "email": user.email if user else None,
                    "name": user.name if user else None,
                    "role": row.role,
                    "joinedAt": row.created_at.isoformat(),
                }
            )
    return {"status": "success", "members": members}


@router.delete("/members/{membership_id}")
def tenant_remove_member(membership_id: str, auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.db.engine import db_session
    from app.db.models import TenantMembership
    from app.auth_workos.session import revoke_session_keys_for_user

    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable.")
    with db_session() as session:
        row = session.get(TenantMembership, membership_id)
        if row is None or row.tenant_id != auth.tenant_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found.")
        if row.user_id == auth.user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove yourself.")
        payload = {"membershipId": row.id, "userId": row.user_id}
        session.delete(row)
    revoke_session_keys_for_user(tenant_id=auth.tenant_id, user_id=payload["userId"])
    log_action(
        tenant_id=auth.tenant_id,
        action="member.removed",
        actor=auth.email or auth.user_id or "admin",
        resource_id=membership_id,
        detail=payload,
    )
    return {"status": "success", **payload}


@router.patch("/members/{membership_id}")
def tenant_update_member_role(
    membership_id: str,
    body: MemberRoleUpdate,
    auth: AuthContext = Depends(require_auth_admin),
) -> dict:
    from app.db.engine import db_session
    from app.db.models import TenantMembership

    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable.")
    with db_session() as session:
        row = session.get(TenantMembership, membership_id)
        if row is None or row.tenant_id != auth.tenant_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found.")
        if row.user_id == auth.user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own role.")
        row.role = body.role
    log_action(
        tenant_id=auth.tenant_id,
        action="member.role_updated",
        actor=auth.email or auth.user_id or "admin",
        resource_id=membership_id,
        detail={"role": body.role},
    )
    return {"status": "success", "membershipId": membership_id, "role": body.role}


@router.get("/invites")
def tenant_list_invites(auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.db.engine import db_session
    from app.db.models import TenantInvite

    if not persistence_enabled():
        return {"status": "success", "invites": []}
    with db_session() as session:
        rows = session.query(TenantInvite).filter(TenantInvite.tenant_id == auth.tenant_id).all()
        invites = [
            {
                "inviteId": row.id,
                "email": row.email,
                "role": row.role,
                "status": row.status,
                "expiresAt": row.expires_at.isoformat() if row.expires_at else None,
                "createdAt": row.created_at.isoformat(),
            }
            for row in rows
        ]
    return {"status": "success", "invites": invites}


@router.post("/invites")
def tenant_create_invite(body: TeamInviteRequest, auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.auth_workos.service import invite_user
    from app.billing.entitlements import check_team_invite_quota, check_team_invites_feature

    blocked = check_team_invites_feature(tenant_id=auth.tenant_id) or check_team_invite_quota(
        tenant_id=auth.tenant_id
    )
    if blocked:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=blocked)
    invite = invite_user(
        tenant_id=auth.tenant_id,
        email=body.email,
        role=body.role,
        inviter_user_id=auth.user_id,
    )
    if invite is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to send invitation. WorkOS may not be configured.",
        )
    log_action(
        tenant_id=auth.tenant_id,
        action="invite.sent",
        actor=auth.email or auth.user_id or "admin",
        resource_id=invite.get("inviteId"),
        detail={"email": body.email, "role": body.role},
    )
    return {"status": "success", **invite}


@router.delete("/invites/{invite_id}")
def tenant_revoke_invite(invite_id: str, auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.db.engine import db_session
    from app.db.models import TenantInvite

    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable.")
    with db_session() as session:
        row = session.get(TenantInvite, invite_id)
        if row is None or row.tenant_id != auth.tenant_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found.")
        row.status = "revoked"
    log_action(
        tenant_id=auth.tenant_id,
        action="invite.revoked",
        actor=auth.email or auth.user_id or "admin",
        resource_id=invite_id,
    )
    return {"status": "success", "inviteId": invite_id, "revoked": True}


@router.post("/sso/portal-link")
def tenant_sso_portal_link(body: SsoPortalRequest, auth: AuthContext = Depends(require_auth_admin)) -> dict:
    from app.auth_workos.service import get_admin_portal_link
    from app.billing.entitlements import check_sso_feature

    blocked = check_sso_feature(tenant_id=auth.tenant_id)
    if blocked:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=blocked)
    link = get_admin_portal_link(tenant_id=auth.tenant_id, return_url=body.returnUrl)
    if not link:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SSO portal unavailable. WorkOS org may not exist yet.",
        )
    return {"status": "success", "portalUrl": link}
