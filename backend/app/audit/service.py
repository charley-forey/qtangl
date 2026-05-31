from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import AuditLogEntry as AuditLogRow


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
