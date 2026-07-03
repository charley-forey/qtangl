"""MSSP child tenant provisioning."""

from __future__ import annotations

from typing import Any

from app.billing.entitlements import upsert_tenant_subscription
from app.partner.invite import send_partner_customer_welcome
from app.partner.service import link_child_tenant
from app.partner.tiers import partner_tier_limits
from app.tenant.settings import set_tenant_scan_allowlist, upsert_tenant_settings
from app.tenants.service import create_tenant, issue_api_key


def provision_child_tenant(
    *,
    parent_tenant_id: str,
    customer_name: str,
    label: str,
    tier: str,
    primary_domain: str | None = None,
    invite_email: str | None = None,
    invite_role: str = "customer_executive",
    inviter_user_id: str | None = None,
) -> dict[str, Any]:
    limits = partner_tier_limits(tenant_id=parent_tenant_id)
    if limits.get("customerInvites") is False and invite_email:
        raise ValueError("Customer invites require Advanced or Premier partner tier.")

    tenant = create_tenant(name=customer_name)
    child_tenant_id = tenant["tenantId"]
    upsert_tenant_subscription(tenant_id=child_tenant_id, tier=tier)
    issue_api_key(tenant_id=child_tenant_id, label="primary", role="admin")

    if primary_domain:
        normalized = primary_domain.strip().lower()
        if normalized:
            set_tenant_scan_allowlist(tenant_id=child_tenant_id, domains=[normalized])

    link = link_child_tenant(
        parent_tenant_id=parent_tenant_id,
        child_tenant_id=child_tenant_id,
        label=label or customer_name,
    )
    upsert_tenant_settings(
        tenant_id=child_tenant_id,
        settings={"msspParentTenantId": parent_tenant_id},
    )

    invite_result: dict[str, Any] | None = None
    welcome: dict[str, str] | None = None
    email = (invite_email or "").strip().lower()
    if email:
        from app.auth_workos.service import invite_user

        invite_result = invite_user(
            tenant_id=child_tenant_id,
            email=email,
            role=invite_role,
            inviter_user_id=inviter_user_id,
        )
        try:
            welcome = send_partner_customer_welcome(
                parent_tenant_id=parent_tenant_id,
                child_tenant_id=child_tenant_id,
                customer_name=customer_name,
                invite_email=email,
                invite_role=invite_role,
                invite_result=invite_result,
            )
        except Exception:
            welcome = None

    return {
        "childTenantId": child_tenant_id,
        "childTenantName": customer_name,
        "linked": True,
        "link": link,
        "invite": invite_result,
        "welcomeEmail": welcome,
        "deepLink": f"/command-center?tab=portfolio",
    }
