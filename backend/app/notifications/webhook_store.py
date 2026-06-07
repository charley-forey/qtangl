from __future__ import annotations

import uuid
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import WebhookSubscription as WebhookRow


def list_webhooks(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = (
            session.query(WebhookRow)
            .filter(WebhookRow.tenant_id == tenant_id, WebhookRow.active.is_(True))
            .all()
        )
        return [_row_to_dict(row) for row in rows]


def create_webhook(*, tenant_id: str, url: str, events: str = "scan.complete") -> dict[str, Any]:
    if not persistence_enabled():
        return {"url": url, "events": events}
    webhook_id = f"wh-{uuid.uuid4()}"
    with db_session() as session:
        row = WebhookRow(id=webhook_id, tenant_id=tenant_id, url=url, events=events, active=True)
        session.add(row)
        session.flush()
        return _row_to_dict(row)


def active_webhook_urls(*, tenant_id: str, event: str = "scan.complete") -> list[str]:
    return [
        row["url"]
        for row in list_webhooks(tenant_id=tenant_id)
        if _event_matches(row.get("events", ""), event)
    ]


def _event_matches(events_csv: str, event: str) -> bool:
    parts = [part.strip() for part in events_csv.split(",") if part.strip()]
    return event in parts or events_csv.strip() == event


def delete_webhook(*, tenant_id: str, webhook_id: str) -> bool:
    if not persistence_enabled():
        return False
    with db_session() as session:
        row = session.get(WebhookRow, webhook_id)
        if row is None or row.tenant_id != tenant_id:
            return False
        row.active = False
        return True


def _row_to_dict(row: WebhookRow) -> dict[str, Any]:
    return {"id": row.id, "url": row.url, "events": row.events, "active": row.active}
