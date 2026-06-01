from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.db.engine import db_session
from app.db.models import ScheduleRunLog, UploadSession, WebhookDeadLetter


def sweep_expired_upload_sessions(*, now: datetime | None = None) -> int:
    now = now or datetime.now(timezone.utc)
    with db_session() as session:
        rows = session.query(UploadSession).filter(UploadSession.expires_at < now).all()
        count = len(rows)
        for row in rows:
            session.delete(row)
        return count


def purge_replayed_webhook_dlq(*, older_than_days: int = 30) -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    with db_session() as session:
        rows = (
            session.query(WebhookDeadLetter)
            .filter(WebhookDeadLetter.replayed_at.isnot(None))
            .filter(WebhookDeadLetter.created_at < cutoff)
            .all()
        )
        count = len(rows)
        for row in rows:
            session.delete(row)
        return count


def purge_old_schedule_run_logs(*, older_than_days: int = 90) -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    with db_session() as session:
        rows = session.query(ScheduleRunLog).filter(ScheduleRunLog.created_at < cutoff).all()
        count = len(rows)
        for row in rows:
            session.delete(row)
        return count
