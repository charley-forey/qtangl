from __future__ import annotations

import logging
from typing import Any

from app.db.config import persistence_enabled

logger = logging.getLogger(__name__)
from app.db.engine import db_session
from app.db.models import TenantSubscription as SubscriptionRow

TIER_DEFAULTS: dict[str, dict[str, Any]] = {
    "free": {
        "maxSchedules": 0,
        "maxScansPerMonth": 5,
        "maxApiKeys": 1,
        "maxTeamInvites": 3,
        "trialScansRemaining": 1,
        "productionScansRemaining": 0,
        "features": ["assess", "team"],
    },
    "monitor": {"maxSchedules": 10, "maxScansPerMonth": 100, "maxApiKeys": 5, "maxTeamInvites": 10, "features": ["assess", "monitor", "team"]},
    "convert": {
        "maxSchedules": 25,
        "maxScansPerMonth": 500,
        "maxApiKeys": 10,
        "maxTeamInvites": 25,
        "features": ["assess", "monitor", "convert", "integrations", "team"],
    },
    "enterprise": {
        "maxSchedules": 100,
        "maxScansPerMonth": 5000,
        "maxApiKeys": None,
        "maxTeamInvites": None,
        "features": ["assess", "monitor", "convert", "integrations", "sso", "audit", "team"],
    },
}

MAX_API_KEYS_BY_TIER: dict[str, int | None] = {
    "free": 1,
    "monitor": 5,
    "convert": 10,
    "enterprise": None,
}


def check_scan_quota(*, tenant_id: str) -> dict[str, Any] | None:
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


def check_production_scan_access(*, tenant_id: str, use_fixture: bool = False) -> dict[str, Any] | None:
    """Gate live production scans: 1 free trial, then paid assess required."""
    return check_batch_production_scan_access(tenant_id=tenant_id, count=1, use_fixture=use_fixture)


def check_batch_production_scan_access(
    *,
    tenant_id: str,
    count: int,
    use_fixture: bool = False,
) -> dict[str, Any] | None:
    """Gate batch live scans against trial limits and monthly quota."""
    if use_fixture:
        return None
    if tenant_id == "sandbox":
        return None
    if count < 1:
        return {"code": "invalid_batch", "message": "At least one domain is required."}

    from app.tenant.settings import get_tenant_billing_flags

    billing = get_tenant_billing_flags(tenant_id=tenant_id)
    if billing.get("assessPaidAt"):
        ent = tenant_entitlements(tenant_id=tenant_id)
        max_scans = int(ent.get("maxScansPerMonth", 100))
        used = scans_created_this_month(tenant_id=tenant_id)
        if used + count > max_scans:
            return {
                "code": "scan_quota_exceeded",
                "tier": ent.get("tier"),
                "limit": max_scans,
                "used": used,
                "requested": count,
                "remaining": max(0, max_scans - used),
                "upgradeUrl": "/pricing",
            }
        return None

    ent = tenant_entitlements(tenant_id=tenant_id)
    trial_limit = int(ent.get("trialScansRemaining", 1))
    trial_used = int(billing.get("trialScansUsed", 0))
    trial_remaining = max(0, trial_limit - trial_used)
    if count > trial_remaining:
        if trial_remaining == 0:
            return {
                "code": "assess_payment_required",
                "tier": ent.get("tier"),
                "trialUsed": trial_used,
                "trialLimit": trial_limit,
                "requested": count,
                "upgradeUrl": "/dashboard?upgrade=assess",
                "checkoutProduct": "assess",
            }
        return {
            "code": "trial_batch_limit",
            "tier": ent.get("tier"),
            "trialRemaining": trial_remaining,
            "requested": count,
            "message": f"Trial allows {trial_remaining} more scan(s); batch requested {count}.",
            "upgradeUrl": "/dashboard?upgrade=assess",
            "checkoutProduct": "assess",
        }
    return None


def record_production_scan_usage(*, tenant_id: str, use_fixture: bool = False) -> None:
    if use_fixture or tenant_id == "sandbox":
        return
    from app.tenant.settings import get_tenant_billing_flags, patch_tenant_billing_flags

    billing = get_tenant_billing_flags(tenant_id=tenant_id)
    if billing.get("assessPaidAt"):
        return
    trial_used = int(billing.get("trialScansUsed", 0))
    patch_tenant_billing_flags(tenant_id=tenant_id, patch={"trialScansUsed": trial_used + 1})


def mark_assess_paid(*, tenant_id: str) -> dict[str, Any]:
    from datetime import datetime, timezone

    from app.tenant.settings import patch_tenant_billing_flags

    return patch_tenant_billing_flags(
        tenant_id=tenant_id,
        patch={"assessPaidAt": datetime.now(timezone.utc).isoformat()},
    )


def check_convert_feature(*, tenant_id: str) -> dict[str, Any] | None:
    """Return error payload if tenant lacks Convert-tier remediation automation."""
    ent = tenant_entitlements(tenant_id=tenant_id)
    features = list(ent.get("features") or [])
    if "convert" not in features:
        return {
            "code": "convert_tier_required",
            "tier": ent.get("tier"),
            "feature": "convert",
            "upgradeUrl": "/pricing",
        }
    return None


def check_crypto_flip_feature(
    *,
    tenant_id: str,
    surface: str | None = None,
    target_env: str = "staging",
) -> dict[str, Any] | None:
    """Return error payload if tenant cannot execute crypto flip."""
    blocked = check_convert_feature(tenant_id=tenant_id)
    if blocked:
        return blocked
    from app.tenant.settings import crypto_flip_enabled

    if not crypto_flip_enabled(tenant_id=tenant_id, surface=surface):
        return {
            "code": "crypto_flip_disabled",
            "tier": tenant_entitlements(tenant_id=tenant_id).get("tier"),
            "surface": surface,
            "upgradeUrl": "/pricing",
        }
    if surface == "kms" and target_env == "prod":
        ent = tenant_entitlements(tenant_id=tenant_id)
        if ent.get("tier") != "enterprise":
            return {
                "code": "enterprise_tier_required",
                "tier": ent.get("tier"),
                "feature": "kms_prod_flip",
                "upgradeUrl": "/pricing",
            }
    return None


def min_cadence_hours_for_tier(tier: str) -> int | None:
    """Minimum schedule cadence in hours by tier; None means schedules are not allowed."""
    return {
        "free": None,
        "monitor": 24,
        "convert": 12,
        "enterprise": 1,
    }.get(tier, 24)


def check_schedule_cadence(*, tenant_id: str, cadence_hours: int) -> dict[str, Any] | None:
    ent = tenant_entitlements(tenant_id=tenant_id)
    tier = str(ent.get("tier", "monitor"))
    minimum = min_cadence_hours_for_tier(tier)
    if minimum is None:
        return {
            "code": "schedule_cadence_not_allowed",
            "tier": tier,
            "minimumCadenceHours": None,
            "requestedCadenceHours": cadence_hours,
            "upgradeUrl": "/pricing",
        }
    if cadence_hours < minimum:
        return {
            "code": "schedule_cadence_below_minimum",
            "tier": tier,
            "minimumCadenceHours": minimum,
            "requestedCadenceHours": cadence_hours,
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


def check_sso_feature(*, tenant_id: str) -> dict[str, Any] | None:
    ent = tenant_entitlements(tenant_id=tenant_id)
    features = list(ent.get("features") or [])
    if "sso" not in features:
        return {
            "code": "sso_tier_required",
            "tier": ent.get("tier"),
            "feature": "sso",
            "upgradeUrl": "/pricing",
        }
    return None


def check_team_invites_feature(*, tenant_id: str) -> dict[str, Any] | None:
    ent = tenant_entitlements(tenant_id=tenant_id)
    features = list(ent.get("features") or [])
    if "team" not in features:
        return {
            "code": "team_tier_required",
            "tier": ent.get("tier"),
            "feature": "team",
            "upgradeUrl": "/pricing",
        }
    return None


def max_api_keys_for_tier(*, tenant_id: str) -> int | None:
    ent = tenant_entitlements(tenant_id=tenant_id)
    tier = str(ent.get("tier", "monitor"))
    limit = ent.get("maxApiKeys")
    if limit is not None:
        return int(limit)
    return MAX_API_KEYS_BY_TIER.get(tier)


def check_api_key_quota(*, tenant_id: str) -> dict[str, Any] | None:
    limit = max_api_keys_for_tier(tenant_id=tenant_id)
    if limit is None:
        return None
    from app.db.models import ApiKey as ApiKeyRow

    if not persistence_enabled():
        return None
    with db_session() as session:
        active = (
            session.query(ApiKeyRow)
            .filter(ApiKeyRow.tenant_id == tenant_id, ApiKeyRow.revoked_at.is_(None))
            .count()
        )
    if active >= limit:
        ent = tenant_entitlements(tenant_id=tenant_id)
        return {
            "code": "api_key_quota_exceeded",
            "tier": ent.get("tier"),
            "limit": limit,
            "used": active,
            "upgradeUrl": "/pricing",
        }
    return None


def check_team_invite_quota(*, tenant_id: str) -> dict[str, Any] | None:
    ent = tenant_entitlements(tenant_id=tenant_id)
    limit = ent.get("maxTeamInvites")
    if limit is None:
        return None
    limit_int = int(limit)
    if limit_int <= 0:
        return check_team_invites_feature(tenant_id=tenant_id)
    from app.db.models import TenantInvite as InviteRow

    if not persistence_enabled():
        return None
    with db_session() as session:
        pending = (
            session.query(InviteRow)
            .filter(InviteRow.tenant_id == tenant_id, InviteRow.status == "pending")
            .count()
        )
    if pending >= limit_int:
        return {
            "code": "team_invite_quota_exceeded",
            "tier": ent.get("tier"),
            "limit": limit_int,
            "used": pending,
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


def upsert_tenant_subscription(**kwargs: Any) -> dict[str, Any]:
    return upsert_subscription(**kwargs)
