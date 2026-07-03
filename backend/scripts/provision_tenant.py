#!/usr/bin/env python3
"""SE provisioning: create tenant + subscription tier + API key + authorized domains."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser(description="Provision Qtangl pilot tenant")
    parser.add_argument("--base-url", default=os.environ.get("QTANGL_API_BASE_URL", "http://localhost:8000"))
    parser.add_argument("--admin-secret", default=os.environ.get("QTANGL_ADMIN_SECRET", ""))
    parser.add_argument("--name", required=True)
    parser.add_argument("--tenant-id", default=None)
    parser.add_argument("--tier", default="monitor", choices=["free", "monitor", "convert", "enterprise"])
    parser.add_argument("--domains", default="", help="Comma-separated authorized domains")
    parser.add_argument("--key-label", default="pilot-primary")
    parser.add_argument("--enable-host-sensor", action="store_true", help="Enable discovery.hostSensor in tenant settings")
    args = parser.parse_args()

    if not args.admin_secret:
        print("Set QTANGL_ADMIN_SECRET or pass --admin-secret", file=sys.stderr)
        return 1

    headers = {
        "Authorization": f"Bearer {args.admin_secret}",
        "Content-Type": "application/json",
    }

    tenant_body = {"name": args.name}
    if args.tenant_id:
        tenant_body["tenantId"] = args.tenant_id
    tenant_body["tier"] = args.tier

    tenant = _post(f"{args.base_url}/admin/tenants", tenant_body, headers)
    tenant_id = tenant["tenantId"]
    print(f"Created tenant: {tenant_id} (tier={args.tier})")

    if args.enable_host_sensor:
        _put(
            f"{args.base_url}/admin/tenants/{tenant_id}/settings",
            {"settings": {"discovery": {"hostSensor": True, "codeScan": False, "binaryScan": False}}},
            headers,
        )
        print("Enabled discovery.hostSensor")

    if args.domains.strip():
        domains = [d.strip() for d in args.domains.split(",") if d.strip()]
        _put(
            f"{args.base_url}/admin/tenants/{tenant_id}/authorized-domains",
            {"domains": domains, "attestation": "Sales-led provisioning via provision_tenant.py"},
            headers,
        )
        print(f"Authorized domains: {', '.join(domains)}")

    key = _post(
        f"{args.base_url}/admin/tenants/{tenant_id}/keys",
        {"label": args.key_label},
        headers,
    )
    print("\n--- Customer handoff ---")
    print(f"Tenant ID: {tenant_id}")
    print(f"API key (store securely): {key['apiKey']}")
    print(f"Dashboard: https://www.qtangl.com/command-center")
    print(f"Assess production: https://www.qtangl.com/assess?mode=production")
    return 0


def _post(url: str, body: dict, headers: dict) -> dict:
    return _request("POST", url, body, headers)


def _put(url: str, body: dict, headers: dict) -> dict:
    return _request("PUT", url, body, headers)


def _request(method: str, url: str, body: dict, headers: dict) -> dict:
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"{method} {url} failed ({exc.code}): {detail}") from exc


if __name__ == "__main__":
    raise SystemExit(main())
