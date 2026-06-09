#!/usr/bin/env python3
"""Backup evidence log tables via pg_dump to local file or S3."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Backup evidence log tables")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--output", type=Path, default=Path("evidence_backup.sql"))
    args = parser.parse_args()

    bucket = os.getenv("QTANGL_EVIDENCE_BACKUP_BUCKET", "")
    db_url = os.getenv("DATABASE_URL", "")
    tables = ["evidence_log", "signing_keys", "evidence_anchors", "witness_cosignatures"]
    manifest = {
        "backedUpAt": datetime.now(timezone.utc).isoformat(),
        "tables": tables,
        "bucket": bucket or "(not configured)",
        "dryRun": args.dry_run,
    }
    if args.dry_run or not db_url:
        print(json.dumps(manifest, indent=2))
        return 0

    table_args = []
    for table in tables:
        table_args.extend(["-t", table])
    cmd = ["pg_dump", db_url, "--data-only", *table_args]
    try:
        result = subprocess.run(cmd, capture_output=True, check=True)
        args.output.write_bytes(result.stdout)
        manifest["output"] = str(args.output)
        manifest["bytes"] = len(result.stdout)
        if bucket:
            manifest["note"] = f"Upload {args.output} to {bucket} via your object-storage CLI"
        print(json.dumps(manifest, indent=2))
        return 0
    except FileNotFoundError:
        print("pg_dump not found — install PostgreSQL client tools", file=sys.stderr)
        return 2
    except subprocess.CalledProcessError as exc:
        print(exc.stderr.decode(), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
