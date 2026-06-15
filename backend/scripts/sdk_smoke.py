#!/usr/bin/env python3
"""Integration smoke for Qtangl SDK packages."""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def _run_local(api_key: str) -> int:
    backend_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_root))

    import httpx
    from fastapi.testclient import TestClient

    from app.main import app
    from qtangl import QtanglClient, new_idempotency_key
    from qtangl._transport import Transport
    from qtangl.testing import StarletteTestTransport

    starlette = TestClient(app)
    transport = StarletteTestTransport(starlette)
    http = httpx.Client(transport=transport, base_url="http://testserver")
    client = QtanglClient(
        base_url="http://testserver",
        api_key=api_key,
        transport=Transport(
            base_url="http://testserver",
            api_key=api_key,
            client=http,
            max_retries=0,
        ),
    )
    try:
        scan = client.scan_fixture(idempotency_key=new_idempotency_key())
        scan_id = scan.get("scanId")
        if not scan_id:
            print(f"Scan missing scanId: {scan}", file=sys.stderr)
            return 1
        verify = client.verify_scan(str(scan_id))
        if not (verify.get("verification") or {}).get("valid"):
            print(f"Verify failed for {scan_id}: {verify}", file=sys.stderr)
            return 1
        root = client.transparency_root()
        if "log" not in root:
            print(f"Transparency root missing log: {root}", file=sys.stderr)
            return 1
        settings = client.monitor.get_settings()
        if "settings" not in settings and settings.get("status") != "success":
            print(f"Unexpected settings payload: {settings}", file=sys.stderr)
            return 1
    finally:
        client.close()
        http.close()

    print(f"SDK local smoke OK: scanId={scan_id}")
    return 0


def _run_remote(api_base: str, api_key: str) -> int:
    from qtangl import QtanglClient, new_idempotency_key

    client = QtanglClient(base_url=api_base.rstrip("/"), api_key=api_key)

    ready = client.health_ready()
    if ready.get("status") not in {"ok", "success", "ready"} and "status" in ready:
        print(f"Unexpected /health/ready payload: {ready}", file=sys.stderr)

    scan = client.scan_fixture(idempotency_key=new_idempotency_key())
    scan_id = scan.get("scanId")
    if not scan_id:
        print(f"Scan missing scanId: {scan}", file=sys.stderr)
        return 1

    verify = client.verify_scan(str(scan_id))
    verification = verify.get("verification") or {}
    if verification.get("valid") is not True:
        print(f"Verify failed for {scan_id}: {verify}", file=sys.stderr)
        return 1

    root = client.transparency_root()
    if "log" not in root:
        print(f"Transparency root missing log: {root}", file=sys.stderr)
        return 1

    print(
        f"SDK remote smoke OK: scanId={scan_id} verify=valid transparencySeq={root.get('log', {}).get('seq')}"
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Qtangl SDK integration smoke")
    parser.add_argument(
        "--local",
        action="store_true",
        help="Run against in-process FastAPI app (no network/API key required)",
    )
    parser.add_argument(
        "--api-base",
        default=os.getenv("QTANGL_API_BASE", "https://api.qtangl.com"),
        help="API base URL for remote smoke",
    )
    parser.add_argument(
        "--api-key",
        default=os.getenv("QTANGL_API_KEY", "qtangl-demo-key"),
        help="Bearer API key for remote smoke",
    )
    args = parser.parse_args()

    if args.local:
        return _run_local(args.api_key)

    try:
        return _run_remote(args.api_base, args.api_key)
    except Exception as exc:
        if "Invalid API key" in str(exc) or "401" in str(exc):
            print(
                "SDK remote smoke skipped: invalid API key. "
                "Set QTANGL_API_KEY or use --local for CI.",
                file=sys.stderr,
            )
            return 0
        raise


if __name__ == "__main__":
    raise SystemExit(main())
