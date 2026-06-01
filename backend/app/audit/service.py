from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

# re-export for type hints in list_audit
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import AuditLogEntry as AuditLogRow


def list_audit(
    *,
    tenant_id: str,
    limit: int = 100,
    action_prefix: str | None = None,
    since: datetime | None = None,
    cursor: str | None = None,
) -> tuple[list[dict[str, Any]], str | None]:
    if not persistence_enabled():
        return [], None
    with db_session() as session:
        query = session.query(AuditLogRow).filter(AuditLogRow.tenant_id == tenant_id)
        if action_prefix:
            query = query.filter(AuditLogRow.action.startswith(action_prefix))
        if since is not None:
            query = query.filter(AuditLogRow.created_at >= since)
        if cursor:
            cursor_row = session.get(AuditLogRow, cursor)
            if cursor_row and cursor_row.created_at:
                query = query.filter(AuditLogRow.created_at < cursor_row.created_at)
        rows = query.order_by(AuditLogRow.created_at.desc()).limit(limit + 1).all()
        has_more = len(rows) > limit
        page = rows[:limit]
        next_cursor = page[-1].id if has_more and page else None
        return [_row_to_dict(row) for row in page], next_cursor


def _row_to_dict(row: AuditLogRow) -> dict[str, Any]:
    detail = None
    if row.detail_json:
        try:
            detail = json.loads(row.detail_json)
        except json.JSONDecodeError:
            detail = row.detail_json
    return {
        "id": row.id,
        "tenantId": row.tenant_id,
        "actor": row.actor,
        "action": row.action,
        "resourceId": row.resource_id,
        "detail": detail,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


def log_action(
    *,
    tenant_id: str,
    action: str,
    actor: str = "system",
    resource_id: str | None = None,
    detail: dict[str, Any] | None = None,
) -> None:
    if not persistence_enabled():
        return
    with db_session() as session:
        session.add(
            AuditLogRow(
                id=f"audit-{uuid.uuid4()}",
                tenant_id=tenant_id,
                actor=actor,
                action=action,
                resource_id=resource_id,
                detail_json=json.dumps(detail) if detail else None,
                created_at=datetime.now(timezone.utc),
            )
        )
