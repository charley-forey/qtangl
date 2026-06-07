#!/usr/bin/env python3
"""One-time idempotent backfill of signed reports into the transparency log."""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backfill_transparency")


def _iter_bundles():
    from app.db.config import persistence_enabled
    from app.db.engine import scan_db_session
    from app.db.models import ScanJob as ScanJobRow
    from app.store.scan_jobs import _bundle_json_from_row

    if persistence_enabled():
        with scan_db_session() as session:
            rows = session.query(ScanJobRow).filter(ScanJobRow.status == "done").all()
            for row in rows:
                raw = _bundle_json_from_row(row)
                if not raw:
                    continue
                yield row.tenant_id, json.loads(raw)
        return

    from app.store import scan_jobs as store

    with store._job_lock:
        for scan_id, job in store._memory_jobs.items():
            if job.status != "done" or not job.bundle:
                from app.pqc.serialize import serialize_bundle

                yield "sandbox", serialize_bundle(job.bundle)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    os.environ.setdefault("QTANGL_ENABLE_TRANSPARENCY_LOG", "true")

    from app.pqc.report import report_to_json
    from app.pqc.transparency import append_entry

    count = 0
    skipped = 0
    for tenant_id, bundle in _iter_bundles():
        report = bundle.get("report") or {}
        if not report:
            continue
        from app.pqc.models import MigrationReport
        from app.pqc.bundle_codec import bundle_from_api_dict

        try:
            parsed = bundle_from_api_dict(bundle)
            report_json = report_to_json(parsed.report)
        except Exception:
            report_json = dict(report)
        signature = report_json.get("signature") or report.get("signature") or {}
        content_hash = signature.get("contentHash")
        if not content_hash:
            skipped += 1
            continue
        if args.dry_run:
            logger.info("Would append %s", content_hash[:16])
            count += 1
            continue
        receipt = append_entry(content_hash, signature, tenant_id=tenant_id)
        if receipt:
            count += 1
            logger.info("Appended seq=%s hash=%s…", receipt.get("seq"), content_hash[:16])
        else:
            skipped += 1

    logger.info("Backfill complete: appended=%s skipped=%s", count, skipped)
    return 0


if __name__ == "__main__":
    sys.exit(main())
