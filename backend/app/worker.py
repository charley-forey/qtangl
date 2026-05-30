from __future__ import annotations

import logging
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
        )
        complete_job(scan_id, bundle, tenant_id=tenant_id)
    except ScanSafetyError as exc:
        fail_job(scan_id, str(exc), tenant_id=tenant_id)
    except Exception as exc:
        logger.exception("PQC worker job failed for %s", scan_id)
        fail_job(scan_id, str(exc), tenant_id=tenant_id)


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
        fail_job(job_id, "Scan job not found for tenant.", tenant_id=tenant_id)
        return True
    if job.status != "running":
        return True

    execute_pqc_scan_job(job_id, payload, tenant_id=tenant_id)
    return True


def main() -> None:
    if not redis_enabled():
        raise SystemExit("REDIS_URL is required for the Qtangl worker.")
    if not use_worker_queue():
        logger.warning("QTANGL_INLINE_JOBS is enabled; worker will still consume queued jobs.")

    logger.info("Qtangl worker started.")
    while True:
        try:
            processed = process_next_job()
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
