from __future__ import annotations

from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import require_admin
from app.tenants.service import create_tenant, issue_api_key, list_tenant_keys, revoke_api_key

router = APIRouter(prefix="/admin", tags=["admin"])


class CreateTenantRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    tenantId: str | None = Field(default=None, max_length=64)


class IssueKeyRequest(BaseModel):
    label: str = Field(default="default", max_length=64)


@router.post("/tenants")
def admin_create_tenant(
    request: CreateTenantRequest,
    _: str = Depends(require_admin),
) -> dict:
    try:
        return create_tenant(tenant_id=request.tenantId, name=request.name)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.post("/tenants/{tenant_id}/keys")
def admin_issue_key(
    tenant_id: str,
    request: IssueKeyRequest,
    _: str = Depends(require_admin),
) -> dict:
    try:
        return issue_api_key(tenant_id=tenant_id, label=request.label)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.get("/tenants/{tenant_id}/keys")
def admin_list_keys(tenant_id: str, _: str = Depends(require_admin)) -> dict:
    return {"tenantId": tenant_id, "keys": list_tenant_keys(tenant_id=tenant_id)}


@router.delete("/keys/{key_id}")
def admin_revoke_key(key_id: str, _: str = Depends(require_admin)) -> dict:
    try:
        return revoke_api_key(key_id=key_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
