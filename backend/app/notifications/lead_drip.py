"""Mini-assessment onboarding drip — lead capture and scheduled sends."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import OnboardingLead as OnboardingLeadRow
from app.notifications.onboarding import ONBOARDING_DRIP_SUBJECTS, send_onboarding_email
from app.telemetry.events import track_event

logger = logging.getLogger(__name__)

# Days after capture for steps 2–5 (step 1 sent immediately)
DRIP_STEP_DAYS = [0, 2, 5, 9, 14]


def capture_lead(*, email: str, source: str = "mini-assessment", scenario: str = "") -> dict[str, Any]:
    """Register lead and send drip step 1 (idempotent on email)."""
    if not persistence_enabled():
        result = send_onboarding_email(to_email=email, step=1)
        return {"captured": True, "persisted": False, "drip": result}

    email_norm = email.strip().lower()
    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = session.query(OnboardingLeadRow).filter(OnboardingLeadRow.email == email_norm).one_or_none()
        if row is None:
            row = OnboardingLeadRow(
                id=f"lead-{uuid.uuid4().hex[:12]}",
                email=email_norm,
                source=source,
                scenario=scenario,
                steps_sent=0,
                next_step_at=now,
                unsubscribed=False,
                created_at=now,
                updated_at=now,
            )
            session.add(row)
            session.flush()
        elif row.unsubscribed:
            return {"captured": False, "reason": "unsubscribed"}
        elif row.steps_sent >= len(ONBOARDING_DRIP_SUBJECTS):
            return {"captured": True, "reason": "drip_complete", "stepsSent": row.steps_sent}

    domain = email_norm.split("@")[-1] if "@" in email_norm else ""
    track_event(
        "mini_assessment_unlock",
        properties={"source": source, "scenario": scenario, "emailDomain": domain},
    )

    result = send_onboarding_email(to_email=email_norm, step=1)
    if result.get("sent") or result.get("reason") == "smtp_unconfigured":
        _mark_step_sent(email=email_norm, step=1)
    return {"captured": True, "drip": result, "step": 1}


def process_due_drip_emails(*, now: datetime | None = None) -> int:
    """Send due drip steps. Returns count sent."""
    if not persistence_enabled():
        return 0
    now = now or datetime.now(timezone.utc)
    sent = 0
    with db_session() as session:
        rows = (
            session.query(OnboardingLeadRow)
            .filter(
                OnboardingLeadRow.unsubscribed.is_(False),
                OnboardingLeadRow.steps_sent < len(ONBOARDING_DRIP_SUBJECTS),
                OnboardingLeadRow.next_step_at <= now,
            )
            .limit(50)
            .all()
        )
        for row in rows:
            next_step = int(row.steps_sent) + 1
            result = send_onboarding_email(to_email=row.email, step=next_step)
            if result.get("sent") or result.get("reason") == "smtp_unconfigured":
                row.steps_sent = next_step
                row.updated_at = now
                if next_step < len(ONBOARDING_DRIP_SUBJECTS):
                    days = DRIP_STEP_DAYS[next_step] if next_step < len(DRIP_STEP_DAYS) else 14
                    row.next_step_at = row.created_at + timedelta(days=days)
                else:
                    row.next_step_at = None
                sent += 1
                track_event(
                    "onboarding_drip_sent",
                    properties={"step": next_step, "emailDomain": row.email.split("@")[-1]},
                )
    return sent


def _mark_step_sent(*, email: str, step: int) -> None:
    if not persistence_enabled():
        return
    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = session.query(OnboardingLeadRow).filter(OnboardingLeadRow.email == email).one_or_none()
        if row is None:
            return
        row.steps_sent = max(int(row.steps_sent), step)
        row.updated_at = now
        if step < len(ONBOARDING_DRIP_SUBJECTS):
            days = DRIP_STEP_DAYS[step] if step < len(DRIP_STEP_DAYS) else 14
            row.next_step_at = row.created_at + timedelta(days=days)
        else:
            row.next_step_at = None


def unsubscribe_lead(*, email: str) -> bool:
    if not persistence_enabled():
        return False
    with db_session() as session:
        row = session.query(OnboardingLeadRow).filter(OnboardingLeadRow.email == email.strip().lower()).one_or_none()
        if row is None:
            return False
        row.unsubscribed = True
        row.updated_at = datetime.now(timezone.utc)
        return True
