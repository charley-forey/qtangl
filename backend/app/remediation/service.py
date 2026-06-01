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
    target_date: datetime | None = None,
    asset_id: str | None = None,
    verify_scan_id: str | None = None,
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
            "targetDate": target_date.isoformat() if target_date else None,
            "assetId": asset_id,
            "verifyScanId": verify_scan_id,
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
                asset_id=asset_id,
                target_date=target_date,
                verify_scan_id=verify_scan_id,
                updated_at=now,
            )
            session.add(row)
        else:
            row.status = status
            row.owner = owner
            row.notes = notes
            if asset_id is not None:
                row.asset_id = asset_id
            if target_date is not None:
                row.target_date = target_date
            if verify_scan_id is not None:
                row.verify_scan_id = verify_scan_id
            row.updated_at = now
        session.flush()
        return _row_to_dict(row)


def apply_remediation_to_migration_report(report: Any, *, statuses: list[dict[str, Any]]) -> Any:
    """Mutate MigrationReport remediation_backlog with live workflow fields for PDF export."""
    from dataclasses import replace

    by_id = {item["remediationId"]: item for item in statuses}
    updated = []
    for item in report.remediation_backlog:
        live = by_id.get(item.id)
        if live:
            meta = dict(getattr(item, "metadata", {}) or {})
            meta["workflowStatus"] = live.get("status")
            meta["owner"] = live.get("owner")
            meta["targetDate"] = live.get("targetDate")
            meta["verifyScanId"] = live.get("verifyScanId")
            updated.append(replace(item, metadata=meta))
        else:
            updated.append(item)
    return replace(report, remediation_backlog=updated)


def merge_remediation_into_report(
    report_dict: dict[str, Any],
    *,
    statuses: list[dict[str, Any]],
) -> dict[str, Any]:
    """Overlay live remediation status onto report export payloads."""
    by_id = {item["remediationId"]: item for item in statuses}
    backlog = report_dict.get("remediationBacklog") or []
    merged = []
    for item in backlog:
        row = dict(item)
        live = by_id.get(item.get("id"))
        if live:
            row["workflowStatus"] = live.get("status")
            row["owner"] = live.get("owner")
            row["notes"] = live.get("notes")
            row["targetDate"] = live.get("targetDate")
            row["verifyScanId"] = live.get("verifyScanId")
            row["playbook"] = recommend_remediation_plan(item).get("playbook")
        merged.append(row)
    report_dict = dict(report_dict)
    report_dict["remediationBacklog"] = merged
    report_dict["remediationCompletionPct"] = completion_pct(statuses, len(backlog))
    return report_dict


def verify_remediation_fix(
    *,
    tenant_id: str,
    remediation_id: str,
    baseline_scan_id: str,
    verify_scan_id: str,
) -> dict[str, Any]:
    """Compare asset status between baseline and verification scan."""
    from app.pqc.bundle_codec import bundle_from_api_dict
    from app.store.scan_jobs import load_scan_bundle

    baseline = load_scan_bundle(baseline_scan_id, tenant_id=tenant_id)
    verify = load_scan_bundle(verify_scan_id, tenant_id=tenant_id)
    if baseline is None or verify is None:
        return {"verified": False, "reason": "scan_not_found"}

    status_row = None
    if persistence_enabled():
        with db_session() as session:
            status_row = (
                session.query(RemediationStatusRow)
                .filter(
                    RemediationStatusRow.tenant_id == tenant_id,
                    RemediationStatusRow.scan_id == baseline_scan_id,
                    RemediationStatusRow.remediation_id == remediation_id,
                )
                .one_or_none()
            )

    asset_id = status_row.asset_id if status_row and status_row.asset_id else remediation_id
    b_bundle = bundle_from_api_dict(baseline)
    v_bundle = bundle_from_api_dict(verify)
    b_assets = {a.id: a for a in b_bundle.report.assets}
    v_assets = {a.id: a for a in v_bundle.report.assets}
    before = b_assets.get(asset_id)
    after = v_assets.get(asset_id)
    if before is None or after is None:
        return {"verified": False, "reason": "asset_not_in_both_scans", "assetId": asset_id}

    before_status = before.vulnerability.status
    after_status = after.vulnerability.status
    improved = after.pqc_ready or (
        before_status in {"broken", "at-risk"} and after_status == "safe"
    )
    if improved and persistence_enabled():
        upsert_remediation_status(
            tenant_id=tenant_id,
            scan_id=baseline_scan_id,
            remediation_id=remediation_id,
            status="done",
            verify_scan_id=verify_scan_id,
            asset_id=asset_id,
        )
    return {
        "verified": improved,
        "assetId": asset_id,
        "beforeStatus": before_status,
        "afterStatus": after_status,
        "verifyScanId": verify_scan_id,
    }


def completion_pct(statuses: list[dict[str, Any]], total_items: int) -> float:
    if total_items <= 0:
        return 100.0
    done = sum(1 for item in statuses if item.get("status") in {"done", "accepted_risk"})
    return round(100.0 * done / total_items, 1)


def remediation_velocity(*, tenant_id: str) -> dict[str, Any]:
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
        "assetId": row.asset_id,
        "targetDate": row.target_date.isoformat() if row.target_date else None,
        "verifyScanId": row.verify_scan_id,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }
