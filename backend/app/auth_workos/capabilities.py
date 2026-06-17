from __future__ import annotations

from typing import Any

from app.billing.entitlements import check_team_invites_feature


def compute_dashboard_capabilities(*, tenant_id: str, role: str) -> dict[str, bool]:
    role_l = (role or "executive").lower()
    if role_l == "viewer":
        role_l = "executive"
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
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import ScanJob, ScheduledScan
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    checklist = settings.get("firstRunChecklist") or {}
    has_scans = bool(checklist.get("baseline"))
    has_schedule = bool(checklist.get("schedule"))

    if persistence_enabled():
        with db_session() as session:
            done_count = (
                session.query(ScanJob)
                .filter(ScanJob.tenant_id == tenant_id, ScanJob.status == "done")
                .count()
            )
            has_scans = has_scans or done_count > 0
            active_schedules = (
                session.query(ScheduledScan)
                .filter(ScheduledScan.tenant_id == tenant_id, ScheduledScan.active.is_(True))
                .count()
            )
            has_schedule = has_schedule or active_schedules > 0

    if not has_scans:
        return {"complete": False, "nextStep": "baseline"}
    if not has_schedule:
        return {"complete": False, "nextStep": "schedule"}
    if not checklist.get("invite"):
        return {"complete": False, "nextStep": "invite"}
    return {"complete": True, "nextStep": "done"}
