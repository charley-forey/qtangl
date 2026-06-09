from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import HostAgent

STALE_DAYS = 30


def mark_stale_agents(*, tenant_id: str | None = None) -> int:
    if not persistence_enabled():
        return 0
    cutoff = datetime.now(timezone.utc) - timedelta(days=STALE_DAYS)
    with db_session() as session:
        q = session.query(HostAgent).filter(
            HostAgent.status == "online",
            (HostAgent.last_seen_at.is_(None)) | (HostAgent.last_seen_at < cutoff),
        )
        if tenant_id:
            q = q.filter(HostAgent.tenant_id == tenant_id)
        count = 0
        for agent in q.all():
            agent.status = "revoked"
            count += 1
        session.flush()
        return count
