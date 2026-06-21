from __future__ import annotations

from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.admin.platform_service import (
    get_tenant_detail_admin,
    list_tenants_admin,
    list_users_admin,
    patch_tenant_tier_admin,
    platform_summary,
)

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


class TenantSettingsAdminRequest(BaseModel):
    settings: dict = Field(default_factory=dict)


class PatchTenantRequest(BaseModel):
    tier: str = Field(pattern="^(free|monitor|convert|enterprise)$")


def _ops_actor(request: Request) -> str:
    header = request.headers.get("X-Qtangl-Ops-Actor", "").strip()
    return header or "admin"


@router.get("/platform/summary")
def admin_platform_summary(_: str = Depends(require_admin)) -> dict:
    return platform_summary()


@router.get("/tenants")
def admin_list_tenants(
    search: str | None = Query(default=None),
    tier: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: str = Depends(require_admin),
) -> dict:
    return list_tenants_admin(search=search, tier=tier, limit=limit, offset=offset)


@router.get("/tenants/{tenant_id}")
def admin_get_tenant(tenant_id: str, _: str = Depends(require_admin)) -> dict:
    detail = get_tenant_detail_admin(tenant_id=tenant_id)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return detail


@router.patch("/tenants/{tenant_id}")
def admin_patch_tenant(
    tenant_id: str,
    request: PatchTenantRequest,
    http_request: Request,
    _: str = Depends(require_admin),
) -> dict:
    try:
        payload = patch_tenant_tier_admin(tenant_id=tenant_id, tier=request.tier)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    log_action(
        tenant_id=tenant_id,
        action="subscription.tier_updated",
        actor=_ops_actor(http_request),
        detail={"tier": request.tier},
    )
    return payload


@router.get("/users")
def admin_list_users(
    search: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: str = Depends(require_admin),
) -> dict:
    return list_users_admin(search=search, limit=limit, offset=offset)


@router.post("/tenants")
def admin_create_tenant(
    request: CreateTenantRequest,
    http_request: Request,
    _: str = Depends(require_admin),
) -> dict:
    try:
        auth_mode = "sso_required" if request.tier == "enterprise" else "magic_link"
        tenant = create_tenant(tenant_id=request.tenantId, name=request.name, auth_mode=auth_mode)
        subscription = upsert_tenant_subscription(
            tenant_id=tenant["tenantId"],
            tier=request.tier,
        )
        log_action(
            tenant_id=tenant["tenantId"],
            action="tenant.admin_created",
            actor=_ops_actor(http_request),
            detail={"name": request.name, "tier": request.tier},
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
    http_request: Request,
    _: str = Depends(require_admin),
) -> dict:
    try:
        domains = set_tenant_scan_allowlist(tenant_id=tenant_id, domains=request.domains)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    log_action(
        tenant_id=tenant_id,
        action="authorized_domains.admin_update",
        actor=_ops_actor(http_request),
        detail={"domains": domains, "attestation": request.attestation[:500]},
    )
    return {"status": "success", "tenantId": tenant_id, "domains": domains}


@router.put("/tenants/{tenant_id}/mssp-parent")
def admin_set_mssp_parent(
    tenant_id: str,
    request: MsspParentRequest,
    http_request: Request,
    _: str = Depends(require_admin),
) -> dict:
    """R3: Link child tenant to MSSP parent for portfolio / white-label."""
    from app.partner.service import link_child_tenant
    from app.tenant.settings import upsert_tenant_settings

    upsert_tenant_settings(tenant_id=tenant_id, settings={"msspParentTenantId": request.parentTenantId})
    link_child_tenant(
        parent_tenant_id=request.parentTenantId,
        child_tenant_id=tenant_id,
        label="portfolio-child",
    )
    log_action(
        tenant_id=tenant_id,
        action="mssp.parent_linked",
        actor=_ops_actor(http_request),
        detail={"parentTenantId": request.parentTenantId},
    )
    return {"status": "success", "tenantId": tenant_id, "msspParentTenantId": request.parentTenantId}


@router.put("/tenants/{tenant_id}/settings")
def admin_upsert_tenant_settings(
    tenant_id: str,
    request: TenantSettingsAdminRequest,
    http_request: Request,
    _: str = Depends(require_admin),
) -> dict:
    from app.tenant.settings import upsert_tenant_settings

    merged = upsert_tenant_settings(tenant_id=tenant_id, settings=request.settings)
    log_action(
        tenant_id=tenant_id,
        action="settings.admin_update",
        actor=_ops_actor(http_request),
        detail={"keys": list(request.settings.keys())[:20]},
    )
    return {"status": "success", "tenantId": tenant_id, "settings": merged}


@router.post("/tenants/{tenant_id}/keys")
def admin_issue_key(
    tenant_id: str,
    request: IssueKeyRequest,
    http_request: Request,
    _: str = Depends(require_admin),
) -> dict:
    try:
        payload = issue_api_key(tenant_id=tenant_id, label=request.label)
        log_action(
            tenant_id=tenant_id,
            action="api_key.admin_issued",
            actor=_ops_actor(http_request),
            detail={"keyId": payload.get("keyId"), "label": request.label},
        )
        return payload
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


@router.get("/analytics/funnel")
def admin_analytics_funnel(
    days: int = Query(default=30, ge=1, le=365),
    _: str = Depends(require_admin),
) -> dict:
    """Internal golden-path funnel snapshot from tenant product state."""
    from datetime import datetime, timedelta, timezone

    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import Tenant
    from app.store.scan_jobs import list_jobs_for_tenant
    from app.tenant.settings import get_tenant_settings_raw

    if not persistence_enabled():
        return {
            "status": "success",
            "days": days,
            "funnel": [],
            "totals": {"tenants": 0},
        }

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    stages = {
        "signup": 0,
        "first_scan": 0,
        "assess_paid": 0,
        "schedule_created": 0,
        "verify_succeeded": 0,
        "board_export": 0,
    }
    with db_session() as session:
        tenants = session.query(Tenant).all()
    for tenant in tenants:
        created = tenant.created_at
        if created and created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if created and created < cutoff:
            continue
        stages["signup"] += 1
        tenant_id = tenant.id
        scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=5)
        if any(scan.get("status") == "done" for scan in scans):
            stages["first_scan"] += 1
        settings = get_tenant_settings_raw(tenant_id=tenant_id)
        billing = settings.get("billing") or {}
        if billing.get("assessPaidAt"):
            stages["assess_paid"] += 1
        from app.monitoring.service import list_schedules

        if list_schedules(tenant_id=tenant_id):
            stages["schedule_created"] += 1
        milestones = (settings.get("coaching") or {}).get("milestones") or {}
        if milestones.get("firstVerifyAt"):
            stages["verify_succeeded"] += 1
        if milestones.get("firstBoardExportAt") or settings.get("lastBoardExportAt") or settings.get("lastBoardMeetingAt"):
            stages["board_export"] += 1

    ordered = [
        ("signup", stages["signup"]),
        ("first_scan", stages["first_scan"]),
        ("assess_paid", stages["assess_paid"]),
        ("schedule_created", stages["schedule_created"]),
        ("verify_succeeded", stages["verify_succeeded"]),
        ("board_export", stages["board_export"]),
    ]
    funnel = []
    previous = None
    for stage, count in ordered:
        conversion_pct = None
        if previous is not None and previous > 0:
            conversion_pct = round(100.0 * count / previous, 1)
        funnel.append({"stage": stage, "count": count, "conversionPct": conversion_pct})
        previous = count

    return {
        "status": "success",
        "days": days,
        "funnel": funnel,
        "totals": {"tenants": stages["signup"]},
    }
