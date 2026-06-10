from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.audit.service import log_action
from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import RemediationProgramItem, RemediationStatus
from app.tenant.settings import remediation_program_enabled

VALID_STATUSES = frozenset({"open", "in_progress", "done", "accepted_risk"})


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _row_to_dict(row: RemediationProgramItem) -> dict[str, Any]:
    return {
        "id": row.id,
        "tenantId": row.tenant_id,
        "sourceType": row.source_type,
        "sourceRef": row.source_ref,
        "scanId": row.scan_id,
        "remediationId": row.remediation_id,
        "assetId": row.asset_id,
        "title": row.title,
        "status": row.status,
        "owner": row.owner,
        "notes": row.notes,
        "targetDate": row.target_date.isoformat() if row.target_date else None,
        "verifyJobId": row.verify_job_id,
        "externalSyncId": row.external_sync_id,
        "deepLink": row.deep_link,
        "flipJobId": row.flip_job_id,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }


def list_program_items(
    *,
    tenant_id: str,
    status: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[dict[str, Any]], int]:
    if not persistence_enabled() or not remediation_program_enabled(tenant_id=tenant_id):
        return [], 0
    with db_session() as session:
        q = session.query(RemediationProgramItem).filter(RemediationProgramItem.tenant_id == tenant_id)
        if status:
            q = q.filter(RemediationProgramItem.status == status)
        total = q.count()
        rows = q.order_by(RemediationProgramItem.updated_at.desc()).offset(offset).limit(limit).all()
        return [_row_to_dict(r) for r in rows], total


def get_program_item(*, tenant_id: str, item_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = session.get(RemediationProgramItem, item_id)
        if row is None or row.tenant_id != tenant_id:
            return None
        return _row_to_dict(row)


def upsert_program_item(
    *,
    tenant_id: str,
    source_type: str,
    source_ref: str,
    title: str = "",
    scan_id: str | None = None,
    remediation_id: str | None = None,
    asset_id: str | None = None,
    deep_link: str | None = None,
    status: str = "open",
    owner: str | None = None,
    notes: str | None = None,
    target_date: datetime | None = None,
    actor: str = "system",
) -> dict[str, Any]:
    if not persistence_enabled():
        return {"id": f"prog-mem-{source_ref}", "status": status}
    now = _utcnow()
    with db_session() as session:
        row = (
            session.query(RemediationProgramItem)
            .filter(
                RemediationProgramItem.tenant_id == tenant_id,
                RemediationProgramItem.source_type == source_type,
                RemediationProgramItem.source_ref == source_ref,
            )
            .first()
        )
        if row is None:
            row = RemediationProgramItem(
                id=f"prog-{uuid.uuid4().hex[:12]}",
                tenant_id=tenant_id,
                source_type=source_type,
                source_ref=source_ref,
                title=title or source_ref,
                scan_id=scan_id,
                remediation_id=remediation_id,
                asset_id=asset_id,
                deep_link=deep_link,
                status=status if status in VALID_STATUSES else "open",
                owner=owner,
                notes=notes,
                target_date=target_date,
                created_at=now,
                updated_at=now,
            )
            session.add(row)
        else:
            if title:
                row.title = title
            if scan_id:
                row.scan_id = scan_id
            if remediation_id:
                row.remediation_id = remediation_id
            if asset_id:
                row.asset_id = asset_id
            if deep_link:
                row.deep_link = deep_link
            row.updated_at = now
        session.flush()
        return _row_to_dict(row)


def update_program_item(
    *,
    tenant_id: str,
    item_id: str,
    status: str | None = None,
    owner: str | None = None,
    notes: str | None = None,
    target_date: datetime | None = None,
    actor: str = "api",
) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = session.get(RemediationProgramItem, item_id)
        if row is None or row.tenant_id != tenant_id:
            return None
        if status == "accepted_risk" and not (notes or row.notes):
            raise ValueError("accepted_risk_requires_note")
        prev_status = row.status
        if status and status in VALID_STATUSES:
            row.status = status
        if owner is not None:
            row.owner = owner or None
        if notes is not None:
            row.notes = notes or None
        if target_date is not None:
            row.target_date = target_date
        row.updated_at = _utcnow()
        session.flush()
        log_action(
            tenant_id=tenant_id,
            action="remediation.status_changed",
            resource_id=item_id,
            actor=actor,
            detail={"from": prev_status, "to": row.status},
        )
        return _row_to_dict(row)


def program_velocity(*, tenant_id: str) -> dict[str, Any]:
    items, total = list_program_items(tenant_id=tenant_id, limit=10000)
    if not total:
        return {"total": 0, "done": 0, "completionPct": 0.0, "itemsPerWeek": 0.0}
    done = sum(1 for i in items if i.get("status") == "done")
    in_progress = sum(1 for i in items if i.get("status") == "in_progress")
    return {
        "total": total,
        "done": done,
        "inProgress": in_progress,
        "completionPct": round(100.0 * done / total, 1),
        "itemsPerWeek": round(done / max(1, total / 52), 1),
    }


def migrate_legacy_remediation_status(*, tenant_id: str) -> int:
    if not persistence_enabled():
        return 0
    migrated = 0
    with db_session() as session:
        rows = session.query(RemediationStatus).filter(RemediationStatus.tenant_id == tenant_id).all()
        for r in rows:
            upsert_program_item(
                tenant_id=tenant_id,
                source_type="external",
                source_ref=r.remediation_id,
                title=r.remediation_id,
                scan_id=r.scan_id,
                remediation_id=r.remediation_id,
                asset_id=r.asset_id,
                status=r.status,
                owner=r.owner,
                notes=r.notes,
                target_date=r.target_date,
            )
            migrated += 1
    return migrated


def ingest_from_scan_bundle(
    *,
    tenant_id: str,
    scan_id: str,
    backlog: list[dict[str, Any]],
) -> int:
    if not remediation_program_enabled(tenant_id=tenant_id):
        return 0
    count = 0
    for item in backlog:
        rid = str(item.get("id") or item.get("remediationId") or "")
        if not rid:
            continue
        upsert_program_item(
            tenant_id=tenant_id,
            source_type="external",
            source_ref=rid,
            title=str(item.get("title") or rid),
            scan_id=scan_id,
            remediation_id=rid,
            asset_id=item.get("assetId") or item.get("asset_id"),
        )
        count += 1
    return count


def ingest_from_discovery_result(
    *,
    tenant_id: str,
    job_id: str,
    job_type: str,
    result: dict[str, Any],
) -> int:
    if not remediation_program_enabled(tenant_id=tenant_id):
        return 0
    source_map = {
        "host_fleet_scan": "host_finding",
        "code_scan": "code_finding",
        "binary_scan": "binary_finding",
    }
    source_type = source_map.get(job_type)
    if not source_type:
        return 0
    findings = result.get("findings") or result.get("hostFindings") or []
    count = 0
    for f in findings:
        if not isinstance(f, dict):
            continue
        fid = str(f.get("findingId") or f.get("id") or "")
        if not fid:
            continue
        upsert_program_item(
            tenant_id=tenant_id,
            source_type=source_type,
            source_ref=fid,
            title=str(f.get("title") or f.get("summary") or fid),
            deep_link=f"/dashboard?discoveryJob={job_id}",
        )
        count += 1
    return count
