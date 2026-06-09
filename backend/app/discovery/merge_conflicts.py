"""Record discovery ingest merge conflicts for operator review."""

from __future__ import annotations

import json
import uuid
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import MergeConflict


def record_discovery_conflict(
    *,
    tenant_id: str,
    component_key: str,
    field: str,
    value_a: str,
    value_b: str,
    source_a: str,
    source_b: str,
) -> None:
    if not persistence_enabled():
        return
    with db_session() as session:
        existing = (
            session.query(MergeConflict)
            .filter(
                MergeConflict.tenant_id == tenant_id,
                MergeConflict.component_key == component_key,
                MergeConflict.status == "open",
            )
            .first()
        )
        if existing:
            return
        row = MergeConflict(
            id=f"dc-{uuid.uuid4().hex[:12]}",
            tenant_id=tenant_id,
            component_key=component_key,
            field=field,
            value_a=value_a,
            value_b=value_b,
            source_a=source_a,
            source_b=source_b,
            status="open",
        )
        session.add(row)
        session.flush()


def conflicts_from_finding_updates(
    *,
    tenant_id: str,
    agent_id: str,
    new_findings: list[dict[str, Any]],
) -> int:
    """Surface algorithm conflicts when same location reports different algorithms."""
    if not persistence_enabled():
        return 0
    from app.db.models import HostFinding

    recorded = 0
    with db_session() as session:
        for finding in new_findings:
            location = str(finding.get("location") or "")
            if not location:
                continue
            algo = str(finding.get("algorithm") or "")
            prior = (
                session.query(HostFinding)
                .filter(
                    HostFinding.tenant_id == tenant_id,
                    HostFinding.agent_id == agent_id,
                    HostFinding.raw_json.contains(location),
                )
                .first()
            )
            if prior is None:
                continue
            try:
                old = json.loads(prior.raw_json)
            except json.JSONDecodeError:
                continue
            old_algo = str(old.get("algorithm") or "")
            if old_algo and algo and old_algo != algo:
                record_discovery_conflict(
                    tenant_id=tenant_id,
                    component_key=f"{agent_id}:{location}",
                    field="algorithm",
                    value_a=old_algo,
                    value_b=algo,
                    source_a="prior_scan",
                    source_b="current_scan",
                )
                recorded += 1
    return recorded
