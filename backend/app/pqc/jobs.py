from __future__ import annotations

import threading
import time
import uuid
from dataclasses import replace
from typing import Any, Callable

from app.pqc.models import ScanBundle, ScanJob, TimelineEvent

_job_lock = threading.Lock()
_jobs: dict[str, ScanJob] = {}


def create_job() -> str:
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
    with _job_lock:
        _jobs[scan_id] = job
    return scan_id


def get_job(scan_id: str) -> ScanJob | None:
    with _job_lock:
        return _jobs.get(scan_id)


def update_job_timeline(scan_id: str, timeline: list[TimelineEvent]) -> None:
    with _job_lock:
        job = _jobs.get(scan_id)
        if not job:
            return
        _jobs[scan_id] = replace(job, timeline=list(timeline), updated_at=time.time())


def complete_job(scan_id: str, bundle: ScanBundle) -> None:
    with _job_lock:
        job = _jobs.get(scan_id)
        if not job:
            return
        _jobs[scan_id] = replace(
            job,
            status="done",
            bundle=bundle,
            timeline=list(bundle.timeline),
            updated_at=time.time(),
        )


def fail_job(scan_id: str, error: str, timeline: list[TimelineEvent] | None = None) -> None:
    with _job_lock:
        job = _jobs.get(scan_id)
        if not job:
            return
        _jobs[scan_id] = replace(
            job,
            status="error",
            error=error,
            timeline=timeline or job.timeline,
            updated_at=time.time(),
        )


def run_job_async(scan_id: str, runner: Callable[[Callable[[TimelineEvent], None]], ScanBundle]) -> None:
    def on_progress(event: TimelineEvent) -> None:
        with _job_lock:
            job = _jobs.get(scan_id)
            if not job:
                return
            timeline = list(job.timeline)
            timeline.append(event)
            _jobs[scan_id] = replace(job, timeline=timeline, updated_at=time.time())

    def _worker() -> None:
        try:
            bundle = runner(on_progress)
            complete_job(scan_id, bundle)
        except Exception as exc:
            fail_job(scan_id, str(exc))

    thread = threading.Thread(target=_worker, daemon=True)
    thread.start()
