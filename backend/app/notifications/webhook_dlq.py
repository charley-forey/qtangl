from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import WebhookDeadLetter as WebhookDeadLetterRow


def record_dead_letter(
    *,
    tenant_id: str,
    url: str,
    payload: dict[str, Any],
    reason: str,
) -> dict[str, Any]:
    row_id = f"dlq-{uuid.uuid4().hex[:12]}"
    if not persistence_enabled():
        return {
            "id": row_id,
            "tenantId": tenant_id,
            "url": url,
            "payload": payload,
            "reason": reason,
            "event": payload.get("event"),
            "scanId": payload.get("scanId"),
        }
    with db_session() as session:
        row = WebhookDeadLetterRow(
            id=row_id,
            tenant_id=tenant_id,
            url=url,
            payload_json=json.dumps(payload),
            reason=reason[:255],
            event=str(payload.get("event", ""))[:64] or None,
            scan_id=str(payload.get("scanId", ""))[:80] or None,
            created_at=datetime.now(timezone.utc),
        )
        session.add(row)
        session.flush()
        from app.telemetry.events import track_event

        track_event(
            "webhook_dlq_recorded",
            tenant_id=tenant_id,
            properties={"scanId": payload.get("scanId"), "reason": reason[:120]},
        )
        return _row_to_dict(row)


def list_dead_letters(*, tenant_id: str, limit: int = 200) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = (
            session.query(WebhookDeadLetterRow)
            .filter(
                WebhookDeadLetterRow.tenant_id == tenant_id,
                WebhookDeadLetterRow.replayed_at.is_(None),
            )
            .order_by(WebhookDeadLetterRow.created_at.desc())
            .limit(limit)
            .all()
        )
        return [_row_to_dict(row) for row in rows]


def get_dead_letter(*, tenant_id: str, dead_letter_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = session.get(WebhookDeadLetterRow, dead_letter_id)
        if row is None or row.tenant_id != tenant_id:
            return None
        return _row_to_dict(row)


def mark_replayed(*, tenant_id: str, dead_letter_id: str) -> bool:
    if not persistence_enabled():
        return False
    with db_session() as session:
        row = session.get(WebhookDeadLetterRow, dead_letter_id)
        if row is None or row.tenant_id != tenant_id:
            return False
        row.replayed_at = datetime.now(timezone.utc)
        return True


def _row_to_dict(row: WebhookDeadLetterRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "tenantId": row.tenant_id,
        "url": row.url,
        "payload": json.loads(row.payload_json or "{}"),
        "reason": row.reason,
        "event": row.event,
        "scanId": row.scan_id,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }
