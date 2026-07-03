from __future__ import annotations

from typing import Any


def check_legal_acceptance(*, tenant_id: str) -> dict[str, Any] | None:
    """Return error payload when terms acceptance is missing or stale."""
    if tenant_id == "sandbox":
        return None
    from app.tenant.settings import get_tenant_billing_flags, get_tenant_settings_raw

    billing = get_tenant_billing_flags(tenant_id=tenant_id)
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    terms_required = str(settings.get("termsVersionRequired") or "2026-06-08")
    accepted_at = billing.get("termsAcceptedAt")
    accepted_version = billing.get("termsVersion")
    if not accepted_at or str(accepted_version or "") != terms_required:
        return {
            "code": "legal_acceptance_required",
            "termsVersionRequired": terms_required,
            "termsAcceptedVersion": accepted_version,
            "upgradeUrl": "/command-center?tab=scans",
        }
    return None
