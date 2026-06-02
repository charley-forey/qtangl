from __future__ import annotations

import json
import time
import uuid
from dataclasses import asdict, replace
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Callable

import logging

from app.db.config import persistence_enabled, use_worker_queue
from app.db.engine import db_session

logger = logging.getLogger(__name__)
from app.db.models import ScanJob as ScanJobRow
from app.pqc.models import ScanBundle, ScanJob, TimelineEvent
from app.pqc.serialize import serialize_bundle
from app.queue.redis_queue import enqueue as enqueue_job
from app.queue.redis_queue import store_job_payload
from app.storage.bundles import delete_bundle_blob, load_bundle_blob, store_bundle_blob


_job_lock = Lock()
_memory_jobs: dict[str, ScanJob] = {}


def _bundle_json_from_row(row: ScanJobRow) -> str | None:
    if row.bundle_json:
        return row.bundle_json
    if row.bundle_storage_key:
        return load_bundle_blob(storage_key=row.bundle_storage_key)
    return None


def _apply_scan_metadata(row: ScanJobRow, bundle: ScanBundle, payload: str) -> None:
    report = bundle.report
    row.readiness_score = report.readiness_score
    row.target_domain = report.target_domain
    row.scenario_id = report.scenario_id
    storage_key = store_bundle_blob(scan_id=row.id, tenant_id=row.tenant_id, payload=payload)
    if storage_key:
        row.bundle_storage_key = storage_key
        row.bundle_json = None
    else:
        row.bundle_json = payload
        row.bundle_storage_key = None


def create_job(*, tenant_id: str = "sandbox", payload: dict[str, Any] | None = None) -> str:
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
        tenant_id=tenant_id,
    )
    payload_json = json.dumps(payload) if payload else None
    if persistence_enabled():
        with db_session() as session:
            session.add(
                ScanJobRow(
                    id=scan_id,
                    tenant_id=tenant_id,
                    status="running",
                    timeline_json="[]",
                    payload_json=payload_json,
                )
            )
    else:
        with _job_lock:
            _memory_jobs[scan_id] = job
    if use_worker_queue():
        if payload:
            store_job_payload(scan_id, payload)
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
        job = _memory_jobs.get(scan_id)
        if job is None or job.tenant_id != tenant_id:
            return None
        return job


def get_job_payload(scan_id: str, *, tenant_id: str = "sandbox") -> dict[str, Any] | None:
    if persistence_enabled():
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id or not row.payload_json:
                return None
            return json.loads(row.payload_json)
    return None


def list_jobs_for_tenant(*, tenant_id: str, limit: int = 50) -> list[dict[str, Any]]:
    if persistence_enabled():
        with db_session() as session:
            rows = (
                session.query(ScanJobRow)
                .filter(ScanJobRow.tenant_id == tenant_id)
                .order_by(ScanJobRow.created_at.desc())
                .limit(limit)
                .all()
            )
            return [_job_summary(row) for row in rows]
    with _job_lock:
        jobs = [job for job in _memory_jobs.values() if job.tenant_id == tenant_id]
    jobs.sort(key=lambda job: job.created_at, reverse=True)
    return [_memory_job_summary(job) for job in jobs[:limit]]


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
        if not job or job.tenant_id != tenant_id:
            return
        _memory_jobs[scan_id] = replace(job, timeline=list(timeline), updated_at=time.time())


def complete_job(scan_id: str, bundle: ScanBundle, *, tenant_id: str = "sandbox") -> None:
    bundle = _prepare_bundle_for_storage(scan_id, bundle, tenant_id=tenant_id)
    if persistence_enabled():
        payload = json.dumps(serialize_bundle(bundle))
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id:
                return
            row.status = "done"
            row.timeline_json = json.dumps([asdict(event) for event in bundle.timeline])
            _apply_scan_metadata(row, bundle, payload)
            row.updated_at = datetime.now(timezone.utc)
        return
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if not job or job.tenant_id != tenant_id:
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
        if not job or job.tenant_id != tenant_id:
            return
        _memory_jobs[scan_id] = replace(
            job,
            status="error",
            error=error,
            timeline=timeline or job.timeline,
            updated_at=time.time(),
        )


def save_scan_bundle(scan_id: str, bundle: ScanBundle, *, tenant_id: str = "sandbox") -> None:
    bundle = _prepare_bundle_for_storage(scan_id, bundle, tenant_id=tenant_id)
    if persistence_enabled():
        payload = json.dumps(serialize_bundle(bundle))
        try:
            with db_session() as session:
                row = session.get(ScanJobRow, scan_id)
                if row is None:
                    session.add(
                        ScanJobRow(
                            id=scan_id,
                            tenant_id=tenant_id,
                            status="done",
                            timeline_json=json.dumps([asdict(event) for event in bundle.timeline]),
                            readiness_score=bundle.report.readiness_score,
                            target_domain=bundle.report.target_domain,
                            scenario_id=bundle.report.scenario_id,
                            bundle_json=payload,
                        )
                    )
                else:
                    if row.tenant_id != tenant_id:
                        return
                    row.status = "done"
                    _apply_scan_metadata(row, bundle, payload)
                    row.timeline_json = json.dumps([asdict(event) for event in bundle.timeline])
                    row.updated_at = datetime.now(timezone.utc)
            return
        except Exception as exc:
            logger.warning(
                "save_scan_bundle db failed scan_id=%s tenant_id=%s — using in-memory store: %s",
                scan_id,
                tenant_id,
                exc,
            )
    with _job_lock:
        _memory_jobs[scan_id] = ScanJob(
            scan_id=scan_id,
            status="done",
            bundle=bundle,
            timeline=list(bundle.timeline),
            error=None,
            created_at=time.time(),
            updated_at=time.time(),
            tenant_id=tenant_id,
        )


def find_previous_scan(
    *,
    tenant_id: str,
    target_domain: str,
    scenario_id: str,
    exclude_scan_id: str,
) -> str | None:
    """Most recent completed scan for same target + scenario."""
    for summary in list_jobs_for_tenant(tenant_id=tenant_id, limit=30):
        scan_id = summary["scanId"]
        if scan_id == exclude_scan_id or summary.get("status") != "done":
            continue
        bundle = load_scan_bundle(scan_id, tenant_id=tenant_id)
        if not bundle:
            continue
        report = bundle.get("report") or {}
        if report.get("targetDomain") == target_domain and report.get("scenarioId") == scenario_id:
            return scan_id
    return None


def load_scan_bundle_for_public_verify(scan_id: str) -> dict[str, Any] | None:
    """Load a scan bundle by ID for public signature verification (no tenant filter)."""
    if persistence_enabled():
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or not _bundle_json_from_row(row):
                return None
            raw = _bundle_json_from_row(row)
            return json.loads(raw) if raw else None
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if job is None or not job.bundle:
            return None
        return serialize_bundle(job.bundle)


def load_scan_bundle(scan_id: str, *, tenant_id: str = "sandbox") -> dict[str, Any] | None:
    if persistence_enabled():
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id:
                return None
            raw = _bundle_json_from_row(row)
            if not raw:
                return None
            return json.loads(raw)
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if job is None or job.tenant_id != tenant_id:
            return None
        if job.bundle:
            return serialize_bundle(job.bundle)
        return None


def delete_job(scan_id: str, *, tenant_id: str = "sandbox") -> bool:
    if persistence_enabled():
        with db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id:
                return False
            if row.bundle_storage_key:
                delete_bundle_blob(storage_key=row.bundle_storage_key)
            from app.db.models import RemediationExternalSync, RemediationStatus, ShareLink

            session.query(RemediationStatus).filter(
                RemediationStatus.scan_id == scan_id,
                RemediationStatus.tenant_id == tenant_id,
            ).delete()
            session.query(ShareLink).filter(
                ShareLink.scan_id == scan_id,
                ShareLink.tenant_id == tenant_id,
            ).delete()
            session.query(RemediationExternalSync).filter(
                RemediationExternalSync.scan_id == scan_id,
                RemediationExternalSync.tenant_id == tenant_id,
            ).delete()
            session.delete(row)
            return True
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if job is None or job.tenant_id != tenant_id:
            return False
        del _memory_jobs[scan_id]
        return True


def run_job_async(
    scan_id: str,
    runner: Callable[[Callable[[TimelineEvent], None]], ScanBundle],
    *,
    tenant_id: str = "sandbox",
) -> None:
    if use_worker_queue():
        return

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
            if not job or job.tenant_id != tenant_id:
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


def _prepare_bundle_for_storage(scan_id: str, bundle: ScanBundle, tenant_id: str) -> ScanBundle:
    from app.monitoring.post_complete import enrich_completed_scan

    return enrich_completed_scan(scan_id, bundle, tenant_id=tenant_id)


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
    raw = _bundle_json_from_row(row)
    if raw:
        from app.pqc.bundle_codec import bundle_from_api_dict

        bundle = bundle_from_api_dict(json.loads(raw))
    return ScanJob(
        scan_id=row.id,
        status=row.status,  # type: ignore[arg-type]
        bundle=bundle,
        timeline=timeline,
        error=row.error,
        created_at=row.created_at.timestamp(),
        updated_at=row.updated_at.timestamp(),
        tenant_id=row.tenant_id,
    )


def _job_summary(row: ScanJobRow) -> dict[str, Any]:
    payload = json.loads(row.payload_json) if row.payload_json else {}
    readiness_score = row.readiness_score
    readiness_band = None
    target_domain = row.target_domain
    if readiness_score is None and _bundle_json_from_row(row):
        bundle = json.loads(_bundle_json_from_row(row) or "{}")
        report = bundle.get("report") or {}
        readiness_score = report.get("readinessScore")
        readiness_band = report.get("readinessBand")
        target_domain = report.get("targetDomain")
    elif _bundle_json_from_row(row):
        bundle = json.loads(_bundle_json_from_row(row) or "{}")
        report = bundle.get("report") or {}
        readiness_band = report.get("readinessBand")
    return {
        "scanId": row.id,
        "status": row.status,
        "error": row.error,
        "scenarioId": row.scenario_id or payload.get("scenarioId"),
        "targetDomain": target_domain,
        "readinessScore": readiness_score,
        "readinessBand": readiness_band,
        "createdAt": row.created_at.isoformat(),
        "updatedAt": row.updated_at.isoformat(),
    }


def _memory_job_summary(job: ScanJob) -> dict[str, Any]:
    return {
        "scanId": job.scan_id,
        "status": job.status,
        "error": job.error,
        "scenarioId": None,
        "createdAt": datetime.fromtimestamp(job.created_at, tz=timezone.utc).isoformat(),
        "updatedAt": datetime.fromtimestamp(job.updated_at, tz=timezone.utc).isoformat(),
    }
