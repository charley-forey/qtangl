"""Partner program tier limits and entitlements."""

from __future__ import annotations

from typing import Any

from app.tenant.settings import get_tenant_settings_raw

PARTNER_TIER_LIMITS: dict[str, dict[str, Any]] = {
    "registered": {
        "maxChildren": 5,
        "portalBranding": False,
        "customDomain": False,
        "customerInvites": False,
    },
    "advanced": {
        "maxChildren": 25,
        "portalBranding": True,
        "customDomain": False,
        "customerInvites": True,
    },
    "premier": {
        "maxChildren": None,
        "portalBranding": True,
        "customDomain": True,
        "customerInvites": True,
    },
}


def partner_tier_for_tenant(*, tenant_id: str) -> str:
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    tier = str(settings.get("partnerTier") or "registered").lower().strip()
    if tier not in PARTNER_TIER_LIMITS:
        return "registered"
    return tier


def partner_tier_limits(*, tenant_id: str) -> dict[str, Any]:
    return dict(PARTNER_TIER_LIMITS[partner_tier_for_tenant(tenant_id=tenant_id)])


def merge_partner_entitlements(*, tenant_id: str, entitlements: dict[str, Any]) -> dict[str, Any]:
    """Augment subscription entitlements with partner-tier flags for MSSP parents."""
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    if str(settings.get("orgType", "")).lower() != "mssp":
        return entitlements
    tier = partner_tier_for_tenant(tenant_id=tenant_id)
    limits = PARTNER_TIER_LIMITS[tier]
    merged = dict(entitlements)
    merged["partnerTier"] = tier
    merged["maxPartnerChildren"] = limits["maxChildren"]
    merged["features"] = list(dict.fromkeys([*(merged.get("features") or []), "partner_portfolio"]))
    if limits["portalBranding"]:
        merged["features"] = list(dict.fromkeys([*merged["features"], "portal_branding"]))
    if limits["customDomain"]:
        merged["features"] = list(dict.fromkeys([*merged["features"], "custom_domain"]))
    return merged
