"""Backfill drift snapshots from historical completed jobs."""

from __future__ import annotations

import argparse
import json

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import DiscoveryJob, ScanJob
from app.monitoring.drift_hooks import on_discovery_job_complete, record_external_drift_snapshot
from app.store.scan_jobs import load_scan_bundle
from app.pqc.report import report_to_json


def backfill(*, tenant_id: str | None = None, limit: int = 500) -> dict[str, int]:
    if not persistence_enabled():
        return {"scans": 0, "discovery": 0}
    scans = 0
    discovery = 0
    with db_session() as session:
        q = session.query(ScanJob).filter(ScanJob.status == "done")
        if tenant_id:
            q = q.filter(ScanJob.tenant_id == tenant_id)
        for row in q.order_by(ScanJob.created_at.desc()).limit(limit).all():
            bundle = load_scan_bundle(row.id, tenant_id=row.tenant_id)
            if not bundle:
                continue
            report = report_to_json(bundle.report)
            if record_external_drift_snapshot(
                tenant_id=row.tenant_id,
                scan_id=row.id,
                target_domain=bundle.report.target_domain,
                report_dict=report,
            ):
                scans += 1
        dq = session.query(DiscoveryJob).filter(DiscoveryJob.status == "done")
        if tenant_id:
            dq = dq.filter(DiscoveryJob.tenant_id == tenant_id)
        for row in dq.order_by(DiscoveryJob.created_at.desc()).limit(limit).all():
            result = json.loads(row.result_json or "{}")
            on_discovery_job_complete(
                job_id=row.id,
                tenant_id=row.tenant_id,
                job_type=row.job_type,
                result=result,
                target_id=row.target_id,
            )
            discovery += 1
    return {"scans": scans, "discovery": discovery}


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill drift snapshots")
    parser.add_argument("--tenant-id", default=None)
    parser.add_argument("--limit", type=int, default=500)
    args = parser.parse_args()
    result = backfill(tenant_id=args.tenant_id, limit=args.limit)
    print(result)


if __name__ == "__main__":
    main()
