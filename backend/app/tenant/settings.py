from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import TenantSettings as TenantSettingsRow
from app.security.secrets import decrypt_json_blob, encrypt_json_blob

DEFAULT_SETTINGS: dict[str, Any] = {
    "readinessDropThreshold": 5.0,
    "alertOnNewQuantumVulnerable": True,
    "certExpiryDays": 30,
    "webhookSigningSecret": "",
    "autoRetainScans": False,
    "evidenceRetentionMonths": 12,
    "benchmarkOptIn": False,
    "industry": "financial",
    "scanAllowlist": [],
    "msspParentTenantId": "",
    "orgType": "",
    "partnerTier": "registered",
    "customDomain": "",
    "customDomainVerifiedAt": None,
    "customDomainStatus": "",
    "authorizationAttestations": [],
    "discovery": {
        "hostSensor": False,
        "codeScan": False,
        "binaryScan": False,
    },
    "discoveryRetentionDays": 90,
    "driftUnifiedEnabled": True,
    "driftSnapshotRetentionDays": 365,
    "alertMode": "per_event",
    "remediationProgramEnabled": True,
    "cryptoFlipEnabled": False,
    "cryptoFlip": {
        "overlay": False,
        "clm": False,
        "kms": False,
    },
    "dashboardLayout": {
        "persona": "operator",
        "pinned": ["kpi", "trend", "digest"],
        "hidden": [],
    },
    "rolePolicies": {
        "executive": {
            "tabs": ["overview", "scans"],
            "widgets": ["kpi", "trend", "digest", "compliance"],
            "exports": ["pdf", "board"],
        },
        "viewer": {
            "tabs": ["overview", "scans"],
            "widgets": ["kpi", "trend", "digest", "compliance"],
            "exports": ["pdf"],
        },
        "operator": {
            "tabs": ["overview", "scans", "monitor", "remediate"],
            "widgets": ["kpi", "trend", "digest", "compliance", "insights", "forecast", "heatmap", "actions"],
            "exports": ["pdf", "board", "bundle"],
        },
        "admin": {
            "tabs": ["*"],
            "widgets": ["*"],
            "exports": ["*"],
        },
        "partner_admin": {
            "tabs": ["*"],
            "widgets": ["*"],
            "exports": ["*"],
        },
        "partner_analyst": {
            "tabs": ["overview", "scans", "monitor", "remediate", "portfolio"],
            "widgets": ["kpi", "trend", "digest", "compliance", "insights", "forecast", "heatmap", "actions"],
            "exports": ["pdf", "board", "bundle"],
        },
        "customer_executive": {
            "tabs": ["overview", "scans"],
            "widgets": ["kpi", "trend", "digest", "compliance"],
            "exports": ["pdf", "board"],
        },
        "customer_viewer": {
            "tabs": ["overview", "scans"],
            "widgets": ["kpi", "trend", "digest"],
            "exports": ["pdf"],
        },
    },
    "weeklyDigestEnabled": False,
    "weeklyDigestRecipients": [],
    "weeklyDigestDayOfWeek": 1,
    "lastWeeklyDigestAt": None,
    "lastBoardExportAt": None,
    "boardExportSchedule": {
        "enabled": False,
        "cadenceDays": 7,
        "recipients": [],
        "format": "board",
    },
    "reportBranding": {
        "companyName": "",
        "logoUrl": "",
        "primaryColor": "",
        "footerText": "",
        "supportEmail": "",
        "partnerDisplayName": "",
    },
    "portalBranding": {
        "headerText": "",
        "logoUrl": "",
        "primaryColor": "",
        "accentColor": "",
        "partnerDisplayName": "",
    },
    "notificationReadIds": [],
    "billing": {
        "trialScansUsed": 0,
        "assessPaidAt": None,
        "termsAcceptedAt": None,
        "termsVersion": None,
        "scanAuthorizationAt": None,
    },
    "onboarding": {
        "step": "company",
        "dismissed": False,
        "complete": False,
        "toursCompleted": [],
    },
    "coaching": {
        "phase": "first_run",
        "milestones": {},
        "bannersDismissed": [],
        "dripOptOut": False,
        "dripSent": [],
    },
    "dismissedRecommendations": [],
    "lastRecommendationRunAt": None,
    "salesLed": False,
    "termsVersionRequired": "2026-06-08",
    "lastBoardMeetingAt": None,
}


def drift_unified_enabled(*, tenant_id: str) -> bool:
    import os

    if os.environ.get("DRIFT_UNIFIED_ENABLED", "true").lower() in ("0", "false", "no"):
        return False
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    return bool(settings.get("driftUnifiedEnabled", True))


def crypto_flip_enabled(*, tenant_id: str, surface: str | None = None) -> bool:
    import os

    if os.environ.get("CRYPTO_FLIP_ENABLED", "false").lower() not in ("1", "true", "yes"):
        return False
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    if not bool(settings.get("cryptoFlipEnabled", False)):
        return False
    if surface is None:
        return True
    flip_cfg = settings.get("cryptoFlip") or {}
    return bool(flip_cfg.get(surface, False))


def remediation_program_enabled(*, tenant_id: str) -> bool:
    import os

    if os.environ.get("REMEDIATION_PROGRAM_ENABLED", "true").lower() in ("0", "false", "no"):
        return False
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    return bool(settings.get("remediationProgramEnabled", True))


def discovery_feature_enabled(*, tenant_id: str, feature: str) -> bool:
    """Check tenant discovery feature flag (hostSensor, codeScan, binaryScan)."""
    import os

    if os.environ.get("QTANGL_DISCOVERY_ENABLE_ALL", "").lower() in ("1", "true", "yes"):
        return True
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    discovery = settings.get("discovery") or {}
    return bool(discovery.get(feature))


def get_tenant_settings(*, tenant_id: str) -> dict[str, Any]:
    if not persistence_enabled():
        return dict(DEFAULT_SETTINGS)
    with db_session() as session:
        row = session.get(TenantSettingsRow, tenant_id)
        if row is None:
            return dict(DEFAULT_SETTINGS)
        data = decrypt_json_blob(row.settings_json or "{}")
        merged = dict(DEFAULT_SETTINGS)
        merged.update(data)
        if merged.get("webhookSigningSecret"):
            merged["webhookSigningSecret"] = "***"
        return merged


def upsert_tenant_settings(*, tenant_id: str, settings: dict[str, Any]) -> dict[str, Any]:
    if not persistence_enabled():
        return settings
    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = session.query(TenantSettingsRow).filter_by(tenant_id=tenant_id).with_for_update().one_or_none()
        existing = dict(DEFAULT_SETTINGS)
        if row is not None:
            existing.update(decrypt_json_blob(row.settings_json or "{}"))
        merged = dict(existing)
        for key, value in settings.items():
            if key == "webhookSigningSecret" and value in ("", "***"):
                continue
            merged[key] = value
        digest_was_enabled = bool(existing.get("weeklyDigestEnabled"))
        stored = encrypt_json_blob(merged)
        if row is None:
            row = TenantSettingsRow(tenant_id=tenant_id, settings_json=stored, updated_at=now)
            session.add(row)
        else:
            row.settings_json = stored
            row.updated_at = now
        session.flush()
        if not digest_was_enabled and bool(merged.get("weeklyDigestEnabled")):
            try:
                from app.coaching.milestones import record_milestone

                record_milestone(tenant_id=tenant_id, name="digestEnabledAt")
            except Exception:
                pass
        response = dict(merged)
        if response.get("webhookSigningSecret"):
            response["webhookSigningSecret"] = "***"
        return response


def get_tenant_settings_raw(*, tenant_id: str) -> dict[str, Any]:
    """Internal use — includes decrypted webhook signing secret."""
    if not persistence_enabled():
        return dict(DEFAULT_SETTINGS)
    with db_session() as session:
        row = session.get(TenantSettingsRow, tenant_id)
        if row is None:
            return dict(DEFAULT_SETTINGS)
        data = decrypt_json_blob(row.settings_json or "{}")
        merged = dict(DEFAULT_SETTINGS)
        merged.update(data)
        return merged


def get_tenant_scan_allowlist(*, tenant_id: str) -> list[str]:
    from app.pqc.safety import normalize_host

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    raw = settings.get("scanAllowlist") or []
    if not isinstance(raw, list):
        return []
    normalized: list[str] = []
    for item in raw:
        if not item:
            continue
        host = normalize_host(str(item))
        if host and host not in normalized:
            normalized.append(host)
    return normalized


def set_tenant_scan_allowlist(
    *,
    tenant_id: str,
    domains: list[str],
) -> list[str]:
    from app.pqc.safety import normalize_host

    cleaned: list[str] = []
    for item in domains:
        host = normalize_host(str(item).strip())
        if host and host not in cleaned:
            cleaned.append(host)
    upsert_tenant_settings(tenant_id=tenant_id, settings={"scanAllowlist": cleaned})
    return cleaned


def append_tenant_scan_allowlist(*, tenant_id: str, domain: str) -> list[str]:
    from app.pqc.safety import normalize_host

    host = normalize_host(domain.strip())
    if not host:
        raise ValueError("Domain is required.")
    current = get_tenant_scan_allowlist(tenant_id=tenant_id)
    if host in current:
        return current
    return set_tenant_scan_allowlist(tenant_id=tenant_id, domains=[*current, host])


def remove_tenant_scan_allowlist(*, tenant_id: str, domain: str) -> list[str]:
    from app.pqc.safety import normalize_host

    host = normalize_host(domain.strip())
    if not host:
        raise ValueError("Domain is required.")
    current = get_tenant_scan_allowlist(tenant_id=tenant_id)
    return set_tenant_scan_allowlist(tenant_id=tenant_id, domains=[item for item in current if item != host])


def append_tenant_scan_allowlist_many(*, tenant_id: str, domains: list[str]) -> list[str]:
    from app.pqc.safety import normalize_host

    current = get_tenant_scan_allowlist(tenant_id=tenant_id)
    merged = list(current)
    for domain in domains:
        host = normalize_host(str(domain).strip())
        if not host:
            continue
        if host not in merged:
            merged.append(host)
    return set_tenant_scan_allowlist(tenant_id=tenant_id, domains=merged)


def get_tenant_billing_flags(*, tenant_id: str) -> dict[str, Any]:
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    billing = settings.get("billing") or {}
    if not isinstance(billing, dict):
        billing = {}
    defaults = DEFAULT_SETTINGS.get("billing") or {}
    merged = {**defaults, **billing}
    return merged


def patch_tenant_billing_flags(*, tenant_id: str, patch: dict[str, Any]) -> dict[str, Any]:
    current = get_tenant_billing_flags(tenant_id=tenant_id)
    current.update(patch)
    upsert_tenant_settings(tenant_id=tenant_id, settings={"billing": current})
    return current


def get_tenant_onboarding_state(*, tenant_id: str) -> dict[str, Any]:
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    onboarding = settings.get("onboarding") or {}
    if not isinstance(onboarding, dict):
        onboarding = {}
    defaults = DEFAULT_SETTINGS.get("onboarding") or {}
    return {**defaults, **onboarding}


def patch_tenant_onboarding_state(*, tenant_id: str, patch: dict[str, Any]) -> dict[str, Any]:
    current = get_tenant_onboarding_state(tenant_id=tenant_id)
    current.update(patch)
    upsert_tenant_settings(tenant_id=tenant_id, settings={"onboarding": current})
    return current
