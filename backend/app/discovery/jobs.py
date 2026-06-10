from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import DiscoveryJob
from app.queue.redis_queue import enqueue, store_job_payload


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def create_discovery_job(
    *,
    tenant_id: str,
    job_type: str,
    payload: dict[str, Any],
    target_id: str | None = None,
) -> str:
    job_id = f"disc-{uuid.uuid4().hex[:12]}"
    body = {**payload, "tenantId": tenant_id, "jobType": job_type}
    if persistence_enabled():
        with db_session() as session:
            row = DiscoveryJob(
                id=job_id,
                tenant_id=tenant_id,
                job_type=job_type,
                status="running",
                target_id=target_id,
                payload_json=json.dumps(body),
            )
            session.add(row)
            session.flush()
    store_job_payload(job_id, body)
    queue = {
        "host_fleet_scan": "discovery_host",
        "code_scan": "discovery_code",
        "binary_scan": "discovery_binary",
        "repo_scheduled_scan": "discovery_code",
    }.get(job_type, "discovery_code")
    enqueue(queue, job_id)
    return job_id


def get_discovery_job(*, job_id: str, tenant_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = session.get(DiscoveryJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return None
        return {
            "jobId": row.id,
            "jobType": row.job_type,
            "status": row.status,
            "targetId": row.target_id,
            "result": json.loads(row.result_json) if row.result_json else None,
            "error": row.error,
            "timeline": json.loads(row.timeline_json or "[]"),
            "createdAt": row.created_at.isoformat() if row.created_at else None,
            "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
        }


def complete_discovery_job(*, job_id: str, tenant_id: str, result: dict[str, Any]) -> None:
    if not persistence_enabled():
        return
    with db_session() as session:
        row = session.get(DiscoveryJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return
        row.status = "done"
        row.result_json = json.dumps(result)
        row.updated_at = _utcnow()
        session.flush()
        job_type = row.job_type
        target_id = row.target_id
    try:
        from app.monitoring.drift_hooks import on_discovery_job_complete

        on_discovery_job_complete(
            job_id=job_id,
            tenant_id=tenant_id,
            job_type=job_type,
            result=result,
            target_id=target_id,
        )
    except Exception:
        pass


def fail_discovery_job(*, job_id: str, tenant_id: str, error: str) -> None:
    if not persistence_enabled():
        return
    with db_session() as session:
        row = session.get(DiscoveryJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return
        row.status = "error"
        row.error = error
        row.updated_at = _utcnow()
        session.flush()


def retry_discovery_job(
    *,
    job_id: str,
    tenant_id: str,
    payload: dict[str, Any],
    queue_name: str,
    error: str,
) -> bool:
    """Re-enqueue failed discovery job with exponential backoff metadata (max 3 attempts)."""
    attempt = int(payload.get("attempt", 1))
    if attempt >= 3:
        return False
    next_payload = {**payload, "attempt": attempt + 1, "lastError": error}
    store_job_payload(job_id, next_payload)
    if persistence_enabled():
        with db_session() as session:
            row = session.get(DiscoveryJob, job_id)
            if row is None or row.tenant_id != tenant_id:
                return False
            row.status = "running"
            row.error = error
            timeline = json.loads(row.timeline_json or "[]")
            timeline.append({"phase": "retry", "detail": f"attempt {attempt + 1}", "at": _utcnow().isoformat()})
            row.timeline_json = json.dumps(timeline)
            row.updated_at = _utcnow()
            session.flush()
    enqueue(queue_name, job_id)
    return True


def append_timeline(*, job_id: str, tenant_id: str, event: dict[str, Any]) -> None:
    if not persistence_enabled():
        return
    with db_session() as session:
        row = session.get(DiscoveryJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return
        timeline = json.loads(row.timeline_json or "[]")
        timeline.append(event)
        row.timeline_json = json.dumps(timeline)
        row.updated_at = _utcnow()
        session.flush()
