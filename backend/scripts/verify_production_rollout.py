#!/usr/bin/env python3
"""Post-deploy rollout verification for evidence layer + CBOM migrations.

Usage:
  QTANGL_API_BASE=https://your-api.up.railway.app python scripts/verify_production_rollout.py
  QTANGL_API_BASE=... QTANGL_API_KEY=... python scripts/verify_production_rollout.py --full
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify production rollout gates")
    parser.add_argument("--full", action="store_true", help="Run scan + verify + transparency checks")
    args = parser.parse_args()

    base = os.environ.get("QTANGL_API_BASE", "http://127.0.0.1:8000").rstrip("/")
    api_key = os.environ.get("QTANGL_API_KEY", "qtangl-demo-key")
    failures: list[str] = []

    print(f"Rollout verification against {base}")

    ready = _get(f"{base}/health/ready")
    if ready.get("status") != "ready":
        failures.append(f"health/ready status={ready.get('status')}")
    if not ready.get("persistenceEnabled"):
        failures.append("persistenceEnabled=false (DATABASE_URL missing?)")
    print(f"  persistence={ready.get('persistenceEnabled')} workerQueue={ready.get('workerQueueEnabled')}")

    keys = _get(f"{base}/pqc/transparency/keys")
    key_count = len(keys.get("keys") or [])
    print(f"  transparency/keys: {key_count} key(s)")

    root = _get(f"{base}/pqc/transparency/root")
    log_meta = root.get("log") or {}
    print(f"  transparency/root: seq={log_meta.get('seq')} entryCount={log_meta.get('entryCount')}")

    if args.full:
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        scan = _post(
            f"{base}/pqc/scan",
            headers,
            {"scenarioId": "bank-tls-inventory", "useFixture": True, "depth": "standard"},
        )
        scan_id = scan.get("scanId")
        if not scan_id:
            failures.append("scan did not return scanId")
        else:
            verify = _get(f"{base}/pqc/verify/{scan_id}")
            verification = verify.get("verification") or {}
            if not verification.get("valid"):
                failures.append(f"verify invalid for {scan_id}")
            log_inclusion = verification.get("logInclusion") or {}
            if not log_inclusion.get("included"):
                print("  WARN: log inclusion absent (QTANGL_ENABLE_TRANSPARENCY_LOG may be off)")

    if failures:
        print("FAIL:")
        for item in failures:
            print(f"  - {item}")
        return 1

    print("OK: rollout verification passed")
    return 0


def _get(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def _post(url: str, headers: dict[str, str], body: dict) -> dict:
    data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.loads(response.read().decode("utf-8"))


if __name__ == "__main__":
    sys.exit(main())
