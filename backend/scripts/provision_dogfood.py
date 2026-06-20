#!/usr/bin/env python3
"""Provision dogfood tenant for live self-scan CI and trust center."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser(description="Provision Qtangl dogfood tenant")
    parser.add_argument("--base-url", default=os.environ.get("QTANGL_API_BASE_URL", "http://localhost:8000"))
    parser.add_argument("--admin-secret", default=os.environ.get("QTANGL_ADMIN_SECRET", ""))
    parser.add_argument(
        "--domains",
        default="qtangl.com,www.qtangl.com,api.qtangl.com",
        help="Comma-separated authorized domains",
    )
    parser.add_argument("--include-staging", action="store_true", help="Add staging.qtangl.com to allowlist")
    parser.add_argument(
        "--hq-tenant-id",
        default=os.environ.get("QTANGL_HQ_TENANT_ID", ""),
        help="Link dogfood as portfolio child of HQ tenant",
    )
    parser.add_argument(
        "--create-weekly-schedule",
        action="store_true",
        help="Create weekly in-product schedule (requires scheduler + dogfood API key env)",
    )
    args = parser.parse_args()

    if not args.admin_secret:
        print("Set QTANGL_ADMIN_SECRET or pass --admin-secret", file=sys.stderr)
        return 1

    domains = [d.strip() for d in args.domains.split(",") if d.strip()]
    if args.include_staging and "staging.qtangl.com" not in domains:
        domains.append("staging.qtangl.com")

    cmd = [
        sys.executable,
        os.path.join(os.path.dirname(__file__), "provision_tenant.py"),
        "--base-url",
        args.base_url,
        "--admin-secret",
        args.admin_secret,
        "--name",
        "Qtangl Dogfood",
        "--tenant-id",
        "dogfood",
        "--tier",
        "monitor",
        "--domains",
        ",".join(domains),
        "--key-label",
        "dogfood-ci",
    ]
    print("Provisioning dogfood tenant...")
    result = subprocess.run(cmd, check=False)
    if result.returncode != 0:
        return result.returncode

    headers = {
        "Authorization": f"Bearer {args.admin_secret}",
        "Content-Type": "application/json",
    }
    _put(
        f"{args.base_url.rstrip('/')}/admin/tenants/dogfood/settings",
        {"settings": {"autoRetainScans": True, "dogfoodTenant": True}},
        headers,
    )
    print("Enabled autoRetainScans for dogfood tenant.")

    if args.hq_tenant_id.strip():
        _put(
            f"{args.base_url.rstrip('/')}/admin/tenants/dogfood/mssp-parent",
            {"parentTenantId": args.hq_tenant_id.strip()},
            headers,
        )
        print(f"Linked dogfood → HQ portfolio parent {args.hq_tenant_id.strip()}")

    if args.create_weekly_schedule:
        dogfood_key = os.environ.get("QTANGL_DOGFOOD_API_KEY", "").strip()
        if not dogfood_key:
            print("Skip schedule: set QTANGL_DOGFOOD_API_KEY to create weekly monitor schedule.", file=sys.stderr)
        else:
            schedule_headers = {
                "Authorization": f"Bearer {dogfood_key}",
                "Content-Type": "application/json",
            }
            try:
                _post(
                    f"{args.base_url.rstrip('/')}/tenant/schedules",
                    {
                        "scenarioId": "bank-tls-inventory",
                        "target": "www.qtangl.com",
                        "cadenceHours": 168,
                        "notifyEmail": os.environ.get("QTANGL_DOGFOOD_NOTIFY_EMAIL", "charley@qtangl.com"),
                    },
                    schedule_headers,
                )
                print("Created weekly schedule for www.qtangl.com on dogfood tenant.")
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")
                print(f"Weekly schedule skipped ({exc.code}): {detail}", file=sys.stderr)

    print("\n--- Next steps ---")
    print("1. Store printed API key as GitHub secret QTANGL_DOGFOOD_API_KEY")
    print("2. Railway: QTANGL_DOGFOOD_TENANT_ID=dogfood")
    print("3. Railway: QTANGL_PQC_ENABLE_LIVE_SCAN=true")
    print(f"4. Railway: QTANGL_PQC_SCAN_ALLOWLIST={','.join(domains)}")
    print("5. Railway: QTANGL_ENABLE_TRANSPARENCY_LOG=true")
    print("6. Run pqc-dogfood workflow (workflow_dispatch, live=true)")
    print("7. Verify: GET /pqc/dogfood/latest")
    print("8. Runbook: docs/runbooks/dogfood-ci-failure.md")
    return 0


def _post(url: str, body: dict, headers: dict) -> dict:
    return _request("POST", url, body, headers)


def _put(url: str, body: dict, headers: dict) -> dict:
    return _request("PUT", url, body, headers)


def _request(method: str, url: str, body: dict, headers: dict) -> dict:
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


if __name__ == "__main__":
    raise SystemExit(main())
