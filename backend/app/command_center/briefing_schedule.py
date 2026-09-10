"""Durable once-per-cadence briefing attempts using existing schedule run logs."""

from __future__ import annotations

import hashlib
import logging
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.exc import IntegrityError

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import ScheduleRunLog, TenantSettings
from app.monitoring.service import scheduler_enabled
from app.security.secrets import decrypt_json_blob
from app.tenant.settings import get_tenant_settings_raw

logger = logging.getLogger(__name__)


def _due_slot(config: dict[str, Any], now: datetime) -> int | None:
    if config.get("enabled") is not True:
        return None
    try:
        UUID(config["revision"])
        first = datetime.fromisoformat(config["firstRunAt"].replace("Z", "+00:00"))
        cadence = config["cadenceHours"]
        if first.tzinfo is None or type(cadence) is not int or not 1 <= cadence <= 168:
            return None
        elapsed = (now - first).total_seconds()
        return int(elapsed // (cadence * 3600)) if elapsed >= 0 else None
    except (KeyError, ValueError, TypeError, AttributeError):
        return None


def _claim(tenant_id: str, now: datetime) -> tuple[str, dict[str, Any]] | None:
    try:
        with db_session() as session:
            row = session.query(TenantSettings).filter_by(tenant_id=tenant_id).with_for_update().one_or_none()
            if row is None:
                return None
            config = decrypt_json_blob(row.settings_json).get("pushBriefing") or {}
            if not isinstance(config, dict):
                return None
            slot = _due_slot(config, now)
            if slot is None:
                return None
            key = f"{tenant_id}:{config['revision']}:{slot}"
            run_id = "brief-" + hashlib.sha256(key.encode()).hexdigest()
            if session.get(ScheduleRunLog, run_id) is not None:
                return None
            session.add(ScheduleRunLog(
                id=run_id, tenant_id=tenant_id, schedule_id="brief-" + config["revision"],
                status="sending", created_at=now,
            ))
        return run_id, config
    except IntegrityError:
        # The primary key also arbitrates duplicate claims on SQLite without row locks.
        return None


def _record_outcome(run_id: str, status: str) -> None:
    with db_session() as session:
        row = session.get(ScheduleRunLog, run_id)
        if row is not None:
            row.status = status


def process_due_briefings(now: datetime | None = None) -> int:
    if not persistence_enabled() or not scheduler_enabled():
        return 0
    from app.command_center.qros_push import build_briefing_for_tenant, deliver_morning_briefing

    now = now or datetime.now(timezone.utc)
    with db_session() as session:
        tenant_ids = [row[0] for row in session.query(TenantSettings.tenant_id).all()]
    delivered = 0
    for tenant_id in tenant_ids:
        run_id = None
        try:
            claim = _claim(tenant_id, now)
            if claim is None:
                continue
            run_id, config = claim
            briefing = build_briefing_for_tenant(tenant_id=tenant_id)
            settings = get_tenant_settings_raw(tenant_id=tenant_id)
            current = settings.get("pushBriefing") or {}
            if not isinstance(current, dict) or current.get("enabled") is not True or current.get("revision") != config["revision"]:
                _record_outcome(run_id, "cancelled")
                continue
            # ponytail: whole-run claim; per-destination claims if selective automatic retries are needed.
            result = deliver_morning_briefing(
                tenant_id=tenant_id, briefing=briefing, channels=config.get("channels"),
                recipients=config.get("recipients"), signing_secret=settings.get("webhookSigningSecret") or "",
                delivery_id=run_id,
            )
            sent, attempted = int(result.get("delivered", 0)), int(result.get("attempted", 0))
            outcome = "sent" if sent and sent == attempted else "partial" if sent else "failed" if attempted else "no_destinations"
            _record_outcome(run_id, f"{outcome}:{sent}/{attempted}")
            delivered += sent
        except Exception:
            # A committed 'sending' claim is intentionally never retried: acceptance may be ambiguous.
            logger.exception("Briefing attempt outcome unknown tenant=%s run=%s", tenant_id, run_id)
    return delivered


def briefing_schedule_outcome(*, tenant_id: str, revision: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = session.query(ScheduleRunLog).filter_by(
            tenant_id=tenant_id, schedule_id="brief-" + revision,
        ).order_by(ScheduleRunLog.created_at.desc()).first()
        if row is None:
            return None
        state, _, counts = row.status.partition(":")
        sent, _, attempted = counts.partition("/")
        return {
            "runId": row.id, "status": state,
            "delivered": int(sent) if sent else None,
            "attempted": int(attempted) if attempted else None,
            "attemptedAt": row.created_at.isoformat(),
            "outcomeUnknown": state == "sending",
        }
