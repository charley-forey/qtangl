from __future__ import annotations

import hashlib
import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import DriftSnapshot
from app.tenant.settings import drift_unified_enabled, get_tenant_settings_raw

logger = logging.getLogger(__name__)

SOURCE_TYPES = frozenset({"external", "host", "code", "binary", "cbom"})


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_payload(payload: dict[str, Any]) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def compute_snapshot_hash(payload: dict[str, Any]) -> str:
    normalized = _normalize_payload(payload)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def record_drift_snapshot(
    *,
    tenant_id: str,
    source_type: str,
    scope_key: str,
    payload: dict[str, Any],
    job_id: str | None = None,
    scan_id: str | None = None,
    captured_at: datetime | None = None,
) -> str | None:
    """Persist a drift snapshot. Returns snapshot id or None if skipped/failed."""
    if source_type not in SOURCE_TYPES:
        raise ValueError(f"invalid source_type: {source_type}")
    if not drift_unified_enabled(tenant_id=tenant_id):
        return None
    if not persistence_enabled():
        return None

    snapshot_hash = compute_snapshot_hash(payload)
    snap_id = f"dsnap-{uuid.uuid4().hex[:12]}"
    when = captured_at or _utcnow()

    try:
        with db_session() as session:
            row = DriftSnapshot(
                id=snap_id,
                tenant_id=tenant_id,
                source_type=source_type,
                scope_key=scope_key[:512],
                snapshot_hash=snapshot_hash,
                payload_json=_normalize_payload(payload),
                job_id=job_id,
                scan_id=scan_id,
                captured_at=when,
                created_at=_utcnow(),
            )
            session.add(row)
            session.flush()
        try:
            from app.monitoring.metrics import increment_drift_snapshot

            increment_drift_snapshot(tenant_id=tenant_id, source_type=source_type)
        except Exception:
            pass
        return snap_id
    except Exception as exc:
        logger.warning("drift snapshot write failed: %s", exc)
        try:
            from app.monitoring.metrics import increment_drift_snapshot_error

            increment_drift_snapshot_error(source_type=source_type)
        except Exception:
            pass
        return None


def get_latest_snapshots(
    *,
    tenant_id: str,
    source_type: str,
    scope_key: str,
    limit: int = 2,
) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = (
            session.query(DriftSnapshot)
            .filter(
                DriftSnapshot.tenant_id == tenant_id,
                DriftSnapshot.source_type == source_type,
                DriftSnapshot.scope_key == scope_key,
            )
            .order_by(DriftSnapshot.captured_at.desc())
            .limit(limit)
            .all()
        )
        return [_row_to_dict(r) for r in rows]


def list_snapshots_for_tenant(
    *,
    tenant_id: str,
    since: datetime | None = None,
    source_type: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        q = session.query(DriftSnapshot).filter(DriftSnapshot.tenant_id == tenant_id)
        if since is not None:
            q = q.filter(DriftSnapshot.captured_at >= since)
        if source_type:
            q = q.filter(DriftSnapshot.source_type == source_type)
        rows = q.order_by(DriftSnapshot.captured_at.desc()).limit(limit).all()
        return [_row_to_dict(r) for r in rows]


def prune_drift_snapshots(*, tenant_id: str | None = None) -> int:
    """Delete snapshots older than tenant retention setting."""
    if not persistence_enabled():
        return 0
    deleted = 0
    now = _utcnow()
    with db_session() as session:
        q = session.query(DriftSnapshot)
        if tenant_id:
            q = q.filter(DriftSnapshot.tenant_id == tenant_id)
        rows = q.all()
        tenant_retention: dict[str, int] = {}
        for row in rows:
            tid = row.tenant_id
            if tid not in tenant_retention:
                settings = get_tenant_settings_raw(tenant_id=tid)
                tenant_retention[tid] = int(settings.get("driftSnapshotRetentionDays", 365))
            cutoff = now - timedelta(days=tenant_retention[tid])
            if row.captured_at < cutoff:
                session.delete(row)
                deleted += 1
        session.flush()
    return deleted


def _row_to_dict(row: DriftSnapshot) -> dict[str, Any]:
    return {
        "id": row.id,
        "tenantId": row.tenant_id,
        "sourceType": row.source_type,
        "scopeKey": row.scope_key,
        "snapshotHash": row.snapshot_hash,
        "payload": json.loads(row.payload_json),
        "jobId": row.job_id,
        "scanId": row.scan_id,
        "capturedAt": row.captured_at.isoformat() if row.captured_at else None,
    }


def build_external_snapshot_payload(bundle_report: dict[str, Any]) -> dict[str, Any]:
    assets = bundle_report.get("assets") or []
    finding_ids = sorted(
        f"{a.get('host')}:{a.get('port')}:{a.get('kind')}:{a.get('algorithm', '')}"
        for a in assets
        if isinstance(a, dict)
    )
    qv = sum(1 for a in assets if isinstance(a, dict) and a.get("quantumVulnerable"))
    return {
        "findingIds": finding_ids,
        "assetCount": len(assets),
        "quantumVulnerableCount": qv,
        "readinessScore": bundle_report.get("readinessScore"),
    }


def build_host_snapshot_payload(result: dict[str, Any]) -> dict[str, Any]:
    findings = result.get("findings") or result.get("hostFindings") or []
    ids = sorted(
        f.get("findingId") or f.get("id") or ""
        for f in findings
        if isinstance(f, dict) and (f.get("findingId") or f.get("id"))
    )
    return {"findingIds": ids, "findingCount": len(ids)}


def build_code_snapshot_payload(result: dict[str, Any]) -> dict[str, Any]:
    refs = result.get("bomRefs") or result.get("components") or []
    ids = sorted(
        r.get("bomRef") or r.get("purl") or r.get("name") or ""
        for r in refs
        if isinstance(r, dict)
    )
    runtime_only = result.get("runtimeOnly") or []
    source_only = result.get("sourceOnly") or []
    return {
        "findingIds": ids,
        "runtimeOnly": runtime_only if isinstance(runtime_only, list) else [],
        "sourceOnly": source_only if isinstance(source_only, list) else [],
        "findingCount": len(ids),
    }


def build_cbom_snapshot_payload(components: list[dict[str, Any]]) -> dict[str, Any]:
    ids = sorted(c.get("bomRef") or c.get("name") or "" for c in components if isinstance(c, dict))
    return {"componentIds": ids, "componentCount": len(ids)}
