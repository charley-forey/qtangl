from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field

from app.auth import AuthContext, require_auth_readonly, require_auth_write
from app.partner.service import list_child_tenants, partner_can_manage_tenant
from app.remediation.flip import (
    approve,
    cancel,
    dry_run,
    get_flip_job,
    list_flip_jobs,
    poll,
    retry,
    submit,
)
from app.tenant.settings import crypto_flip_enabled

router = APIRouter(prefix="/tenant", tags=["tenant"])


def _assert_partner_scope(auth: AuthContext, tenant_id: str) -> None:
    children = {c["childTenantId"] for c in list_child_tenants(parent_tenant_id=auth.tenant_id)}
    if children and tenant_id not in children and tenant_id != auth.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="partner_scope_denied")


def _assert_flip_enabled(auth: AuthContext) -> None:
    if not crypto_flip_enabled(tenant_id=auth.tenant_id):
        raise HTTPException(status_code=503, detail="crypto_flip_disabled")


class FlipDryRunRequest(BaseModel):
    flipSurface: str
    provider: str
    targetEnv: str = "staging"
    request: dict[str, Any] = Field(default_factory=dict)


class FlipSubmitRequest(BaseModel):
    flipSurface: str
    provider: str
    targetEnv: str = "staging"
    request: dict[str, Any] = Field(default_factory=dict)
    skipApproval: bool = False


class FlipApproveRequest(BaseModel):
    approvalNote: str | None = None
    childTenantId: str | None = None


class FlipCancelRequest(BaseModel):
    reason: str | None = None


@router.post("/remediation/program/{program_item_id}/flip/dry-run")
def flip_dry_run(
    program_item_id: str,
    body: FlipDryRunRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    _assert_flip_enabled(auth)
    result = dry_run(
        tenant_id=auth.tenant_id,
        program_item_id=program_item_id,
        flip_surface=body.flipSurface,
        provider=body.provider,
        target_env=body.targetEnv,
        request=body.request,
        actor=auth.tenant_id,
    )
    if not result.get("ok"):
        err = result.get("error") or {}
        raise HTTPException(status_code=400, detail=err)
    return {"status": "success", **result}


@router.post("/remediation/program/{program_item_id}/flip")
def flip_submit(
    program_item_id: str,
    body: FlipSubmitRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    _assert_flip_enabled(auth)
    result = submit(
        tenant_id=auth.tenant_id,
        program_item_id=program_item_id,
        flip_surface=body.flipSurface,
        provider=body.provider,
        target_env=body.targetEnv,
        request=body.request,
        actor=auth.tenant_id,
        skip_approval=body.skipApproval,
    )
    if not result.get("ok"):
        err = result.get("error") or {}
        code = 403 if err.get("code") in {"convert_tier_required", "enterprise_tier_required"} else 400
        raise HTTPException(status_code=code, detail=err)
    return {"status": "success", **result}


@router.get("/flips")
def flips_list(
    status_filter: str | None = Query(default=None, alias="status"),
    surface: str | None = Query(default=None, alias="flipSurface"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    _assert_flip_enabled(auth)
    items, total = list_flip_jobs(
        tenant_id=auth.tenant_id,
        status=status_filter,
        flip_surface=surface,
        limit=limit,
        offset=offset,
    )
    return {"status": "success", "items": items, "total": total}


@router.get("/flips/{job_id}")
def flips_get(job_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    _assert_flip_enabled(auth)
    job = get_flip_job(tenant_id=auth.tenant_id, job_id=job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="flip_job_not_found")
    return {"status": "success", "job": job}


@router.post("/flips/{job_id}/approve")
def flips_approve(
    job_id: str,
    body: FlipApproveRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    tenant_id = auth.tenant_id
    if body.childTenantId:
        if not partner_can_manage_tenant(parent_tenant_id=auth.tenant_id, child_tenant_id=body.childTenantId):
            raise HTTPException(status_code=403, detail="partner_scope_denied")
        tenant_id = body.childTenantId
    _assert_flip_enabled(auth)
    result = approve(
        tenant_id=tenant_id,
        job_id=job_id,
        approver=auth.tenant_id,
        approval_note=body.approvalNote,
    )
    if not result.get("ok"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return {"status": "success", **result}


@router.post("/flips/{job_id}/cancel")
def flips_cancel(
    job_id: str,
    body: FlipCancelRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    _assert_flip_enabled(auth)
    result = cancel(
        tenant_id=auth.tenant_id,
        job_id=job_id,
        actor=auth.tenant_id,
        reason=body.reason,
    )
    if not result.get("ok"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return {"status": "success", **result}


@router.post("/flips/{job_id}/retry")
def flips_retry(job_id: str, auth: AuthContext = Depends(require_auth_write)) -> dict:
    _assert_flip_enabled(auth)
    result = retry(
        tenant_id=auth.tenant_id,
        job_id=job_id,
        actor=auth.tenant_id,
    )
    if not result.get("ok"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return {"status": "success", **result}


@router.get("/flips/{job_id}/poll")
def flips_poll(job_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    _assert_flip_enabled(auth)
    result = poll(tenant_id=auth.tenant_id, job_id=job_id)
    if not result.get("ok"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    return {"status": "success", **result}
