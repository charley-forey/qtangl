from __future__ import annotations

import logging
from typing import Any

from app.db.config import persistence_enabled

logger = logging.getLogger(__name__)
from app.db.engine import db_session
from app.db.models import TenantSubscription as SubscriptionRow

TIER_DEFAULTS: dict[str, dict[str, Any]] = {
    "free": {"maxSchedules": 0, "maxScansPerMonth": 5, "features": ["assess"]},
    "monitor": {"maxSchedules": 10, "maxScansPerMonth": 100, "features": ["assess", "monitor"]},
    "convert": {
        "maxSchedules": 25,
        "maxScansPerMonth": 500,
        "features": ["assess", "monitor", "convert", "integrations"],
    },
    "enterprise": {
        "maxSchedules": 100,
        "maxScansPerMonth": 5000,
        "features": ["assess", "monitor", "convert", "integrations", "sso", "audit"],
    },
}


def check_scan_quota(*, tenant_id: str) -> dict[str, Any] | None:
    """Return error payload if scan quota exceeded, else None."""
    ent = tenant_entitlements(tenant_id=tenant_id)
    max_scans = int(ent.get("maxScansPerMonth", 100))
    used = scans_created_this_month(tenant_id=tenant_id)
    if used >= max_scans:
        return {
            "code": "scan_quota_exceeded",
            "tier": ent.get("tier"),
            "limit": max_scans,
            "used": used,
            "upgradeUrl": "/pricing",
        }
    return None


def check_schedule_quota(*, tenant_id: str) -> dict[str, Any] | None:
    ent = tenant_entitlements(tenant_id=tenant_id)
    max_schedules = int(ent.get("maxSchedules", 10))
    from app.monitoring.service import list_schedules

    if max_schedules <= 0:
        return {
            "code": "schedule_quota_exceeded",
            "tier": ent.get("tier"),
            "limit": max_schedules,
            "used": 0,
            "upgradeUrl": "/pricing",
        }
    active = len(list_schedules(tenant_id=tenant_id))
    if active >= max_schedules:
        return {
            "code": "schedule_quota_exceeded",
            "tier": ent.get("tier"),
            "limit": max_schedules,
            "used": active,
            "upgradeUrl": "/pricing",
        }
    return None


def scans_created_this_month(*, tenant_id: str) -> int:
    from datetime import datetime, timezone

    if not persistence_enabled():
        return 0
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    from app.db.models import ScanJob as ScanJobRow

    try:
        with db_session() as session:
            return (
                session.query(ScanJobRow)
                .filter(
                    ScanJobRow.tenant_id == tenant_id,
                    ScanJobRow.created_at >= month_start,
                )
                .count()
            )
    except Exception as exc:
        logger.warning("scan quota query failed tenant_id=%s: %s", tenant_id, exc)
        return 0


def tenant_entitlements(*, tenant_id: str) -> dict[str, Any]:
    tier = "monitor"
    status = "active"
    if persistence_enabled():
        try:
            with db_session() as session:
                row = (
                    session.query(SubscriptionRow)
                    .filter(SubscriptionRow.tenant_id == tenant_id)
                    .one_or_none()
                )
                if row:
                    tier = row.tier
                    status = row.status
        except Exception as exc:
            logger.warning("tenant entitlements query failed tenant_id=%s: %s", tenant_id, exc)
    defaults = TIER_DEFAULTS.get(tier, TIER_DEFAULTS["monitor"])
    return {"tier": tier, "status": status, **defaults}


def upsert_subscription(
    *,
    tenant_id: str,
    tier: str,
    stripe_customer_id: str | None = None,
    stripe_subscription_id: str | None = None,
    status: str = "active",
) -> dict[str, Any]:
    import uuid
    from datetime import datetime, timezone

    if not persistence_enabled():
        return {"tenantId": tenant_id, "tier": tier, "status": status}
    now = datetime.now(timezone.utc)
    defaults = TIER_DEFAULTS.get(tier, TIER_DEFAULTS["monitor"])
    with db_session() as session:
        row = (
            session.query(SubscriptionRow)
            .filter(SubscriptionRow.tenant_id == tenant_id)
            .one_or_none()
        )
        if row is None:
            row = SubscriptionRow(
                id=f"sub-{uuid.uuid4().hex[:12]}",
                tenant_id=tenant_id,
                tier=tier,
                stripe_customer_id=stripe_customer_id,
                stripe_subscription_id=stripe_subscription_id,
                status=status,
                max_schedules=int(defaults["maxSchedules"]),
                max_scans_per_month=int(defaults["maxScansPerMonth"]),
                created_at=now,
                updated_at=now,
            )
            session.add(row)
        else:
            row.tier = tier
            row.status = status
            row.stripe_customer_id = stripe_customer_id or row.stripe_customer_id
            row.stripe_subscription_id = stripe_subscription_id or row.stripe_subscription_id
            row.max_schedules = int(defaults["maxSchedules"])
            row.max_scans_per_month = int(defaults["maxScansPerMonth"])
            row.updated_at = now
        session.flush()
        return {
            "tenantId": row.tenant_id,
            "tier": row.tier,
            "status": row.status,
            "maxSchedules": row.max_schedules,
            "maxScansPerMonth": row.max_scans_per_month,
        }
