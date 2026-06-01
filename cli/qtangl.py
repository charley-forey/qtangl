#!/usr/bin/env python3
"""Qtangl CLI — scan and schedule from terminal."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request


def _api(path: str, *, method: str = "GET", body: dict | None = None, api_key: str = "") -> dict:
    base = os.environ.get("QTANGL_API_URL", "http://localhost:8000")
    data = json.dumps(body).encode() if body else None
    request = urllib.request.Request(
        f"{base}{path}",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method=method,
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode())


def main() -> int:
    parser = argparse.ArgumentParser(prog="qtangl")
    parser.add_argument("--api-key", default=os.environ.get("QTANGL_API_KEY", ""))
    sub = parser.add_subparsers(dest="command", required=True)

    scan = sub.add_parser("scan", help="Start PQC scan")
    scan.add_argument("--target", required=True)
    scan.add_argument("--scenario", default="bank-tls-inventory")

    schedules = sub.add_parser("schedules", help="List schedules")

    args = parser.parse_args()
    if not args.api_key:
        print("Set QTANGL_API_KEY or --api-key", file=sys.stderr)
        return 1

    if args.command == "scan":
        result = _api(
            "/pqc/scan",
            method="POST",
            body={"target": args.target, "scenarioId": args.scenario},
            api_key=args.api_key,
        )
        print(json.dumps(result, indent=2))
    elif args.command == "schedules":
        result = _api("/tenant/schedules", api_key=args.api_key)
        print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
