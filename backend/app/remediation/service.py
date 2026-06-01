from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import RemediationStatus as RemediationStatusRow

VALID_STATUSES = {"open", "in_progress", "done", "accepted_risk"}


def list_remediation_status(*, tenant_id: str, scan_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = (
            session.query(RemediationStatusRow)
            .filter(
                RemediationStatusRow.tenant_id == tenant_id,
                RemediationStatusRow.scan_id == scan_id,
            )
            .all()
        )
        return [_row_to_dict(row) for row in rows]


def upsert_remediation_status(
    *,
    tenant_id: str,
    scan_id: str,
    remediation_id: str,
    status: str,
    owner: str | None = None,
    notes: str | None = None,
) -> dict[str, Any]:
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status: {status}")
    if not persistence_enabled():
        return {
            "remediationId": remediation_id,
            "scanId": scan_id,
            "status": status,
            "owner": owner,
            "notes": notes,
        }
    with db_session() as session:
        row = (
            session.query(RemediationStatusRow)
            .filter(
                RemediationStatusRow.tenant_id == tenant_id,
                RemediationStatusRow.scan_id == scan_id,
                RemediationStatusRow.remediation_id == remediation_id,
            )
            .one_or_none()
        )
        now = datetime.now(timezone.utc)
        if row is None:
            row = RemediationStatusRow(
                id=f"rem-status-{uuid.uuid4()}",
                tenant_id=tenant_id,
                scan_id=scan_id,
                remediation_id=remediation_id,
                status=status,
                owner=owner,
                notes=notes,
                updated_at=now,
            )
            session.add(row)
        else:
            row.status = status
            row.owner = owner
            row.notes = notes
            row.updated_at = now
        session.flush()
        return _row_to_dict(row)


def completion_pct(statuses: list[dict[str, Any]], total_items: int) -> float:
    if total_items <= 0:
        return 100.0
    done = sum(1 for item in statuses if item.get("status") in {"done", "accepted_risk"})
    return round(100.0 * done / total_items, 1)


def remediation_velocity(*, tenant_id: str) -> dict[str, Any]:
    """Remediation throughput summary for dashboard."""
    if not persistence_enabled():
        return {"closedCount": 0, "openCount": 0, "completionRatePct": None}
    with db_session() as session:
        rows = (
            session.query(RemediationStatusRow)
            .filter(RemediationStatusRow.tenant_id == tenant_id)
            .all()
        )
    closed = sum(1 for row in rows if row.status in {"done", "accepted_risk"})
    open_count = sum(1 for row in rows if row.status in {"open", "in_progress"})
    total = len(rows)
    rate = round(100.0 * closed / total, 1) if total else None
    return {"closedCount": closed, "openCount": open_count, "completionRatePct": rate}


def recommend_remediation_plan(item: dict[str, Any]) -> dict[str, Any]:
    severity = str(item.get("severity", "medium")).lower()
    effort = int(item.get("effortDays") or 3)
    base_weeks = max(1, round(effort / 5))
    if severity in {"critical", "high"}:
        sprint = "current"
    elif severity == "medium":
        sprint = "next"
    else:
        sprint = "backlog"
    owner = "crypto-platform" if "tls" in str(item.get("title", "")).lower() else "app-security"
    return {
        "remediationId": item.get("id"),
        "ownerTeam": owner,
        "recommendedSprint": sprint,
        "etaWeeks": base_weeks,
        "playbook": [
            "Confirm impacted endpoint and key material lineage.",
            f"Replace with {item.get('pqcAlgorithm', 'ML-KEM-768 / ML-DSA-65')} where supported.",
            "Run staged rollout with canary and interoperability checks.",
            "Re-scan and attach verification evidence to ticket.",
        ],
    }


def simulate_post_migration_readiness(
    *,
    report: dict[str, Any],
    selected_remediation_ids: list[str],
) -> dict[str, Any]:
    current = float(report.get("readinessScore", 0))
    backlog = report.get("remediationBacklog") or []
    selected = [row for row in backlog if row.get("id") in set(selected_remediation_ids)]
    severity_weight = {"critical": 2.8, "high": 2.0, "medium": 1.2, "low": 0.6}
    uplift = sum(severity_weight.get(str(row.get("severity", "medium")).lower(), 1.0) for row in selected)
    projected = min(100.0, round(current + uplift, 1))
    return {
        "currentReadinessScore": current,
        "projectedReadinessScore": projected,
        "delta": round(projected - current, 1),
        "selectedCount": len(selected),
        "assumptions": [
            "Each selected item is fully implemented and verified.",
            "No new high-severity assets are introduced during migration.",
        ],
    }


def _row_to_dict(row: RemediationStatusRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "remediationId": row.remediation_id,
        "scanId": row.scan_id,
        "status": row.status,
        "owner": row.owner,
        "notes": row.notes,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }
