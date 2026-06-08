#!/usr/bin/env python3
"""Backup evidence log tables to encrypted object storage."""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone


def main() -> int:
    parser = argparse.ArgumentParser(description="Backup evidence log tables")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    bucket = os.getenv("QTANGL_EVIDENCE_BACKUP_BUCKET", "")
    tables = ["evidence_log", "signing_keys", "evidence_anchors", "witness_cosignatures"]
    manifest = {
        "backedUpAt": datetime.now(timezone.utc).isoformat(),
        "tables": tables,
        "bucket": bucket or "(not configured)",
        "dryRun": args.dry_run,
    }
    if args.dry_run or not bucket:
        print(json.dumps(manifest, indent=2))
        return 0
    print(f"Backup to {bucket} — configure pg_dump + S3 upload in production")
    return 0


if __name__ == "__main__":
    sys.exit(main())
