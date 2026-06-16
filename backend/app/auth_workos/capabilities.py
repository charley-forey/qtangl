from __future__ import annotations

from typing import Any

from app.billing.entitlements import check_team_invites_feature


def compute_dashboard_capabilities(*, tenant_id: str, role: str) -> dict[str, bool]:
    role_l = (role or "viewer").lower()
    can_admin = role_l == "admin"
    can_write = role_l in {"admin", "operator"}
    invite_blocked = check_team_invites_feature(tenant_id=tenant_id)
    return {
        "canAdmin": can_admin,
        "canWrite": can_write,
        "canViewCompliance": True,
        "canManageKeys": can_admin,
        "canInvite": can_admin and invite_blocked is None,
    }


def compute_onboarding_hint(*, tenant_id: str) -> dict[str, Any]:
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    checklist = settings.get("firstRunChecklist") or {}
    if not checklist.get("baseline"):
        return {"complete": False, "nextStep": "baseline"}
    if not checklist.get("schedule"):
        return {"complete": False, "nextStep": "schedule"}
    if not checklist.get("invite"):
        return {"complete": False, "nextStep": "invite"}
    return {"complete": True, "nextStep": "done"}
