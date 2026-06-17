from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import require_bff_secret
from app.auth_workos.capabilities import compute_dashboard_capabilities, compute_onboarding_hint
from app.auth_workos.service import (
    get_user_by_workos_id,
    link_onboarding_for_user,
    link_pending_invites_for_user,
    list_user_memberships,
    upsert_user,
)
from app.auth_workos.session import mint_session_key, sign_bff_session
from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import Tenant

router = APIRouter(prefix="/internal/dashboard", tags=["internal-dashboard"])


@router.get("/bootstrap")
def dashboard_bootstrap(
    workos_user_id: str = Query(min_length=3),
    email: str = Query(min_length=3),
    name: str | None = Query(default=None),
    active_tenant_id: str | None = Query(default=None),
    onboarding_token: str | None = Query(default=None, min_length=8),
    _: None = Depends(require_bff_secret),
) -> dict:
    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable.")
    user_id = upsert_user(workos_user_id=workos_user_id, email=email, name=name)
    link_onboarding_for_user(user_id=user_id, email=email, onboarding_token=onboarding_token)
    link_pending_invites_for_user(user_id=user_id, email=email)
    memberships = list_user_memberships(user_id=user_id)
    if not memberships:
        from app.billing.service import provision_dashboard_workspace

        provisioned = provision_dashboard_workspace(user_id=user_id, email=email, name=name)
        if provisioned:
            memberships = list_user_memberships(user_id=user_id)
    if not memberships:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No organization membership found for this user.",
        )
    active = None
    if active_tenant_id:
        active = next((m for m in memberships if m["tenantId"] == active_tenant_id), None)
    if active is None:
        active = memberships[0]
    tenant_id = active["tenantId"]
    role = active["role"]
    auth_mode = active.get("authMode", "magic_link")
    tenant_name = active.get("tenantName", tenant_id)
    with db_session() as session:
        tenant = session.get(Tenant, tenant_id)
        if tenant is not None:
            auth_mode = tenant.auth_mode
            tenant_name = tenant.name
    session_assertion = sign_bff_session(
        tenant_id=tenant_id,
        user_id=user_id,
        role=role,
        email=email,
    )
    session_key = mint_session_key(tenant_id=tenant_id, user_id=user_id)
    return {
        "status": "success",
        "userId": user_id,
        "email": email,
        "tenantId": tenant_id,
        "tenantName": tenant_name,
        "role": role,
        "authMode": auth_mode,
        "memberships": memberships,
        "sessionAssertion": session_assertion,
        "sessionKey": session_key,
        "capabilities": compute_dashboard_capabilities(tenant_id=tenant_id, role=role),
        "onboarding": compute_onboarding_hint(tenant_id=tenant_id),
    }


@router.post("/link-invite")
def dashboard_link_invite(
    workos_user_id: str = Query(min_length=3),
    email: str = Query(min_length=3),
    _: None = Depends(require_bff_secret),
) -> dict:
    if not persistence_enabled():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable.")
    user = get_user_by_workos_id(workos_user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    linked = link_pending_invites_for_user(user_id=user["userId"], email=email)
    memberships = list_user_memberships(user_id=user["userId"])
    return {"status": "success", "linked": linked, "memberships": memberships}


@router.get("/user")
def dashboard_user_lookup(
    workos_user_id: str = Query(min_length=3),
    _: None = Depends(require_bff_secret),
) -> dict:
    user = get_user_by_workos_id(workos_user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    memberships = list_user_memberships(user_id=user["userId"])
    return {"status": "success", **user, "memberships": memberships}
