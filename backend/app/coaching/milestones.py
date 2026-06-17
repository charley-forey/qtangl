from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

MILESTONE_NAMES = frozenset(
    {
        "firstScanAt",
        "assessPaidAt",
        "firstScheduleAt",
        "firstVerifyAt",
        "firstBoardExportAt",
        "digestEnabledAt",
    }
)


def get_milestones(*, tenant_id: str) -> dict[str, Any]:
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    coaching = settings.get("coaching") or {}
    milestones = coaching.get("milestones") or {}
    return milestones if isinstance(milestones, dict) else {}


def record_milestone(*, tenant_id: str, name: str) -> None:
    if name not in MILESTONE_NAMES:
        return
    current = get_milestones(tenant_id=tenant_id)
    if current.get(name):
        return
    from app.tenant.settings import get_tenant_settings_raw, upsert_tenant_settings

    now = datetime.now(timezone.utc).isoformat()
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    coaching = settings.get("coaching") or {}
    if not isinstance(coaching, dict):
        coaching = {}
    milestones = {**current, name: now}
    upsert_tenant_settings(
        tenant_id=tenant_id,
        settings={"coaching": {**coaching, "milestones": milestones}},
    )
