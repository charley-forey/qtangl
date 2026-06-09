from __future__ import annotations

from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import HostFinding


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
    }


def current_finding_ids_for_tenant(*, tenant_id: str) -> set[str]:
    if not persistence_enabled():
        return set()
    with db_session() as session:
        rows = session.query(HostFinding.finding_id).filter(HostFinding.tenant_id == tenant_id).all()
        return {r[0] for r in rows}
