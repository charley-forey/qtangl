"""Flip dispatch service: dry_run, submit, poll, cancel, retry."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from app.audit.service import log_action
from app.billing.entitlements import check_crypto_flip_feature
from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import CryptoFlipJob, FlipApproval, RemediationProgramItem
from app.remediation.flip_policy import TERMINAL_STATUSES, evaluate_flip_policy, validate_approval
from app.tenant.settings import crypto_flip_enabled

VALID_STATUSES = frozenset(
    {"draft", "pending_approval", "approved", "running", "succeeded", "failed", "cancelled", "rolled_back"}
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _json_dumps(data: Any) -> str:
    return json.dumps(data, default=str)


def _json_loads(raw: str | None) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def _row_to_dict(row: CryptoFlipJob) -> dict[str, Any]:
    return {
        "id": row.id,
        "tenantId": row.tenant_id,
        "programItemId": row.program_item_id,
        "flipSurface": row.flip_surface,
        "provider": row.provider,
        "action": row.action,
        "targetEnv": row.target_env,
        "status": row.status,
        "dryRunResult": _json_loads(row.dry_run_result_json),
        "request": _json_loads(row.request_json),
        "result": _json_loads(row.result_json),
        "externalRef": row.external_ref,
        "submittedBy": row.submitted_by,
        "approvalActor": row.approval_actor,
        "approvalNote": row.approval_note,
        "approvedAt": row.approved_at.isoformat() if row.approved_at else None,
        "beforeSnapshotId": row.before_snapshot_id,
        "afterSnapshotId": row.after_snapshot_id,
        "proofId": row.proof_id,
        "error": row.error,
        "retryCount": row.retry_count,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }


def _dispatch_adapter(*, flip_surface: str, provider: str) -> Any:
    if flip_surface == "clm":
        from app.integrations.clm_flip import get_clm_flip_adapter

        return get_clm_flip_adapter(provider)
    if flip_surface == "overlay":
        from app.remediation.overlay_flip import get_overlay_flip_adapter

        return get_overlay_flip_adapter(provider)
    if flip_surface == "kms":
        from app.integrations.kms_flip import get_kms_flip_adapter

        return get_kms_flip_adapter(provider)
    raise ValueError(f"unsupported_surface:{flip_surface}")


def _capture_before_snapshot(*, tenant_id: str, program_item_id: str | None) -> str | None:
    if not program_item_id:
        return None
    try:
        from app.monitoring.drift_snapshots import record_drift_snapshot

        return record_drift_snapshot(
            tenant_id=tenant_id,
            source_type="cbom",
            scope_key=f"flip-before-{program_item_id}",
            payload={"phase": "before", "programItemId": program_item_id, "source": "crypto_flip"},
        )
    except Exception:
        return None


def dry_run(
    *,
    tenant_id: str,
    program_item_id: str,
    flip_surface: str,
    provider: str,
    target_env: str = "staging",
    request: dict[str, Any] | None = None,
    actor: str = "system",
) -> dict[str, Any]:
    blocked = check_crypto_flip_feature(tenant_id=tenant_id, surface=flip_surface, target_env=target_env)
    if blocked:
        return {"ok": False, "error": blocked}
    if not crypto_flip_enabled(tenant_id=tenant_id, surface=flip_surface):
        return {"ok": False, "error": {"code": "crypto_flip_disabled"}}

    policy = evaluate_flip_policy(
        tenant_id=tenant_id,
        flip_surface=flip_surface,
        provider=provider,
        target_env=target_env,
        submitter=actor,
        asset_tags=(request or {}).get("assetTags"),
    )
    if not policy.get("allowed"):
        return {"ok": False, "error": {"code": "policy_blocked", "reason": policy.get("reason")}}

    adapter = _dispatch_adapter(flip_surface=flip_surface, provider=provider)
    dry_result = adapter.dry_run(request=request or {}, target_env=target_env)

    log_action(
        tenant_id=tenant_id,
        actor=actor,
        action="flip_dry_run",
        resource_id=program_item_id,
        detail={"surface": flip_surface, "provider": provider, "targetEnv": target_env},
    )
    return {
        "ok": True,
        "dryRunResult": dry_result,
        "policy": policy,
        "programItemId": program_item_id,
    }


def submit(
    *,
    tenant_id: str,
    program_item_id: str,
    flip_surface: str,
    provider: str,
    target_env: str = "staging",
    request: dict[str, Any] | None = None,
    actor: str = "system",
    skip_approval: bool = False,
) -> dict[str, Any]:
    blocked = check_crypto_flip_feature(tenant_id=tenant_id, surface=flip_surface, target_env=target_env)
    if blocked:
        return {"ok": False, "error": blocked}

    policy = evaluate_flip_policy(
        tenant_id=tenant_id,
        flip_surface=flip_surface,
        provider=provider,
        target_env=target_env,
        submitter=actor,
        asset_tags=(request or {}).get("assetTags"),
    )
    if not policy.get("allowed"):
        return {"ok": False, "error": {"code": "policy_blocked", "reason": policy.get("reason")}}

    job_id = f"flip-{uuid.uuid4().hex[:12]}"
    now = _utcnow()
    before_snap = _capture_before_snapshot(tenant_id=tenant_id, program_item_id=program_item_id)

    requires_approval = policy.get("requiresApproval") and not skip_approval
    initial_status = "pending_approval" if requires_approval else "approved"

    if not persistence_enabled():
        return {
            "ok": True,
            "job": {
                "id": job_id,
                "status": initial_status,
                "programItemId": program_item_id,
                "flipSurface": flip_surface,
                "provider": provider,
                "targetEnv": target_env,
            },
        }

    with db_session() as session:
        row = CryptoFlipJob(
            id=job_id,
            tenant_id=tenant_id,
            program_item_id=program_item_id,
            flip_surface=flip_surface,
            provider=provider,
            target_env=target_env,
            status=initial_status,
            request_json=_json_dumps(request or {}),
            submitted_by=actor,
            before_snapshot_id=before_snap,
            created_at=now,
            updated_at=now,
        )
        session.add(row)
        item = session.get(RemediationProgramItem, program_item_id)
        if item and item.tenant_id == tenant_id:
            item.flip_job_id = job_id
            item.status = "in_progress"
            item.updated_at = now
        session.flush()

    log_action(
        tenant_id=tenant_id,
        actor=actor,
        action="flip_submitted",
        resource_id=job_id,
        detail={"surface": flip_surface, "provider": provider, "status": initial_status},
    )

    if not requires_approval:
        return execute(tenant_id=tenant_id, job_id=job_id, actor=actor)

    with db_session() as session:
        job_row = session.get(CryptoFlipJob, job_id)
        return {"ok": True, "job": _row_to_dict(job_row)}


def approve(
    *,
    tenant_id: str,
    job_id: str,
    approver: str,
    approval_note: str | None = None,
) -> dict[str, Any]:
    if not persistence_enabled():
        return {"ok": False, "error": {"code": "persistence_disabled"}}

    with db_session() as session:
        row = session.get(CryptoFlipJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return {"ok": False, "error": {"code": "not_found"}}
        job_dict = _row_to_dict(row)
        err = validate_approval(
            tenant_id=tenant_id,
            job=job_dict,
            approver=approver,
            approval_note=approval_note,
        )
        if err:
            return {"ok": False, "error": err}

        now = _utcnow()
        row.status = "approved"
        row.approval_actor = approver
        row.approval_note = approval_note
        row.approved_at = now
        row.updated_at = now
        session.add(
            FlipApproval(
                id=f"fap-{uuid.uuid4().hex[:12]}",
                tenant_id=tenant_id,
                flip_job_id=job_id,
                actor=approver,
                action="approve",
                note=approval_note,
                created_at=now,
            )
        )
        session.flush()

    log_action(
        tenant_id=tenant_id,
        actor=approver,
        action="flip_approved",
        resource_id=job_id,
        detail={"note": approval_note},
    )
    return execute(tenant_id=tenant_id, job_id=job_id, actor=approver)


def execute(*, tenant_id: str, job_id: str, actor: str = "system") -> dict[str, Any]:
    if not persistence_enabled():
        return {"ok": False, "error": {"code": "persistence_disabled"}}

    with db_session() as session:
        row = session.get(CryptoFlipJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return {"ok": False, "error": {"code": "not_found"}}
        if row.status not in {"approved", "running"}:
            if row.status == "pending_approval":
                return {"ok": False, "error": {"code": "approval_required"}}
            return {"ok": False, "error": {"code": "invalid_status", "status": row.status}}

        row.status = "running"
        row.updated_at = _utcnow()
        session.flush()
        flip_surface = row.flip_surface
        provider = row.provider
        request = _json_loads(row.request_json)
        target_env = row.target_env

    try:
        adapter = _dispatch_adapter(flip_surface=flip_surface, provider=provider)
        result = adapter.execute(request=request, target_env=target_env, tenant_id=tenant_id)
        external_ref = result.get("externalRef") or result.get("requestId") or result.get("prUrl")
        terminal = "succeeded" if result.get("status") in {"ok", "succeeded", "pending"} else "failed"
        error = None if terminal == "succeeded" else result.get("message") or result.get("error")
    except Exception as exc:
        result = {"status": "error", "message": str(exc)}
        external_ref = None
        terminal = "failed"
        error = str(exc)

    after_snap = None
    proof_id = None
    if terminal == "succeeded":
        try:
            from app.monitoring.drift_snapshots import record_drift_snapshot

            with db_session() as session:
                row = session.get(CryptoFlipJob, job_id)
                if row:
                    after_snap = record_drift_snapshot(
                        tenant_id=tenant_id,
                        source_type="cbom",
                        scope_key=f"flip-after-{row.program_item_id}",
                        payload={
                            "phase": "after",
                            "programItemId": row.program_item_id,
                            "result": result,
                            "source": "crypto_flip",
                        },
                        job_id=job_id,
                    )
        except Exception:
            pass
        _notify_flip_completed(tenant_id=tenant_id, job_id=job_id, result=result)

    with db_session() as session:
        row = session.get(CryptoFlipJob, job_id)
        if row:
            row.status = terminal
            row.result_json = _json_dumps(result)
            row.external_ref = external_ref
            row.after_snapshot_id = after_snap
            row.proof_id = proof_id
            row.error = error
            row.updated_at = _utcnow()
            session.flush()
            job_dict = _row_to_dict(row)
        else:
            job_dict = {}

    log_action(
        tenant_id=tenant_id,
        actor=actor,
        action="flip_completed" if terminal == "succeeded" else "flip_failed",
        resource_id=job_id,
        detail={"status": terminal, "externalRef": external_ref},
    )
    return {"ok": terminal == "succeeded", "job": job_dict}


def poll(*, tenant_id: str, job_id: str) -> dict[str, Any]:
    if not persistence_enabled():
        return {"ok": False, "error": {"code": "persistence_disabled"}}

    with db_session() as session:
        row = session.get(CryptoFlipJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return {"ok": False, "error": {"code": "not_found"}}
        if row.status == "running" and row.external_ref:
            try:
                adapter = _dispatch_adapter(flip_surface=row.flip_surface, provider=row.provider)
                poll_result = adapter.poll(external_ref=row.external_ref, tenant_id=tenant_id)
                if poll_result.get("status") in {"succeeded", "failed", "ok"}:
                    row.status = "succeeded" if poll_result.get("status") in {"succeeded", "ok"} else "failed"
                    row.result_json = _json_dumps(poll_result)
                    row.updated_at = _utcnow()
                    if row.status == "succeeded":
                        _notify_flip_completed(tenant_id=tenant_id, job_id=job_id, result=poll_result)
            except Exception:
                pass
            session.flush()
        return {"ok": True, "job": _row_to_dict(row)}


def cancel(*, tenant_id: str, job_id: str, actor: str, reason: str | None = None) -> dict[str, Any]:
    if not persistence_enabled():
        return {"ok": False, "error": {"code": "persistence_disabled"}}

    with db_session() as session:
        row = session.get(CryptoFlipJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return {"ok": False, "error": {"code": "not_found"}}
        if row.status in TERMINAL_STATUSES:
            return {"ok": False, "error": {"code": "already_terminal"}}
        row.status = "cancelled" if reason != "rollback" else "rolled_back"
        row.error = reason
        row.updated_at = _utcnow()
        session.flush()
        job_dict = _row_to_dict(row)

    log_action(
        tenant_id=tenant_id,
        actor=actor,
        action="flip_cancelled" if reason != "rollback" else "flip_rolled_back",
        resource_id=job_id,
        detail={"reason": reason},
    )
    return {"ok": True, "job": job_dict}


def retry(*, tenant_id: str, job_id: str, actor: str) -> dict[str, Any]:
    if not persistence_enabled():
        return {"ok": False, "error": {"code": "persistence_disabled"}}

    with db_session() as session:
        row = session.get(CryptoFlipJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return {"ok": False, "error": {"code": "not_found"}}
        if row.status not in {"failed", "cancelled"}:
            return {"ok": False, "error": {"code": "invalid_status"}}
        row.status = "approved"
        row.retry_count = (row.retry_count or 0) + 1
        row.error = None
        row.updated_at = _utcnow()
        session.flush()

    log_action(
        tenant_id=tenant_id,
        actor=actor,
        action="flip_retry",
        resource_id=job_id,
        detail={},
    )
    return execute(tenant_id=tenant_id, job_id=job_id, actor=actor)


def get_flip_job(*, tenant_id: str, job_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = session.get(CryptoFlipJob, job_id)
        if row is None or row.tenant_id != tenant_id:
            return None
        return _row_to_dict(row)


def list_flip_jobs(
    *,
    tenant_id: str,
    status: str | None = None,
    flip_surface: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[dict[str, Any]], int]:
    if not persistence_enabled():
        return [], 0
    with db_session() as session:
        q = session.query(CryptoFlipJob).filter(CryptoFlipJob.tenant_id == tenant_id)
        if status:
            q = q.filter(CryptoFlipJob.status == status)
        if flip_surface:
            q = q.filter(CryptoFlipJob.flip_surface == flip_surface)
        total = q.count()
        rows = q.order_by(CryptoFlipJob.created_at.desc()).offset(offset).limit(limit).all()
        return [_row_to_dict(r) for r in rows], total


def _notify_flip_completed(*, tenant_id: str, job_id: str, result: dict[str, Any]) -> None:
    try:
        from app.notifications.webhooks import notify_flip_completed
        from app.tenant.settings import get_tenant_settings_raw

        settings = get_tenant_settings_raw(tenant_id=tenant_id)
        webhooks = settings.get("webhookUrls") or []
        if isinstance(webhooks, str):
            webhooks = [webhooks] if webhooks else []
        secret = settings.get("webhookSigningSecret") or ""
        job = get_flip_job(tenant_id=tenant_id, job_id=job_id) or {}
        notify_flip_completed(
            webhooks=webhooks,
            tenant_id=tenant_id,
            job=job,
            result=result,
            signing_secret=secret,
        )
    except Exception:
        pass
