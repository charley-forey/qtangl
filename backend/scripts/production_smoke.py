#!/usr/bin/env python3
"""Production smoke test: scan → PDF → verify. Usage:
  QTANGL_API_BASE=https://api.qtangl.com QTANGL_API_KEY=... python scripts/production_smoke.py
  python scripts/production_smoke.py --health-only
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser(description="Qtangl production smoke test")
    parser.add_argument(
        "--health-only",
        action="store_true",
        help="Only check /health and /health/ready (no API key required)",
    )
    args = parser.parse_args()

    base = os.environ.get("QTANGL_API_BASE", "http://127.0.0.1:8000").rstrip("/")
    api_key = os.environ.get("QTANGL_API_KEY", "qtangl-demo-key")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    print(f"Smoke test against {base}")

    health = _get(f"{base}/health")
    print(f"  health: {health.get('status')}")

    ready = _get(f"{base}/health/ready")
    print(
        f"  health/ready: {ready.get('status')} "
        f"persistence={ready.get('persistenceEnabled')} "
        f"redis={ready.get('redisEnabled')} "
        f"workerQueue={ready.get('workerQueueEnabled')}"
    )
    if ready.get("status") != "ready":
        print("WARN: API not fully ready (check DATABASE_URL / REDIS_URL)")

    if args.health_only:
        print("OK: health checks passed")
        return 0

    scan = _post(
        f"{base}/pqc/scan",
        headers,
        {"scenarioId": "bank-tls-inventory", "useFixture": True, "depth": "standard"},
    )
    scan_id = scan.get("scanId")
    if not scan_id:
        print("FAIL: no scanId", scan)
        return 1
    print(f"  scan: {scan_id}")

    pdf = _get_bytes(f"{base}/pqc/report/{scan_id}?format=pdf&api_key={api_key}")
    if not pdf.startswith(b"%PDF"):
        print("FAIL: PDF does not start with %PDF")
        return 1
    print(f"  pdf: {len(pdf)} bytes")

    verify = _get(f"{base}/pqc/verify/{scan_id}")
    verification = verify.get("verification") or {}
    log_inclusion = verification.get("logInclusion") or {}
    print(
        f"  verify: valid={verification.get('valid')} alg={verification.get('alg')} "
        f"logIncluded={log_inclusion.get('included', False)}"
    )

    root = _get(f"{base}/pqc/transparency/root")
    log_meta = root.get("log") or {}
    print(f"  transparency/root: seq={log_meta.get('seq')} entries={log_meta.get('entryCount')}")

    bundle = _get_bytes(f"{base}/pqc/report/{scan_id}?format=bundle&api_key={api_key}")
    if not bundle.startswith(b"PK"):
        print("FAIL: evidence bundle is not a ZIP")
        return 1
    print(f"  bundle: {len(bundle)} bytes")

    print("OK: production smoke passed")
    return 0


def _get(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def _get_bytes(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=120) as response:
        return response.read()


def _post(url: str, headers: dict[str, str], body: dict) -> dict:
    data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8")
        if exc.code == 401:
            raise SystemExit(
                f"HTTP 401: Invalid API key. Set QTANGL_API_KEY to your Railway QTANGL_API_KEY "
                f"or a tenant key issued via POST /admin/tenants/{{id}}/keys.\n{detail}"
            ) from exc
        raise SystemExit(f"HTTP {exc.code}: {detail}") from exc


if __name__ == "__main__":
    sys.exit(main())
