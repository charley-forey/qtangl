from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import ScheduledScan as ScheduledScanRow
from app.store.scan_jobs import create_job


def scheduler_enabled() -> bool:
    return os.environ.get("QTANGL_ENABLE_SCHEDULER", "").lower() in {"1", "true", "yes"}


def list_schedules(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = (
            session.query(ScheduledScanRow)
            .filter(ScheduledScanRow.tenant_id == tenant_id, ScheduledScanRow.active.is_(True))
            .order_by(ScheduledScanRow.next_run_at.asc())
            .all()
        )
        return [_row_to_dict(row) for row in rows]


def create_schedule(
    *,
    tenant_id: str,
    scenario_id: str,
    target: str | None,
    cadence_hours: int,
    notify_email: str | None = None,
    import_payload_json: str | None = None,
) -> dict[str, Any]:
    if not persistence_enabled():
        raise RuntimeError("Scheduled monitoring requires Postgres persistence.")
    schedule_id = f"sched-{uuid.uuid4()}"
    now = datetime.now(timezone.utc)
    next_run = now
    with db_session() as session:
        row = ScheduledScanRow(
            id=schedule_id,
            tenant_id=tenant_id,
            scenario_id=scenario_id,
            target=target,
            cadence_hours=max(1, cadence_hours),
            next_run_at=next_run,
            notify_email=notify_email,
            import_payload_json=import_payload_json,
            active=True,
        )
        session.add(row)
        session.flush()
        return _row_to_dict(row)


def delete_schedule(*, tenant_id: str, schedule_id: str) -> bool:
    if not persistence_enabled():
        return False
    with db_session() as session:
        row = session.get(ScheduledScanRow, schedule_id)
        if row is None or row.tenant_id != tenant_id:
            return False
        row.active = False
        return True


def due_schedules(now: datetime | None = None) -> list[ScheduledScanRow]:
    if not persistence_enabled() or not scheduler_enabled():
        return []
    now = now or datetime.now(timezone.utc)
    with db_session() as session:
        return (
            session.query(ScheduledScanRow)
            .filter(
                ScheduledScanRow.active.is_(True),
                ScheduledScanRow.next_run_at <= now,
            )
            .all()
        )


def mark_run(
    schedule: ScheduledScanRow,
    *,
    scan_id: str,
    cadence_hours: int | None = None,
) -> None:
    from datetime import timedelta

    hours = cadence_hours or schedule.cadence_hours
    with db_session() as session:
        row = session.get(ScheduledScanRow, schedule.id)
        if row is None:
            return
        row.last_run_scan_id = scan_id
        row.next_run_at = datetime.now(timezone.utc) + timedelta(hours=hours)
        row.updated_at = datetime.now(timezone.utc)


def enqueue_due_scans() -> int:
    """Enqueue due scheduled scans. Returns count enqueued."""
    if not scheduler_enabled():
        return 0
    enqueued = 0
    for schedule in due_schedules():
        payload: dict[str, Any] = {
            "scenarioId": schedule.scenario_id,
            "tenantId": schedule.tenant_id,
            "useFixture": False,
        }
        if schedule.target:
            payload["target"] = schedule.target
        if schedule.notify_email:
            payload["notifyEmail"] = schedule.notify_email
        if schedule.import_payload_json:
            from app.pqc.cloud_import import parse_cloud_inventory
            from app.pqc.sessions import create_session

            rows = parse_cloud_inventory(schedule.import_payload_json, filename="scheduled-import.json")
            if rows:
                session_id = create_session(rows, tenant_id=schedule.tenant_id)
                payload["bundleSessionId"] = session_id
                payload["useFixture"] = True
        payload["scheduleId"] = schedule.id
        scan_id = create_job(tenant_id=schedule.tenant_id, payload=payload)
        mark_run(schedule, scan_id=scan_id)
        enqueued += 1
    return enqueued


def _row_to_dict(row: ScheduledScanRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "tenantId": row.tenant_id,
        "scenarioId": row.scenario_id,
        "target": row.target,
        "cadenceHours": row.cadence_hours,
        "nextRunAt": row.next_run_at.isoformat() if row.next_run_at else None,
        "lastRunScanId": row.last_run_scan_id,
        "notifyEmail": row.notify_email,
        "hasCloudImport": bool(row.import_payload_json),
        "active": row.active,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }
