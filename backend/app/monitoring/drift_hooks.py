from __future__ import annotations

import logging
from typing import Any

from app.monitoring.alerts import evaluate_drift_alerts
from app.monitoring.drift_snapshots import (
    build_code_snapshot_payload,
    build_host_snapshot_payload,
    record_drift_snapshot,
)
from app.monitoring.unified_diff import UnifiedDiffService
from app.tenant.settings import drift_unified_enabled, get_tenant_settings_raw

logger = logging.getLogger(__name__)

_JOB_SOURCE_MAP = {
    "host_fleet_scan": ("host", build_host_snapshot_payload),
    "code_scan": ("code", build_code_snapshot_payload),
    "binary_scan": ("binary", build_code_snapshot_payload),
    "repo_scheduled_scan": ("code", build_code_snapshot_payload),
}


def on_discovery_job_complete(
    *,
    job_id: str,
    tenant_id: str,
    job_type: str,
    result: dict[str, Any],
    target_id: str | None = None,
) -> dict[str, Any] | None:
    """Record drift snapshot and evaluate alerts after discovery job completes."""
    if not drift_unified_enabled(tenant_id=tenant_id):
        return None

    mapping = _JOB_SOURCE_MAP.get(job_type)
    if not mapping:
        return None

    source_type, builder = mapping
    scope_key = target_id or result.get("fleetId") or result.get("repoUrl") or result.get("imageRef") or tenant_id
    payload = builder(result)
    snap_id = record_drift_snapshot(
        tenant_id=tenant_id,
        source_type=source_type,
        scope_key=str(scope_key),
        payload=payload,
        job_id=job_id,
    )
    if not snap_id:
        return None

    delta = UnifiedDiffService.compute_delta(
        tenant_id=tenant_id,
        source_type=source_type,
        scope_key=str(scope_key),
    )
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    alerts = evaluate_drift_alerts(delta=delta, source_type=source_type, settings=settings)
    if alerts:
        _dispatch_drift_alerts(tenant_id=tenant_id, alerts=alerts, delta=delta, job_id=job_id)

    schedule_id = result.get("scheduleId")
    if schedule_id and snap_id:
        try:
            from app.monitoring.service import mark_run

            mark_run(schedule_id, scan_id=job_id, drift_snapshot_id=snap_id)
        except Exception:
            pass

    try:
        from app.remediation.program import ingest_from_discovery_result

        ingest_from_discovery_result(
            tenant_id=tenant_id,
            job_id=job_id,
            job_type=job_type,
            result=result,
        )
        verify_for = result.get("verifyFor") or (result.get("payload") or {}).get("verifyFor")
        if verify_for and delta.get("removedCount", 0) > 0:
            from app.remediation.verify import auto_close_on_verify_delta

            auto_close_on_verify_delta(
                tenant_id=tenant_id,
                program_item_id=str(verify_for),
                delta=delta,
            )
    except Exception:
        pass

    return {"snapshotId": snap_id, "delta": delta, "alerts": alerts}


def record_external_drift_snapshot(
    *,
    tenant_id: str,
    scan_id: str,
    target_domain: str,
    report_dict: dict[str, Any],
) -> str | None:
    from app.monitoring.drift_snapshots import build_external_snapshot_payload

    payload = build_external_snapshot_payload(report_dict)
    return record_drift_snapshot(
        tenant_id=tenant_id,
        source_type="external",
        scope_key=target_domain,
        payload=payload,
        scan_id=scan_id,
    )


def _dispatch_drift_alerts(
    *,
    tenant_id: str,
    alerts: list[dict[str, Any]],
    delta: dict[str, Any],
    job_id: str | None = None,
    scan_id: str | None = None,
) -> None:
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    alert_mode = settings.get("alertMode", "per_event")
    if alert_mode == "daily_digest":
        return

    try:
        from app.monitoring.metrics import increment_drift_alert

        for a in alerts:
            increment_drift_alert(alert_type=a.get("rule", "unknown"), severity=a.get("severity", "info"))
    except Exception:
        pass

    try:
        from app.notifications.webhook_store import active_webhook_urls
        from app.notifications.webhooks import notify_drift_v2
        from app.store.tenant_alerts import persist_alert

        for alert in alerts:
            persist_alert(
                tenant_id=tenant_id,
                rule=str(alert.get("rule", "drift_alert")),
                severity=str(alert.get("severity", "info")),
                message=str(alert.get("message", "")),
                source="drift",
                payload={"jobId": job_id, "scanId": scan_id, **alert},
            )

        secret = settings.get("webhookSigningSecret") or ""
        for url in active_webhook_urls(tenant_id=tenant_id):
            notify_drift_v2(
                url=url,
                tenant_id=tenant_id,
                drift_delta=delta,
                alerts=alerts,
                job_id=job_id,
                scan_id=scan_id,
                signing_secret=secret,
            )
    except Exception as exc:
        logger.debug("drift webhook dispatch skipped: %s", exc)
