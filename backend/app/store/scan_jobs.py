from __future__ import annotations

import json
import os
import time
import uuid
from dataclasses import asdict, replace
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Any, Callable

import logging

from app.db.config import persistence_enabled, use_worker_queue
from app.db.engine import db_session, scan_db_session

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
        raw = load_bundle_blob(storage_key=row.bundle_storage_key)
        if raw:
            return raw
        logger.warning(
            "bundle blob missing scan_id=%s storage_key=%s — treating as empty bundle",
            row.id,
            row.bundle_storage_key,
        )
    return None


def _clear_orphan_storage_key(row: ScanJobRow) -> bool:
    """Drop storage_key when the blob is missing so a retry can store bundle_json."""
    if not row.bundle_storage_key:
        return False
    if load_bundle_blob(storage_key=row.bundle_storage_key):
        return False
    row.bundle_storage_key = None
    return True


def scan_storage_diagnosis(scan_id: str, *, tenant_id: str = "sandbox") -> str | None:
    """Return a missing_reason code when the bundle cannot be loaded."""
    if load_scan_bundle(scan_id, tenant_id=tenant_id) is not None:
        return None
    if not persistence_enabled():
        return "scan_not_found"
    with scan_db_session() as session:
        row = session.get(ScanJobRow, scan_id)
        if row is None:
            return "scan_not_found"
        if row.tenant_id != tenant_id:
            return "wrong_tenant"
        if not _bundle_json_from_row(row):
            return "bundle_not_persisted"
    return None


def bundle_stored(scan_id: str, *, tenant_id: str = "sandbox") -> bool:
    """True when the scan bundle can be loaded for report export."""
    return scan_storage_diagnosis(scan_id, tenant_id=tenant_id) is None


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
        with scan_db_session(tenant_id=tenant_id) as session:
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
        with scan_db_session() as session:
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
        with scan_db_session(tenant_id=tenant_id) as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None or row.tenant_id != tenant_id or not row.payload_json:
                return None
            return json.loads(row.payload_json)
    return None


def list_jobs_for_tenant(*, tenant_id: str, limit: int = 50) -> list[dict[str, Any]]:
    if persistence_enabled():
        with scan_db_session(tenant_id=tenant_id) as session:
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
        with scan_db_session(tenant_id=tenant_id) as session:
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
    """Persist a finished scan (inserts scan_jobs row when missing — e.g. worker after API create_job)."""
    save_scan_bundle(scan_id, bundle, tenant_id=tenant_id)


def fail_job(
    scan_id: str,
    error: str,
    timeline: list[TimelineEvent] | None = None,
    *,
    tenant_id: str = "sandbox",
) -> None:
    if persistence_enabled():
        with scan_db_session(tenant_id=tenant_id) as session:
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
            with scan_db_session(tenant_id=tenant_id) as session:
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
                    _clear_orphan_storage_key(row)
                    _apply_scan_metadata(row, bundle, payload)
                    row.timeline_json = json.dumps([asdict(event) for event in bundle.timeline])
                    row.updated_at = datetime.now(timezone.utc)
            return
        except Exception as exc:
            logger.warning(
                "save_scan_bundle db failed scan_id=%s tenant_id=%s — retrying bundle_json only: %s",
                scan_id,
                tenant_id,
                exc,
            )
            try:
                with scan_db_session(tenant_id=tenant_id) as session:
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
                                bundle_storage_key=None,
                            )
                        )
                    elif row.tenant_id == tenant_id:
                        row.status = "done"
                        row.bundle_json = payload
                        row.bundle_storage_key = None
                        row.timeline_json = json.dumps([asdict(event) for event in bundle.timeline])
                        row.readiness_score = bundle.report.readiness_score
                        row.target_domain = bundle.report.target_domain
                        row.scenario_id = bundle.report.scenario_id
                        row.updated_at = datetime.now(timezone.utc)
                return
            except Exception as retry_exc:
                logger.error(
                    "save_scan_bundle retry failed scan_id=%s tenant_id=%s: %s",
                    scan_id,
                    tenant_id,
                    retry_exc,
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
        with scan_db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            if row is None:
                return None
            raw = _bundle_json_from_row(row)
            return json.loads(raw) if raw else None
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        if job is None or not job.bundle:
            return None
        return serialize_bundle(job.bundle)


def dogfood_tenant_id() -> str:
    return os.getenv("QTANGL_DOGFOOD_TENANT_ID", "dogfood").strip() or "dogfood"


DOGFOOD_TARGETS = (
    "www.qtangl.com",
    "qtangl.com",
    "api.qtangl.com",
)

DOGFOOD_STALE_DAYS = 8


def _dogfood_scan_summaries(*, limit: int = 50) -> list[dict[str, Any]]:
    """Completed dogfood scans with bundle, newest first."""
    tenant_id = dogfood_tenant_id()
    out: list[dict[str, Any]] = []

    if persistence_enabled():
        from sqlalchemy import select

        with scan_db_session() as session:
            rows = (
                session.execute(
                    select(ScanJobRow)
                    .where(ScanJobRow.tenant_id == tenant_id, ScanJobRow.status == "done")
                    .order_by(ScanJobRow.created_at.desc())
                    .limit(limit)
                )
                .scalars()
                .all()
            )
            for row in rows:
                if not _bundle_json_from_row(row):
                    continue
                summary = _job_summary(row)
                out.append(summary)
    else:
        with _job_lock:
            jobs = [
                job
                for job in _memory_jobs.values()
                if job.tenant_id == tenant_id and job.status == "done" and job.bundle
            ]
            jobs.sort(key=lambda j: j.updated_at, reverse=True)
            for job in jobs[:limit]:
                report = job.bundle.report if job.bundle else None
                out.append(
                    {
                        "scanId": job.scan_id,
                        "targetDomain": report.target_domain if report else None,
                        "readinessScore": report.readiness_score if report else None,
                        "readinessBand": report.readiness_band if report else None,
                        "createdAt": datetime.fromtimestamp(job.created_at, tz=timezone.utc).isoformat(),
                        "updatedAt": datetime.fromtimestamp(job.updated_at, tz=timezone.utc).isoformat(),
                    }
                )
    return out


def _staleness_days(iso: str | None) -> float | None:
    if not iso:
        return None
    try:
        parsed = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return max(0.0, (datetime.now(timezone.utc) - parsed).total_seconds() / 86400.0)
    except ValueError:
        return None


def dogfood_target_summaries() -> list[dict[str, Any]]:
    """Latest scan per canonical dogfood target domain."""
    summaries = _dogfood_scan_summaries()
    by_target: dict[str, dict[str, Any]] = {}
    for row in summaries:
        target = str(row.get("targetDomain") or "").lower()
        if target and target not in by_target:
            by_target[target] = row
    public_base = os.getenv("QTANGL_PUBLIC_URL", "https://www.qtangl.com").rstrip("/")
    targets: list[dict[str, Any]] = []
    for canonical in DOGFOOD_TARGETS:
        row = by_target.get(canonical)
        if not row:
            targets.append({"targetDomain": canonical, "scanId": None, "missing": True})
            continue
        scanned_at = row.get("updatedAt") or row.get("createdAt")
        staleness = _staleness_days(str(scanned_at) if scanned_at else None)
        scan_id = str(row.get("scanId") or "")
        targets.append(
            {
                "targetDomain": canonical,
                "scanId": scan_id,
                "readinessScore": row.get("readinessScore"),
                "readinessBand": row.get("readinessBand"),
                "scannedAt": scanned_at,
                "stalenessDays": round(staleness, 1) if staleness is not None else None,
                "stale": staleness is not None and staleness > DOGFOOD_STALE_DAYS,
                "verifyUrl": f"{public_base}/verify?scanId={scan_id}" if scan_id else None,
            }
        )
    return targets


def dogfood_history(*, days: int = 90) -> list[dict[str, Any]]:
    """Readiness trend points for dogfood tenant scans within window."""
    since = datetime.now(timezone.utc) - timedelta(days=max(1, days))
    points: list[dict[str, Any]] = []
    for row in _dogfood_scan_summaries(limit=200):
        scanned_at = row.get("updatedAt") or row.get("createdAt")
        if not scanned_at:
            continue
        try:
            when = datetime.fromisoformat(str(scanned_at).replace("Z", "+00:00"))
            if when.tzinfo is None:
                when = when.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
        if when < since:
            continue
        points.append(
            {
                "scanId": row.get("scanId"),
                "targetDomain": row.get("targetDomain"),
                "readinessScore": row.get("readinessScore"),
                "readinessBand": row.get("readinessBand"),
                "scannedAt": scanned_at,
            }
        )
    points.sort(key=lambda p: str(p.get("scannedAt") or ""))
    return points


def latest_dogfood_scan_id(*, preferred_target: str = "www.qtangl.com") -> str | None:
    """Latest completed dogfood tenant scan with a persisted bundle."""
    tenant_id = dogfood_tenant_id()
    candidates: list[tuple[str, str | None, str]] = []

    if persistence_enabled():
        from sqlalchemy import select

        with scan_db_session() as session:
            rows = (
                session.execute(
                    select(ScanJobRow)
                    .where(ScanJobRow.tenant_id == tenant_id, ScanJobRow.status == "done")
                    .order_by(ScanJobRow.created_at.desc())
                    .limit(20)
                )
                .scalars()
                .all()
            )
            for row in rows:
                if not _bundle_json_from_row(row):
                    continue
                candidates.append((row.id, row.target_domain, row.created_at.isoformat()))
    else:
        with _job_lock:
            for job in _memory_jobs.values():
                if job.tenant_id != tenant_id or job.status != "done" or not job.bundle:
                    continue
                report = job.bundle.report
                target = report.target_domain if report else None
                created = datetime.fromtimestamp(job.created_at, tz=timezone.utc).isoformat()
                candidates.append((job.scan_id, target, created))

    if not candidates:
        return None
    for scan_id, target, _ in candidates:
        if target == preferred_target:
            return scan_id
    return candidates[0][0]


def get_scan_tenant_id(scan_id: str) -> str | None:
    if persistence_enabled():
        with scan_db_session() as session:
            row = session.get(ScanJobRow, scan_id)
            return row.tenant_id if row else None
    with _job_lock:
        job = _memory_jobs.get(scan_id)
        return job.tenant_id if job else None


def load_scan_bundle(scan_id: str, *, tenant_id: str = "sandbox") -> dict[str, Any] | None:
    if persistence_enabled():
        with scan_db_session() as session:
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
            with scan_db_session(tenant_id=tenant_id) as session:
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


def _timeline_from_json(timeline_raw: list[Any]) -> list[TimelineEvent]:
    timeline: list[TimelineEvent] = []
    for item in timeline_raw:
        if not isinstance(item, dict):
            continue
        status = item.get("status", "done")
        if status not in ("done", "replayed", "skipped", "running", "error"):
            status = "done"
        timeline.append(
            TimelineEvent(
                key=str(item.get("key", "")),
                label=str(item.get("label", "")),
                duration_ms=int(item.get("duration_ms", item.get("durationMs", 0)) or 0),
                status=status,  # type: ignore[arg-type]
            )
        )
    return timeline


def _row_to_job(row: ScanJobRow) -> ScanJob:
    timeline_raw = json.loads(row.timeline_json or "[]")
    if not isinstance(timeline_raw, list):
        timeline_raw = []
    timeline = _timeline_from_json(timeline_raw)
    bundle = None
    raw = _bundle_json_from_row(row)
    if raw:
        from app.pqc.bundle_codec import bundle_from_api_dict

        try:
            bundle = bundle_from_api_dict(json.loads(raw))
        except Exception as exc:
            logger.warning("bundle_from_api_dict failed scan_id=%s: %s", row.id, exc)
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
