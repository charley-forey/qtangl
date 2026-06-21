"""Create monitor schedules for multiple authorized targets."""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status

from app.billing.entitlements import check_schedule_cadence, check_schedule_quota
from app.db.config import persistence_enabled, redis_enabled
from app.monitoring.service import create_schedule, list_schedules, scheduler_enabled
from app.pqc.batch_scan import normalize_batch_domains


def _scheduled_targets(*, tenant_id: str) -> set[str]:
    from app.pqc.safety import normalize_host

    targets: set[str] = set()
    for row in list_schedules(tenant_id=tenant_id):
        raw = row.get("target")
        if not raw:
            continue
        host = normalize_host(str(raw))
        if host:
            targets.add(host)
    return targets


def create_batch_schedules(
    *,
    tenant_id: str,
    targets: list[str],
    cadence_hours: int = 168,
    notify_email: str | None = None,
    scenario_id: str = "production-baseline",
    skip_existing: bool = True,
) -> dict[str, Any]:
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

    cadence_error = check_schedule_cadence(tenant_id=tenant_id, cadence_hours=cadence_hours)
    if cadence_error:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=cadence_error)

    normalized = normalize_batch_domains(targets)
    if not normalized:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No targets provided.")

    existing = _scheduled_targets(tenant_id=tenant_id)
    created: list[dict[str, Any]] = []
    skipped: list[str] = []

    for target in normalized:
        if skip_existing and target in existing:
            skipped.append(target)
            continue
        quota_error = check_schedule_quota(tenant_id=tenant_id)
        if quota_error:
            if not created:
                raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=quota_error)
            break
        schedule = create_schedule(
            tenant_id=tenant_id,
            scenario_id=scenario_id,
            target=target,
            cadence_hours=cadence_hours,
            notify_email=notify_email,
            job_type="scan",
        )
        created.append(schedule)
        existing.add(target)

    summary = f"Created {len(created)} schedule(s)"
    if skipped:
        summary += f"; skipped {len(skipped)} existing"
    if len(created) + len(skipped) < len(normalized) and not created:
        summary = "Schedule quota reached before any schedules were created."

    return {
        "status": "success",
        "count": len(created),
        "skipped": skipped,
        "schedules": created,
        "summary": summary,
    }
