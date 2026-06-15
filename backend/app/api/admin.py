from __future__ import annotations

from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends, HTTPException, status

from app.audit.service import log_action
from app.auth import require_admin
from app.billing.entitlements import upsert_tenant_subscription
from app.tenant.settings import set_tenant_scan_allowlist
from app.tenants.service import create_tenant, issue_api_key, list_tenant_keys, revoke_api_key

router = APIRouter(prefix="/admin", tags=["admin"])


class CreateTenantRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    tenantId: str | None = Field(default=None, max_length=64)
    tier: str = Field(default="monitor", pattern="^(free|monitor|convert|enterprise)$")


class IssueKeyRequest(BaseModel):
    label: str = Field(default="default", max_length=64)


class AuthorizedDomainsAdminRequest(BaseModel):
    domains: list[str] = Field(default_factory=list, max_length=100)
    attestation: str = Field(default="Sales-led provisioning", max_length=4000)


class MsspParentRequest(BaseModel):
    parentTenantId: str = Field(min_length=1, max_length=64)


@router.post("/tenants")
def admin_create_tenant(
    request: CreateTenantRequest,
    _: str = Depends(require_admin),
) -> dict:
    try:
        auth_mode = "sso_required" if request.tier == "enterprise" else "magic_link"
        tenant = create_tenant(tenant_id=request.tenantId, name=request.name, auth_mode=auth_mode)
        subscription = upsert_tenant_subscription(
            tenant_id=tenant["tenantId"],
            tier=request.tier,
        )
        return {**tenant, "subscription": subscription}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.put("/tenants/{tenant_id}/authorized-domains")
def admin_set_authorized_domains(
    tenant_id: str,
    request: AuthorizedDomainsAdminRequest,
    _: str = Depends(require_admin),
) -> dict:
    try:
        domains = set_tenant_scan_allowlist(tenant_id=tenant_id, domains=request.domains)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    log_action(
        tenant_id=tenant_id,
        action="authorized_domains.admin_update",
        actor="admin",
        detail={"domains": domains, "attestation": request.attestation[:500]},
    )
    return {"status": "success", "tenantId": tenant_id, "domains": domains}


@router.put("/tenants/{tenant_id}/mssp-parent")
def admin_set_mssp_parent(
    tenant_id: str,
    request: MsspParentRequest,
    _: str = Depends(require_admin),
) -> dict:
    """R3: Link child tenant to MSSP parent for portfolio / white-label."""
    from app.tenant.settings import upsert_tenant_settings

    upsert_tenant_settings(tenant_id=tenant_id, settings={"msspParentTenantId": request.parentTenantId})
    log_action(
        tenant_id=tenant_id,
        action="mssp.parent_linked",
        actor="admin",
        detail={"parentTenantId": request.parentTenantId},
    )
    return {"status": "success", "tenantId": tenant_id, "msspParentTenantId": request.parentTenantId}


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
