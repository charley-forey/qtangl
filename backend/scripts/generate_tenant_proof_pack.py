#!/usr/bin/env python3
"""Generate tenant-scoped auditor proof pack metadata (verify URLs, board PDF, schedules)."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser(description="Tenant proof pack JSON for pilots/auditors")
    parser.add_argument("--base-url", default=os.environ.get("QTANGL_API_BASE_URL", "https://api.qtangl.com"))
    parser.add_argument("--api-key", default=os.environ.get("QTANGL_API_KEY", ""))
    parser.add_argument("--tenant-id", default="", help="Informational label only")
    parser.add_argument("--out", default="tenant-proof-pack.json")
    parser.add_argument("--limit", type=int, default=5)
    args = parser.parse_args()

    if not args.api_key:
        print("Set QTANGL_API_KEY", file=sys.stderr)
        return 1

    headers = {"Authorization": f"Bearer {args.api_key}", "Accept": "application/json"}
    public_base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com").rstrip("/")

    try:
        scans = _get(f"{args.base_url.rstrip('/')}/tenant/scans?limit={args.limit}", headers)
        schedules = _get(f"{args.base_url.rstrip('/')}/tenant/schedules", headers)
        root = _get(f"{args.base_url.rstrip('/')}/pqc/transparency/root", {})
    except urllib.error.HTTPError as exc:
        print(f"API error {exc.code}: {exc.read().decode()}", file=sys.stderr)
        return 1

    items = []
    for row in scans.get("scans") or scans.get("jobs") or []:
        scan_id = str(row.get("scanId") or row.get("id") or "")
        if not scan_id:
            continue
        items.append(
            {
                "scanId": scan_id,
                "targetDomain": row.get("targetDomain"),
                "readinessScore": row.get("readinessScore"),
                "readinessBand": row.get("readinessBand"),
                "scannedAt": row.get("createdAt") or row.get("updatedAt"),
                "verifyUrl": f"{public_base}/verify?scanId={scan_id}",
                "boardPdfUrl": f"{args.base_url.rstrip('/')}/tenant/scans/{scan_id}/report?format=board",
            }
        )

    payload = {
        "status": "success",
        "tenantId": args.tenant_id or None,
        "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "scans": items,
        "schedules": schedules.get("schedules") or [],
        "transparencyLog": root.get("log") or root,
        "productCbomDocUrl": f"{public_base}/docs/trust/product-sbom",
    }

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)
    print(f"Wrote {args.out} ({len(items)} scans)")
    return 0


def _get(url: str, headers: dict) -> dict:
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


if __name__ == "__main__":
    raise SystemExit(main())
