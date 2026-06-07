"""Tenant evidence vault — retain signed bundles with configurable retention."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import EvidenceVaultObject


def _default_retention_months() -> int:
    import os

    return int(os.getenv("QTANGL_EVIDENCE_RETENTION_MONTHS", "12"))


def retain_scan_evidence(
    *,
    tenant_id: str,
    scan_id: str,
    content_hash: str = "",
    object_type: str = "bundle",
    storage_key: str = "",
    retention_months: int | None = None,
) -> dict[str, Any]:
    if not persistence_enabled():
        return {"retained": False, "reason": "persistence_required"}
    months = retention_months if retention_months is not None else _default_retention_months()
    retained_until = datetime.now(timezone.utc) + timedelta(days=months * 30)
    object_id = f"vault-{uuid.uuid4().hex[:16]}"
    with db_session() as session:
        existing = (
            session.query(EvidenceVaultObject)
            .filter(
                EvidenceVaultObject.tenant_id == tenant_id,
                EvidenceVaultObject.scan_id == scan_id,
                EvidenceVaultObject.object_type == object_type,
            )
            .one_or_none()
        )
        if existing:
            existing.content_hash = content_hash or existing.content_hash
            existing.storage_key = storage_key or existing.storage_key
            existing.retained_until = retained_until
            object_id = existing.id
        else:
            session.add(
                EvidenceVaultObject(
                    id=object_id,
                    tenant_id=tenant_id,
                    scan_id=scan_id,
                    object_type=object_type,
                    storage_key=storage_key,
                    content_hash=content_hash,
                    retained_until=retained_until,
                )
            )
    return {
        "retained": True,
        "id": object_id,
        "scanId": scan_id,
        "objectType": object_type,
        "retainedUntil": retained_until.isoformat(),
    }


def list_vault_objects(*, tenant_id: str, limit: int = 50) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = (
            session.query(EvidenceVaultObject)
            .filter(EvidenceVaultObject.tenant_id == tenant_id)
            .order_by(EvidenceVaultObject.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": row.id,
                "scanId": row.scan_id,
                "objectType": row.object_type,
                "contentHash": row.content_hash,
                "storageKey": row.storage_key,
                "retainedUntil": row.retained_until.isoformat() if row.retained_until else None,
                "createdAt": row.created_at.isoformat() if row.created_at else None,
            }
            for row in rows
        ]


def vault_summary(*, tenant_id: str) -> dict[str, Any]:
    objects = list_vault_objects(tenant_id=tenant_id, limit=500)
    now = datetime.now(timezone.utc)
    active = [obj for obj in objects if obj.get("retainedUntil") and obj["retainedUntil"] > now.isoformat()]
    return {"total": len(objects), "active": len(active), "objects": objects[:20]}


def purge_expired_vault_objects(*, now: datetime | None = None) -> int:
    """Remove vault metadata rows past retention (FR-E11)."""
    if not persistence_enabled():
        return 0
    now = now or datetime.now(timezone.utc)
    with db_session() as session:
        rows = (
            session.query(EvidenceVaultObject)
            .filter(
                EvidenceVaultObject.retained_until.isnot(None),
                EvidenceVaultObject.retained_until < now,
            )
            .all()
        )
        count = len(rows)
        for row in rows:
            session.delete(row)
        return count
