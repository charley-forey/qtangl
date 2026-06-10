from __future__ import annotations

from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import HostFinding
from app.monitoring.drift_snapshots import get_latest_snapshots
from app.monitoring.unified_diff import UnifiedDiffService


def diff_host_findings(
    *,
    tenant_id: str,
    previous_finding_ids: set[str],
    current_finding_ids: set[str],
) -> dict[str, Any]:
    added = sorted(current_finding_ids - previous_finding_ids)
    removed = sorted(previous_finding_ids - current_finding_ids)
    return {
        "addedCount": len(added),
        "removedCount": len(removed),
        "addedFindingIds": added[:100],
        "removedFindingIds": removed[:100],
        "unchangedCount": len(current_finding_ids & previous_finding_ids),
        "hasBaseline": bool(previous_finding_ids),
    }


def current_finding_ids_for_tenant(*, tenant_id: str) -> set[str]:
    if not persistence_enabled():
        return set()
    with db_session() as session:
        rows = session.query(HostFinding.finding_id).filter(HostFinding.tenant_id == tenant_id).all()
        return {r[0] for r in rows}


def baseline_finding_ids_from_snapshot(*, tenant_id: str, scope_key: str = "fleet") -> set[str]:
    snaps = get_latest_snapshots(tenant_id=tenant_id, source_type="host", scope_key=scope_key, limit=2)
    if len(snaps) < 2:
        if len(snaps) == 1:
            payload = snaps[0].get("payload") or {}
            return set(payload.get("findingIds") or [])
        return set()
    payload = snaps[1].get("payload") or {}
    return set(payload.get("findingIds") or [])


def host_drift_for_tenant(*, tenant_id: str, scope_key: str = "fleet") -> dict[str, Any]:
    current = current_finding_ids_for_tenant(tenant_id=tenant_id)
    unified = UnifiedDiffService.compute_delta(tenant_id=tenant_id, source_type="host", scope_key=scope_key)
    if unified.get("hasBaseline"):
        return {
            "currentCount": len(current),
            "scopeKey": scope_key,
            "unified": unified,
            **{k: unified.get(k) for k in ("addedCount", "removedCount", "addedIds", "removedIds", "unchangedCount", "hasBaseline")},
        }
    baseline = baseline_finding_ids_from_snapshot(tenant_id=tenant_id, scope_key=scope_key)
    diff = diff_host_findings(
        tenant_id=tenant_id,
        previous_finding_ids=baseline,
        current_finding_ids=current,
    )
    return {"currentCount": len(current), "scopeKey": scope_key, **diff}
