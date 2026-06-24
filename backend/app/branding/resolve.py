from __future__ import annotations

from typing import Any

from app.tenant.settings import DEFAULT_SETTINGS, get_tenant_settings_raw


def _non_empty(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    return bool(value)


def _merge_branding_dict(parent: dict[str, Any], child: dict[str, Any]) -> dict[str, Any]:
    """Parent defaults with child overrides for non-empty values."""
    merged = dict(parent)
    for key, value in child.items():
        if not _non_empty(value):
            continue
        if isinstance(value, str):
            merged[key] = value.strip()
        else:
            merged[key] = value
    return merged


def _branding_block(settings: dict[str, Any], key: str) -> dict[str, Any]:
    defaults = DEFAULT_SETTINGS.get(key) or {}
    current = settings.get(key) or {}
    if not isinstance(current, dict):
        current = {}
    return {**defaults, **current}


def resolve_branding(tenant_id: str) -> dict[str, Any]:
    """Merge child reportBranding/portalBranding with MSSP parent when configured."""
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    report_branding = _branding_block(settings, "reportBranding")
    portal_branding = _branding_block(settings, "portalBranding")

    parent_id = str(settings.get("msspParentTenantId") or "").strip()
    if parent_id and parent_id != tenant_id:
        parent_settings = get_tenant_settings_raw(tenant_id=parent_id)
        parent_report = _branding_block(parent_settings, "reportBranding")
        parent_portal = _branding_block(parent_settings, "portalBranding")
        report_branding = _merge_branding_dict(parent_report, report_branding)
        portal_branding = _merge_branding_dict(parent_portal, portal_branding)

    return {
        "reportBranding": report_branding,
        "portalBranding": portal_branding,
    }


def resolved_report_branding(tenant_id: str) -> dict[str, Any]:
    return resolve_branding(tenant_id)["reportBranding"]
