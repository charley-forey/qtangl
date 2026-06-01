from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import RemediationExternalSync as SyncRow


def upsert_sync(
    *,
    tenant_id: str,
    remediation_id: str,
    provider: str,
    external_ref: str,
    scan_id: str | None = None,
    external_status: str | None = None,
) -> dict[str, Any]:
    if not persistence_enabled():
        return {
            "remediationId": remediation_id,
            "provider": provider,
            "externalRef": external_ref,
            "status": external_status or "pushed",
        }
    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = (
            session.query(SyncRow)
            .filter(
                SyncRow.tenant_id == tenant_id,
                SyncRow.remediation_id == remediation_id,
                SyncRow.provider == provider,
            )
            .one_or_none()
        )
        if row is None:
            row = SyncRow(
                id=f"sync-{uuid.uuid4().hex[:12]}",
                tenant_id=tenant_id,
                remediation_id=remediation_id,
                provider=provider,
                external_ref=external_ref,
                external_status=external_status,
                scan_id=scan_id,
                updated_at=now,
            )
            session.add(row)
        else:
            row.external_ref = external_ref
            row.external_status = external_status or row.external_status
            row.scan_id = scan_id or row.scan_id
            row.updated_at = now
        session.flush()
        return _row_to_dict(row)


def get_sync(*, tenant_id: str, remediation_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = (
            session.query(SyncRow)
            .filter(SyncRow.tenant_id == tenant_id, SyncRow.remediation_id == remediation_id)
            .order_by(SyncRow.updated_at.desc())
            .first()
        )
        return _row_to_dict(row) if row else None


def _row_to_dict(row: SyncRow) -> dict[str, Any]:
    return {
        "remediationId": row.remediation_id,
        "provider": row.provider,
        "externalRef": row.external_ref,
        "status": row.external_status,
        "scanId": row.scan_id,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }
