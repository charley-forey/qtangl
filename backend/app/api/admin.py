from __future__ import annotations

from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends, HTTPException, Query, status

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
