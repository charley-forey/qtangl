#!/usr/bin/env python3
"""Seed a monitor estate for an internal HQ tenant: allowlist, portfolio, schedules, baselines.

Example (Railway shell with DATABASE_URL set):

  python backend/scripts/seed_monitor_estate.py --email charley@qtangl.com

Dry run:

  python backend/scripts/seed_monitor_estate.py --email charley@qtangl.com --dry-run
"""

from __future__ import annotations

import argparse
import sys
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func


def _bootstrap_path() -> None:
    import os

    backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)


def resolve_tenant_id_by_email(email: str) -> str | None:
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import Tenant, TenantMembership, User
    from app.tenant.settings import get_tenant_settings_raw

    if not persistence_enabled():
        print("DATABASE_URL is required.", file=sys.stderr)
        return None

    email_l = email.lower().strip()
    with db_session() as session:
        user = session.query(User).filter(func.lower(User.email) == email_l).first()
        if user is None:
            return None
        rows = (
            session.query(TenantMembership, Tenant)
            .join(Tenant, TenantMembership.tenant_id == Tenant.id)
            .filter(TenantMembership.user_id == user.id)
            .all()
        )
        if not rows:
            return None

        def score(row: tuple[TenantMembership, Tenant]) -> tuple[int, int]:
            membership, tenant = row
            settings = get_tenant_settings_raw(tenant_id=tenant.id)
            org_type = str(settings.get("orgType") or "")
            role_rank = {"admin": 3, "operator": 2, "viewer": 1, "executive": 0}.get(membership.role, 0)
            hq_rank = 2 if org_type == "internal_hq" else 1 if "qtangl" in tenant.name.lower() else 0
            return (hq_rank, role_rank)

        best = max(rows, key=score)
        return best[1].id


def ensure_prerequisites(*, tenant_id: str, notify_email: str, dry_run: bool) -> None:
    from app.billing.entitlements import upsert_subscription, tenant_entitlements
    from app.tenant.settings import get_tenant_billing_flags, get_tenant_settings_raw, patch_tenant_billing_flags

    ent = tenant_entitlements(tenant_id=tenant_id)
    tier = str(ent.get("tier") or "free")
    if tier not in {"monitor", "convert", "enterprise"}:
        print(f"Uplifting tenant {tenant_id} to enterprise tier (was {tier}).")
        if not dry_run:
            upsert_subscription(tenant_id=tenant_id, tier="enterprise", status="active")

    billing = get_tenant_billing_flags(tenant_id=tenant_id)
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    terms_required = str(settings.get("termsVersionRequired") or "2026-06-08")
    if not billing.get("termsAcceptedAt") or str(billing.get("termsVersion") or "") != terms_required:
        print("Recording legal terms acceptance for scheduled scans.")
        if not dry_run:
            patch_tenant_billing_flags(
                tenant_id=tenant_id,
                patch={
                    "termsAcceptedAt": datetime.now(timezone.utc).isoformat(),
                    "termsVersion": terms_required,
                },
            )

    from app.tenant.settings import upsert_tenant_settings

    org_type = settings.get("orgType")
    if org_type != "internal_hq":
        print("Marking tenant as internal_hq.")
        if not dry_run:
            upsert_tenant_settings(
                tenant_id=tenant_id,
                settings={"orgType": "internal_hq", "dogfoodMirrorEnabled": True},
            )

    _ = notify_email  # reserved for schedule notify field


def merge_allowlist(*, tenant_id: str, domains: list[str], dry_run: bool) -> list[str]:
    from app.tenant.settings import get_tenant_scan_allowlist

    current = set(get_tenant_scan_allowlist(tenant_id=tenant_id))
    merged = sorted(current | {d.strip().lower() for d in domains if d.strip()})
    added = [d for d in merged if d not in current]
    if added:
        print(f"Adding authorized domains: {', '.join(added)}")
    if not dry_run and added:
        from app.tenant.settings import append_tenant_scan_allowlist_many

        append_tenant_scan_allowlist_many(tenant_id=tenant_id, domains=added)
    return merged


def seed_portfolio_targets(*, tenant_id: str, rows: list[dict[str, str]], dry_run: bool) -> int:
    from app.portfolio.service import add_portfolio_target, list_portfolio

    existing = {t["target"] for t in list_portfolio(tenant_id=tenant_id)}
    created = 0
    for row in rows:
        target = row["target"]
        if target in existing:
            continue
        print(f"Portfolio target: {target} ({row.get('businessUnit', 'default')})")
        if not dry_run:
            add_portfolio_target(
                tenant_id=tenant_id,
                target=target,
                business_unit=row.get("businessUnit") or "default",
                label=row.get("label") or target,
            )
        created += 1
    return created


def seed_schedules(
    *,
    tenant_id: str,
    rows: list[dict[str, str]],
    notify_email: str,
    cadence_hours: int,
    dry_run: bool,
) -> dict[str, Any]:
    from app.monitoring.service import create_schedule, list_schedules
    from app.pqc.safety import normalize_host

    targets = [row["target"] for row in rows]
    if dry_run:
        print(f"Would create up to {len(targets)} monitor schedule(s) @ {cadence_hours}h cadence.")
        return {"status": "dry_run", "count": len(targets)}

    existing = {
        normalize_host(str(row.get("target") or ""))
        for row in list_schedules(tenant_id=tenant_id)
        if normalize_host(str(row.get("target") or ""))
    }

    total_created = 0
    all_schedules: list[dict[str, Any]] = []
    skipped: list[str] = []
    for row in rows:
        target = normalize_host(row["target"])
        if not target:
            continue
        if target in existing:
            skipped.append(target)
            continue
        schedule = create_schedule(
            tenant_id=tenant_id,
            scenario_id=row.get("scenarioId") or "bank-tls-inventory",
            target=target,
            cadence_hours=cadence_hours,
            notify_email=notify_email,
            job_type="scan",
        )
        total_created += 1
        all_schedules.append(schedule)
        existing.add(target)
        print(f"Schedule: {target} ({row.get('scenarioId', 'bank-tls-inventory')}) every {cadence_hours}h")

    return {
        "status": "success",
        "count": total_created,
        "skipped": skipped,
        "schedules": all_schedules,
    }


def seed_fixture_baselines(
    *,
    tenant_id: str,
    live_rows: list[dict[str, str]],
    scenario_ids: list[str],
    dry_run: bool,
) -> list[str]:
    from app.monitoring.post_complete import enrich_completed_scan
    from app.pqc.data import load_dataset
    from app.pqc.pipeline import run_pqc_scan
    from app.store.scan_jobs import save_scan_bundle

    planned = len(live_rows) + len(scenario_ids)
    if dry_run:
        print(f"Would run {planned} fixture baseline scan(s) ({len(live_rows)} live-mapped + {len(scenario_ids)} scenario).")
        return []

    dataset = load_dataset()
    scan_ids: list[str] = []

    for row in live_rows:
        scan_id = f"seed-{uuid.uuid4().hex[:14]}"
        scenario_id = row.get("scenarioId") or "bank-tls-inventory"
        target = row["target"]
        print(f"Running fixture baseline: {target} ({scenario_id}) → {scan_id}")
        bundle = run_pqc_scan(
            dataset,
            scenario_id=scenario_id,
            use_fixture=True,
            scan_id=scan_id,
            tenant_id=tenant_id,
            target_override=target,
            industry="financial",
        )
        bundle = enrich_completed_scan(scan_id, bundle, tenant_id=tenant_id)
        save_scan_bundle(scan_id, bundle, tenant_id=tenant_id)
        scan_ids.append(scan_id)

    for scenario_id in scenario_ids:
        scan_id = f"seed-{uuid.uuid4().hex[:14]}"
        print(f"Running scenario baseline: {scenario_id} → {scan_id}")
        bundle = run_pqc_scan(
            dataset,
            scenario_id=scenario_id,
            use_fixture=True,
            scan_id=scan_id,
            tenant_id=tenant_id,
            industry="financial",
        )
        bundle = enrich_completed_scan(scan_id, bundle, tenant_id=tenant_id)
        save_scan_bundle(scan_id, bundle, tenant_id=tenant_id)
        scan_ids.append(scan_id)

    return scan_ids


def main() -> int:
    _bootstrap_path()

    from app.db.config import persistence_enabled
    from app.monitoring.estate_catalog import (
        ESTATE_ALLOWLIST_DOMAINS,
        FIXTURE_BASELINE_SCENARIOS,
        LIVE_MONITOR_TARGETS,
    )

    parser = argparse.ArgumentParser(description="Seed monitor estate for internal HQ tenant")
    parser.add_argument("--email", default="charley@qtangl.com", help="Dashboard user email")
    parser.add_argument("--tenant-id", default="", help="Override tenant id (skip email lookup)")
    parser.add_argument("--notify-email", default="", help="Schedule alert email (default: --email)")
    parser.add_argument("--cadence-hours", type=int, default=24, help="Monitor cadence (enterprise min 1h)")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without writing")
    parser.add_argument("--skip-schedules", action="store_true", help="Skip schedule creation")
    parser.add_argument("--skip-baselines", action="store_true", help="Skip fixture baseline scans")
    args = parser.parse_args()

    if not persistence_enabled():
        print("Set DATABASE_URL before running this script.", file=sys.stderr)
        return 1

    tenant_id = args.tenant_id.strip()
    if not tenant_id:
        tenant_id = resolve_tenant_id_by_email(args.email) or ""
    if not tenant_id:
        print(f"No tenant found for {args.email}. Sign in to /command-center once, or pass --tenant-id.", file=sys.stderr)
        return 1

    notify_email = (args.notify_email or args.email).strip()
    live_rows = [dict(row) for row in LIVE_MONITOR_TARGETS]

    print(f"Seeding monitor estate for tenant={tenant_id} notify={notify_email}")
    ensure_prerequisites(tenant_id=tenant_id, notify_email=notify_email, dry_run=args.dry_run)
    domains = merge_allowlist(tenant_id=tenant_id, domains=list(ESTATE_ALLOWLIST_DOMAINS), dry_run=args.dry_run)
    portfolio_created = seed_portfolio_targets(tenant_id=tenant_id, rows=live_rows, dry_run=args.dry_run)

    schedule_result: dict[str, Any] = {"count": 0}
    if not args.skip_schedules:
        schedule_result = seed_schedules(
            tenant_id=tenant_id,
            rows=live_rows,
            notify_email=notify_email,
            cadence_hours=max(1, args.cadence_hours),
            dry_run=args.dry_run,
        )

    baseline_ids: list[str] = []
    if not args.skip_baselines:
        baseline_ids = seed_fixture_baselines(
            tenant_id=tenant_id,
            live_rows=live_rows,
            scenario_ids=list(FIXTURE_BASELINE_SCENARIOS),
            dry_run=args.dry_run,
        )

    print("\n--- Summary ---")
    print(f"Tenant: {tenant_id}")
    print(f"Allowlist domains: {', '.join(domains)}")
    print(f"Portfolio targets added: {portfolio_created}")
    print(f"Schedules created: {schedule_result.get('count', 0)} (skipped existing: {len(schedule_result.get('skipped') or [])})")
    print(f"Fixture baselines: {len(baseline_ids)}")
    print("Open https://www.qtangl.com/command-center → Overview + Monitor tabs.")
    print("Requires worker + QTANGL_ENABLE_SCHEDULER=true for live schedule ticks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
