#!/usr/bin/env python3
"""Provision MSSP demo portfolio: parent + 3 sample customer tenants."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request


def _request(method: str, url: str, headers: dict, body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())


def main() -> int:
    parser = argparse.ArgumentParser(description="Provision MSSP demo portfolio")
    parser.add_argument("--base-url", default=os.environ.get("QTANGL_API_BASE_URL", "http://localhost:8000"))
    parser.add_argument("--admin-secret", default=os.environ.get("QTANGL_ADMIN_SECRET", ""))
    args = parser.parse_args()

    if not args.admin_secret:
        print("Set QTANGL_ADMIN_SECRET", file=sys.stderr)
        return 2

    base = args.base_url.rstrip("/")
    headers = {"Authorization": f"Bearer {args.admin_secret}", "Content-Type": "application/json"}

    parent = _request("POST", f"{base}/admin/tenants", {"name": "Demo MSSP Partners", "tier": "enterprise"}, headers)
    parent_id = parent["tenantId"]
    print(f"Parent: {parent_id}")

    _request(
        "PUT",
        f"{base}/admin/tenants/{parent_id}/settings",
        {
            "settings": {
                "orgType": "mssp",
                "partnerTier": "advanced",
                "discovery": {"hostSensor": True},
                "reportBranding": {"companyName": "Demo MSSP Partners", "primaryColor": "#0066cc"},
                "portalBranding": {"appName": "Demo MSSP Posture", "primaryColor": "#0066cc"},
            }
        },
        headers,
    )

    parent_key = _request("POST", f"{base}/admin/tenants/{parent_id}/keys", {"label": "mssp-demo"}, headers)

    customers = ["Demo Bank A", "Demo Bank B", "Demo Insurer C"]
    for name in customers:
        child = _request("POST", f"{base}/admin/tenants", {"name": name, "tier": "monitor"}, headers)
        child_id = child["tenantId"]
        _request(
            "PUT",
            f"{base}/admin/tenants/{child_id}/mssp-parent",
            {"parentTenantId": parent_id},
            headers,
        )
        print(f"  Linked child: {name} ({child_id})")

    print("\n--- Demo handoff ---")
    print(f"Parent tenant: {parent_id}")
    print(f"Parent API key: {parent_key.get('apiKey', '(see admin)')}")
    print("Open Portfolio tab after signing in as parent admin.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
