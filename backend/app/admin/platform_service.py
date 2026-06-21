from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func

from app.billing.entitlements import scans_created_this_month, tenant_entitlements, upsert_tenant_subscription
from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import Tenant, TenantInvite, TenantMembership, User
from app.monitoring.service import list_schedules, scheduler_enabled
from app.store.scan_jobs import list_jobs_for_tenant
from app.tenant.settings import get_tenant_billing_flags, get_tenant_settings_raw
from app.tenants.service import list_tenant_keys


def _tier_counts(tenant_ids: list[str]) -> dict[str, int]:
    counts: dict[str, int] = {"free": 0, "monitor": 0, "convert": 0, "enterprise": 0, "unknown": 0}
    for tenant_id in tenant_ids:
        ent = tenant_entitlements(tenant_id=tenant_id)
        tier = str(ent.get("tier") or "unknown")
        counts[tier] = counts.get(tier, 0) + 1
    return counts


def platform_summary() -> dict[str, Any]:
    if not persistence_enabled():
        return {
            "status": "success",
            "totals": {
                "tenants": 0,
                "users": 0,
                "scansLast30Days": 0,
                "signupsLast7Days": 0,
                "signupsLast30Days": 0,
            },
            "tierBreakdown": {},
            "schedulerEnabled": scheduler_enabled(),
        }

    now = datetime.now(timezone.utc)
    cutoff_7 = now - timedelta(days=7)
    cutoff_30 = now - timedelta(days=30)

    with db_session() as session:
        tenant_rows = session.query(Tenant.id, Tenant.created_at).all()
        user_count = session.query(func.count(User.id)).scalar() or 0

    tenant_ids = [row[0] for row in tenant_rows]
    signups_7 = 0
    signups_30 = 0
    scans_30 = 0
    for tenant_id, created in tenant_rows:
        if created and created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if created and created >= cutoff_7:
            signups_7 += 1
        if created and created >= cutoff_30:
            signups_30 += 1
        for scan in list_jobs_for_tenant(tenant_id=tenant_id, limit=200):
            created_at = scan.get("createdAt")
            if not created_at:
                continue
            try:
                ts = datetime.fromisoformat(str(created_at).replace("Z", "+00:00"))
            except ValueError:
                continue
            if ts >= cutoff_30:
                scans_30 += 1

    return {
        "status": "success",
        "totals": {
            "tenants": len(tenant_ids),
            "users": int(user_count),
            "scansLast30Days": scans_30,
            "signupsLast7Days": signups_7,
            "signupsLast30Days": signups_30,
        },
        "tierBreakdown": _tier_counts(tenant_ids),
        "schedulerEnabled": scheduler_enabled(),
    }


def _tenant_row_summary(*, tenant_id: str, name: str, created_at: datetime | None) -> dict[str, Any]:
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    billing = settings.get("billing") or {}
    ent = tenant_entitlements(tenant_id=tenant_id)
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=1)
    last_scan_at = scans[0].get("createdAt") if scans else None
    with db_session() as session:
        member_count = (
            session.query(func.count(TenantMembership.id))
            .filter(TenantMembership.tenant_id == tenant_id)
            .scalar()
            or 0
        )
    return {
        "tenantId": tenant_id,
        "name": name,
        "tier": ent.get("tier"),
        "createdAt": created_at.isoformat() if created_at else None,
        "memberCount": int(member_count),
        "scansThisMonth": scans_created_this_month(tenant_id=tenant_id),
        "lastScanAt": last_scan_at,
        "assessPaid": bool(billing.get("assessPaidAt")),
        "scheduleCount": len(list_schedules(tenant_id=tenant_id)),
        "orgType": settings.get("orgType"),
    }


def list_tenants_admin(
    *,
    search: str | None = None,
    tier: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict[str, Any]:
    if not persistence_enabled():
        return {"status": "success", "tenants": [], "total": 0, "limit": limit, "offset": offset}

    with db_session() as session:
        query = session.query(Tenant).order_by(Tenant.created_at.desc())
        if search:
            needle = f"%{search.strip().lower()}%"
            query = query.filter(
                (func.lower(Tenant.id).like(needle)) | (func.lower(Tenant.name).like(needle))
            )
        rows = [(row.id, row.name, row.created_at) for row in query.all()]

    summaries = [
        _tenant_row_summary(tenant_id=tenant_id, name=name, created_at=created_at)
        for tenant_id, name, created_at in rows
    ]
    if tier:
        summaries = [row for row in summaries if row.get("tier") == tier]
    total = len(summaries)
    page = summaries[offset : offset + limit]
    return {"status": "success", "tenants": page, "total": total, "limit": limit, "offset": offset}


def get_tenant_detail_admin(*, tenant_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        tenant = session.get(Tenant, tenant_id)
        if tenant is None:
            return None
        tenant_name = tenant.name
        auth_mode = tenant.auth_mode
        workos_org_id = tenant.workos_org_id
        created_at = tenant.created_at
        memberships = (
            session.query(TenantMembership, User)
            .join(User, TenantMembership.user_id == User.id)
            .filter(TenantMembership.tenant_id == tenant_id)
            .all()
        )
        membership_payload = [
            {
                "membershipId": membership.id,
                "userId": user.id,
                "email": user.email,
                "name": user.name,
                "role": membership.role,
                "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
            }
            for membership, user in memberships
        ]
        invites = session.query(TenantInvite).filter(TenantInvite.tenant_id == tenant_id).all()
        invite_payload = [
            {
                "inviteId": invite.id,
                "email": invite.email,
                "role": invite.role,
                "createdAt": invite.created_at.isoformat() if invite.created_at else None,
            }
            for invite in invites
        ]

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    billing = get_tenant_billing_flags(tenant_id=tenant_id)
    ent = tenant_entitlements(tenant_id=tenant_id)
    recent_scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=5)

    return {
        "status": "success",
        "tenantId": tenant_id,
        "name": tenant_name,
        "authMode": auth_mode,
        "workosOrgId": workos_org_id,
        "createdAt": created_at.isoformat() if created_at else None,
        "subscription": ent,
        "billing": billing,
        "settings": {
            "scanAllowlist": settings.get("scanAllowlist") or [],
            "orgType": settings.get("orgType"),
            "msspParentTenantId": settings.get("msspParentTenantId"),
        },
        "memberships": membership_payload,
        "pendingInvites": invite_payload,
        "apiKeys": list_tenant_keys(tenant_id=tenant_id),
        "recentScans": recent_scans,
        "scansThisMonth": scans_created_this_month(tenant_id=tenant_id),
        "scheduleCount": len(list_schedules(tenant_id=tenant_id)),
    }


def list_users_admin(*, search: str | None = None, limit: int = 50, offset: int = 0) -> dict[str, Any]:
    if not persistence_enabled():
        return {"status": "success", "users": [], "total": 0, "limit": limit, "offset": offset}

    with db_session() as session:
        query = session.query(User).order_by(User.created_at.desc())
        if search:
            needle = f"%{search.strip().lower()}%"
            query = query.filter(func.lower(User.email).like(needle))
        users = [
            {
                "userId": user.id,
                "email": user.email,
                "name": user.name,
                "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
                "createdAt": user.created_at.isoformat() if user.created_at else None,
            }
            for user in query.all()
        ]
        membership_rows = session.query(TenantMembership, Tenant).join(Tenant, TenantMembership.tenant_id == Tenant.id).all()
        memberships_by_user: dict[str, list[dict[str, Any]]] = {}
        for membership, tenant in membership_rows:
            memberships_by_user.setdefault(membership.user_id, []).append(
                {"tenantId": tenant.id, "tenantName": tenant.name, "role": membership.role}
            )

    payload = [{**user, "memberships": memberships_by_user.get(user["userId"], [])} for user in users]
    total = len(payload)
    page = payload[offset : offset + limit]
    return {"status": "success", "users": page, "total": total, "limit": limit, "offset": offset}


def patch_tenant_tier_admin(*, tenant_id: str, tier: str) -> dict[str, Any]:
    if not persistence_enabled():
        raise RuntimeError("DATABASE_URL required")
    with db_session() as session:
        if session.get(Tenant, tenant_id) is None:
            raise ValueError(f"Unknown tenant: {tenant_id}")
    subscription = upsert_tenant_subscription(tenant_id=tenant_id, tier=tier)
    return {"status": "success", "tenantId": tenant_id, "subscription": subscription}
