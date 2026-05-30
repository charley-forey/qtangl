from __future__ import annotations

import json
import time
import uuid
from dataclasses import asdict, replace
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Callable

from app.db.config import persistence_enabled, redis_enabled
from app.db.engine import db_session
from app.db.models import ScanJob as ScanJobRow
from app.pqc.models import ScanBundle, ScanJob, TimelineEvent
from app.pqc.serialize import serialize_bundle
from app.queue.redis_queue import enqueue as enqueue_job


_job_lock = Lock()
_memory_jobs: dict[str, ScanJob] = {}


def create_job(*, tenant_id: str = "sandbox") -> str:
    scan_id = f"scan-{uuid.uuid4()}"
    now = time.time()
    job = ScanJob(
        scan_id=scan_id,
        status="running",
        bundle=None,
        timeline=[],
        error=None,
        created_at=now,
        updated_at=now,
    )
    if persistence_enabled():
        with db_session() as session:
            session.add(
                ScanJobRow(
                    id=scan_id,
                    tenant_id=tenant_id,
                    status="running",
                    timeline_json="[]",
                )
            )
    else:
        with _job_lock:
            _memory_jobs[scan_id] = job
    if redis_enabled():
        enqueue_job("pqc_scan", scan_id)
    return scan_id


def get_job(scan_id: str, *, tenant_id: str = "sandbox") -> ScanJob | None:
    if persistence_enabled():
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id:
                return None
            return _row_to_job(row)
    with _job_lock:
        return _memory_jobs.get(scan_id)


def update_job_timeline(scan_id: str, timeline: list[TimelineEvent], *, tenant_id: str = "sandbox") -> None:
    if persistence_enabled():
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id:
                return
            row.timeline_json = json.dumps([asdict(event) for event in timeline])
            row.updated_at = datetime.now(timezone.utc)
        return
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if not job:
            return
        _memory_jobs[scan_id] = replace(job, timeline=list(timeline), updated_at=time.time())


def complete_job(scan_id: str, bundle: ScanBundle, *, tenant_id: str = "sandbox") -> None:
    if persistence_enabled():
        payload = json.dumps(serialize_bundle(bundle))
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id:
                return
            row.status = "done"
            row.timeline_json = json.dumps([asdict(event) for event in bundle.timeline])
            row.bundle_json = payload
            row.updated_at = datetime.now(timezone.utc)
        return
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if not job:
            return
        _memory_jobs[scan_id] = replace(
            job,
            status="done",
            bundle=bundle,
            timeline=list(bundle.timeline),
            updated_at=time.time(),
        )


def fail_job(
    scan_id: str,
    error: str,
    timeline: list[TimelineEvent] | None = None,
    *,
    tenant_id: str = "sandbox",
) -> None:
    if persistence_enabled():
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id:
                return
            row.status = "error"
            row.error = error
            if timeline is not None:
                row.timeline_json = json.dumps([asdict(event) for event in timeline])
            row.updated_at = datetime.now(timezone.utc)
        return
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if not job:
            return
        _memory_jobs[scan_id] = replace(
            job,
            status="error",
            error=error,
            timeline=timeline or job.timeline,
            updated_at=time.time(),
        )


def save_scan_bundle(scan_id: str, bundle: ScanBundle, *, tenant_id: str = "sandbox") -> None:
    if persistence_enabled():
        payload = json.dumps(serialize_bundle(bundle))
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None:
                session.add(
                    ScanJobRow(
                        id=scan_id,
                        tenant_id=tenant_id,
                        status="done",
                        timeline_json=json.dumps([asdict(event) for event in bundle.timeline]),
                        bundle_json=payload,
                    )
                )
            else:
                if row.tenant_id != tenant_id:
                    return
                row.status = "done"
                row.bundle_json = payload
                row.timeline_json = json.dumps([asdict(event) for event in bundle.timeline])
                row.updated_at = datetime.now(timezone.utc)
        return
    with _job_lock:
        _memory_jobs[scan_id] = ScanJob(
            scan_id=scan_id,
            status="done",
            bundle=bundle,
            timeline=list(bundle.timeline),
            error=None,
            created_at=time.time(),
            updated_at=time.time(),
        )


def load_scan_bundle(scan_id: str, *, tenant_id: str = "sandbox") -> dict[str, Any] | None:
    if persistence_enabled():
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id or not row.bundle_json:
                return None
            return json.loads(row.bundle_json)
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if job and job.bundle:
            return serialize_bundle(job.bundle)
        return None


def run_job_async(
    scan_id: str,
    runner: Callable[[Callable[[TimelineEvent], None]], ScanBundle],
    *,
    tenant_id: str = "sandbox",
) -> None:
    def on_progress(event: TimelineEvent) -> None:
        if persistence_enabled():
            with db_session() as session:
                row = session.get(ScanJobRow, scan_id)
                if not row or row.tenant_id != tenant_id:
                    return
                timeline = json.loads(row.timeline_json or "[]")
                timeline.append(asdict(event))
                row.timeline_json = json.dumps(timeline)
                row.updated_at = datetime.now(timezone.utc)
            return
        with _job_lock:
            job = _memory_jobs.get(scan_id)
            if not job:
                return
            timeline = list(job.timeline)
            timeline.append(event)
            _memory_jobs[scan_id] = replace(job, timeline=timeline, updated_at=time.time())

    def _worker() -> None:
        try:
            bundle = runner(on_progress)
            complete_job(scan_id, bundle, tenant_id=tenant_id)
        except Exception as exc:
            fail_job(scan_id, str(exc), tenant_id=tenant_id)

    import threading

    threading.Thread(target=_worker, daemon=True).start()


def _row_to_job(row: ScanJobRow) -> ScanJob:
    timeline_raw = json.loads(row.timeline_json or "[]")
    timeline = [
        TimelineEvent(
            key=item["key"],
            label=item["label"],
            duration_ms=item["duration_ms"],
            status=item["status"],
        )
        for item in timeline_raw
    ]
    bundle = None
    if row.bundle_json:
        from app.pqc.bundle_codec import bundle_from_api_dict

        bundle = bundle_from_api_dict(json.loads(row.bundle_json))
    return ScanJob(
        scan_id=row.id,
        status=row.status,  # type: ignore[arg-type]
        bundle=bundle,
        timeline=timeline,
        error=row.error,
        created_at=row.created_at.timestamp(),
        updated_at=row.updated_at.timestamp(),
    )
