#!/usr/bin/env python3
"""GTM conversion smoke checks (Stripe signup, lead capture, golden verify).

Usage:
  QTANGL_API_BASE=https://your-api.up.railway.app python scripts/conversion_smoke.py
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    base = os.environ.get("QTANGL_API_BASE", "http://127.0.0.1:8000").rstrip("/")
    failures: list[str] = []
    print(f"Conversion smoke against {base}")

    signup = _post(
        f"{base}/public/monitor-signup",
        {"email": "smoke-test@example.com", "company": "Smoke Test Co"},
    )
    status = signup.get("status")
    if status not in {"success", "contact"}:
        failures.append(f"monitor-signup unexpected status={status}")
    else:
        print(f"  monitor-signup: {status}")

    lead = _post(
        f"{base}/public/lead-capture",
        {"email": "drip-smoke@example.com", "source": "mini-assessment-bank", "scenario": "bank"},
    )
    if lead.get("status") != "success":
        failures.append("lead-capture failed")
    else:
        print("  lead-capture: ok")

    golden_scan = os.environ.get("QTANGL_GOLDEN_SCAN_ID", "golden-bank-tls-inventory")
    try:
        verify = _get(f"{base}/pqc/verify/{golden_scan}")
        if not (verify.get("verification") or {}).get("valid"):
            print(f"  WARN: golden verify invalid for {golden_scan} (may be absent in env)")
        else:
            print(f"  golden verify: ok ({golden_scan})")
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            print(f"  WARN: golden scan {golden_scan} not found (optional)")
        else:
            failures.append(f"verify HTTP {exc.code}")

    if failures:
        print("FAIL:")
        for item in failures:
            print(f"  - {item}")
        return 1
    print("OK: conversion smoke passed")
    return 0


def _get(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def _post(url: str, body: dict) -> dict:
    data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


if __name__ == "__main__":
    sys.exit(main())
