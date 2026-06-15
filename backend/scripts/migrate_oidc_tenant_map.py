#!/usr/bin/env python3
"""Migrate AUTH_OIDC_TENANT_MAP env entries to WorkOS organizations (one-time)."""

from __future__ import annotations

import argparse
import json
import os
import sys

from app.auth_workos.service import create_organization, invite_user, upsert_user, workos_enabled
from app.db.engine import init_db
from app.db.models import Tenant
from app.db.engine import db_session


def main() -> int:
    parser = argparse.ArgumentParser(description="Migrate OIDC tenant map domains to WorkOS orgs.")
    parser.add_argument("--map-json", help="JSON map: domain -> {tenantId, role?, email?}")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    raw = args.map_json or os.getenv("AUTH_OIDC_TENANT_MAP")
    if not raw:
        print("No tenant map provided.", file=sys.stderr)
        return 1
    if not workos_enabled():
        print("Set QTANGL_DASHBOARD_AUTH_WORKOS=true and WORKOS_API_KEY.", file=sys.stderr)
        return 1

    init_db()
    mapping = json.loads(raw)
    migrated = 0
    for domain, entry in mapping.items():
        tenant_id = entry.get("tenantId") if isinstance(entry, dict) else None
        email = entry.get("email") if isinstance(entry, dict) else None
        if not tenant_id:
            continue
        with db_session() as session:
            tenant = session.get(Tenant, tenant_id)
            if tenant is None:
                print(f"skip unknown tenant {tenant_id} ({domain})")
                continue
            if tenant.workos_org_id:
                print(f"skip {tenant_id} — already linked")
                continue
            tenant_name = tenant.name
        if args.dry_run:
            print(f"would migrate {tenant_id} ({domain})")
            migrated += 1
            continue
        org_id = create_organization(tenant_id=tenant_id, name=tenant_name)
        if org_id and email:
            invite_user(tenant_id=tenant_id, email=email, role=entry.get("role", "admin"))
        print(f"migrated {tenant_id} -> {org_id}")
        migrated += 1
    print(f"done — {migrated} tenant(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
