"""Flip policy engine: approval rules, rate limits, blocked tags."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from app.billing.entitlements import tenant_entitlements
from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import CryptoFlipJob

VALID_SURFACES = frozenset({"overlay", "clm", "kms"})
VALID_ENVS = frozenset({"staging", "prod"})
TERMINAL_STATUSES = frozenset({"succeeded", "failed", "cancelled", "rolled_back"})

_DEFAULT_MAX_FLIPS_PER_DAY = 50
_KMS_PROD_COOLDOWN_HOURS = 24


def evaluate_flip_policy(
    *,
    tenant_id: str,
    flip_surface: str,
    provider: str,
    target_env: str,
    submitter: str,
    asset_tags: list[str] | None = None,
    auto_approve_staging: bool = True,
) -> dict[str, Any]:
    """Return policy decision: allowed, requires_approval, blocked_reason."""
    if flip_surface not in VALID_SURFACES:
        return {"allowed": False, "requiresApproval": False, "reason": f"invalid_surface:{flip_surface}"}
    if target_env not in VALID_ENVS:
        return {"allowed": False, "requiresApproval": False, "reason": f"invalid_env:{target_env}"}

    blocked_tags = {"no-flip", "production-critical", "air-gap-only"}
    for tag in asset_tags or []:
        if tag.lower() in blocked_tags:
            return {"allowed": False, "requiresApproval": False, "reason": f"blocked_tag:{tag}"}

    if not _within_daily_budget(tenant_id=tenant_id):
        return {"allowed": False, "requiresApproval": False, "reason": "daily_flip_budget_exceeded"}

    if flip_surface == "kms" and target_env == "prod":
        cooldown = _kms_prod_cooldown_active(tenant_id=tenant_id)
        if cooldown:
            return {
                "allowed": False,
                "requiresApproval": False,
                "reason": "kms_prod_cooldown",
                "cooldownUntil": cooldown,
            }

    requires_approval = target_env == "prod"
    if target_env == "staging" and auto_approve_staging:
        requires_approval = False

    two_person = flip_surface == "kms" and target_env == "prod"
    ent = tenant_entitlements(tenant_id=tenant_id)

    return {
        "allowed": True,
        "requiresApproval": requires_approval,
        "twoPersonRule": two_person,
        "submitter": submitter,
        "tier": ent.get("tier"),
        "maxFlipsPerDay": _DEFAULT_MAX_FLIPS_PER_DAY,
    }


def validate_approval(
    *,
    tenant_id: str,
    job: dict[str, Any],
    approver: str,
    approval_note: str | None = None,
) -> dict[str, Any] | None:
    """Return error dict if approval invalid, else None."""
    if job.get("status") != "pending_approval":
        return {"code": "invalid_status", "detail": "job_not_pending_approval"}
    if job.get("targetEnv") == "prod" and not (approval_note or "").strip():
        return {"code": "approval_note_required", "detail": "prod_flip_requires_note"}
    submitter = job.get("submittedBy") or ""
    if job.get("flipSurface") == "kms" and job.get("targetEnv") == "prod":
        if approver == submitter:
            return {"code": "two_person_rule", "detail": "approver_must_differ_from_submitter"}
    return None


def _within_daily_budget(*, tenant_id: str) -> bool:
    if not persistence_enabled():
        return True
    since = datetime.now(timezone.utc) - timedelta(days=1)
    with db_session() as session:
        count = (
            session.query(CryptoFlipJob)
            .filter(
                CryptoFlipJob.tenant_id == tenant_id,
                CryptoFlipJob.created_at >= since,
                CryptoFlipJob.status.notin_(list({"draft", "cancelled"})),
            )
            .count()
        )
    return count < _DEFAULT_MAX_FLIPS_PER_DAY


def _kms_prod_cooldown_active(*, tenant_id: str) -> str | None:
    if not persistence_enabled():
        return None
    since = datetime.now(timezone.utc) - timedelta(hours=_KMS_PROD_COOLDOWN_HOURS)
    with db_session() as session:
        recent = (
            session.query(CryptoFlipJob)
            .filter(
                CryptoFlipJob.tenant_id == tenant_id,
                CryptoFlipJob.flip_surface == "kms",
                CryptoFlipJob.target_env == "prod",
                CryptoFlipJob.status.in_(["succeeded", "running", "approved"]),
                CryptoFlipJob.updated_at >= since,
            )
            .order_by(CryptoFlipJob.updated_at.desc())
            .first()
        )
    if recent is None:
        return None
    cooldown_until = recent.updated_at + timedelta(hours=_KMS_PROD_COOLDOWN_HOURS)
    if cooldown_until > datetime.now(timezone.utc):
        return cooldown_until.isoformat()
    return None
