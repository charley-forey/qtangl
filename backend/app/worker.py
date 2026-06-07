from __future__ import annotations

import logging
import os
import time
from typing import Any

from app.db.config import redis_enabled, use_worker_queue
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.safety import ScanSafetyError
from app.pqc.sessions import get_session
from app.queue.redis_queue import dequeue_blocking, load_job_payload
from app.store.scan_jobs import complete_job, fail_job, get_job, get_job_payload, update_job_timeline
from app.pqc.models import TimelineEvent

logger = logging.getLogger(__name__)


def execute_pqc_scan_job(scan_id: str, payload: dict[str, Any], *, tenant_id: str) -> None:
    max_retries = int(os.environ.get("QTANGL_WORKER_MAX_RETRIES", "3"))
    last_error: Exception | None = None
    request_id = str(payload.get("requestId") or payload.get("request_id") or "")

    for attempt in range(max_retries):
        try:
            _run_scan_once(scan_id, payload, tenant_id=tenant_id, request_id=request_id)
            return
        except ScanSafetyError as exc:
            fail_job(scan_id, str(exc), tenant_id=tenant_id)
            return
        except Exception as exc:
            last_error = exc
            logger.warning("PQC job %s attempt %d failed: %s", scan_id, attempt + 1, exc)
            if attempt < max_retries - 1:
                time.sleep(min(30, 2**attempt))

    fail_job(scan_id, str(last_error or "Unknown worker error"), tenant_id=tenant_id)


def _run_scan_once(
    scan_id: str,
    payload: dict[str, Any],
    *,
    tenant_id: str,
    request_id: str = "",
) -> None:
    if request_id:
        logger.info("worker scan_id=%s tenant=%s request_id=%s", scan_id, tenant_id, request_id)
    dataset = load_dataset()
    uploaded_rows = None
    bundle_session_id = payload.get("bundleSessionId")
    if bundle_session_id:
        uploaded_rows = get_session(bundle_session_id, tenant_id=tenant_id)
        if uploaded_rows is None:
            fail_job(scan_id, "Uploaded bundle session not found or expired.", tenant_id=tenant_id)
            return

    def on_progress(event: TimelineEvent) -> None:
        job = get_job(scan_id, tenant_id=tenant_id)
        timeline = list(job.timeline) if job else []
        timeline.append(event)
        update_job_timeline(scan_id, timeline, tenant_id=tenant_id)

    try:
        bundle = run_pqc_scan(
            dataset,
            scenario_id=str(payload.get("scenarioId", "bank-tls-inventory")),
            use_fixture=False,
            target_override=payload.get("target"),
            uploaded_rows=uploaded_rows,
            seed=int(payload.get("seed", 1234)),
            on_progress=on_progress,
            depth=str(payload.get("depth", "standard")),
        )
        complete_job(scan_id, bundle, tenant_id=tenant_id)
        notify_email = payload.get("notifyEmail")
        if notify_email:
            from app.notifications.email import send_report_email

            base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
            send_report_email(
                to_email=str(notify_email),
                scan_id=scan_id,
                target_domain=bundle.report.target_domain,
                report_url=f"{base}/dashboard",
                readiness_band=bundle.report.readiness_band,
            )
    except ScanSafetyError:
        raise
    except Exception:
        raise


def process_next_job() -> bool:
    job_id = dequeue_blocking("pqc_scan", timeout_seconds=2)
    if not job_id:
        return False

    payload = load_job_payload(job_id)
    tenant_id = "sandbox"
    if payload:
        tenant_id = str(payload.get("tenantId", "sandbox"))
    else:
        db_payload = get_job_payload(job_id, tenant_id=tenant_id)
        if db_payload:
            payload = db_payload
            tenant_id = str(db_payload.get("tenantId", tenant_id))

    if not payload:
        fail_job(job_id, "Missing worker job payload.", tenant_id=tenant_id)
        return True

    tenant_id = str(payload.get("tenantId", tenant_id))
    job = get_job(job_id, tenant_id=tenant_id)
    if job is None:
        logger.warning(
            "worker job row missing scan_id=%s tenant_id=%s — running scan and upserting bundle",
            job_id,
            tenant_id,
        )
    elif job.status != "running":
        return True

    execute_pqc_scan_job(job_id, payload, tenant_id=tenant_id)
    return True


def main() -> None:
    if not redis_enabled():
        raise SystemExit("REDIS_URL is required for the Qtangl worker.")
    if not use_worker_queue():
        logger.warning("QTANGL_INLINE_JOBS is enabled; worker will still consume queued jobs.")

    logger.info("Qtangl worker started.")
    last_scheduler_tick = 0.0
    scheduler_interval = float(os.environ.get("QTANGL_SCHEDULER_INTERVAL_SEC", "60"))
    while True:
        try:
            processed = process_next_job()
            now = time.time()
            if now - last_scheduler_tick >= scheduler_interval:
                from app.monitoring.service import enqueue_due_scans

                enqueued = enqueue_due_scans()
                from app.monitoring.scheduler_state import record_scheduler_tick

                record_scheduler_tick(enqueued=enqueued)
                if enqueued:
                    logger.info("Enqueued %d scheduled scan(s)", enqueued)
                try:
                    from app.pqc.transparency import current_root
                    from app.pqc.anchoring import maybe_anchor_on_milestone

                    root = current_root()
                    maybe_anchor_on_milestone(
                        seq=int(root.get("seq") or 0),
                        root_hash=str(root.get("rootHash") or ""),
                        entry_count=int(root.get("entryCount") or 0),
                    )
                except Exception:
                    pass
                last_scheduler_tick = now
            if not processed:
                time.sleep(0.25)
        except KeyboardInterrupt:
            logger.info("Worker stopped.")
            return
        except Exception:
            logger.exception("Worker loop error")
            time.sleep(1)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
