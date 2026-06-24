"""Branded partner customer welcome email."""

from __future__ import annotations

import os
from typing import Any

from app.branding.resolve import resolve_branding
from app.notifications.email import send_report_email


def send_partner_customer_welcome(
    *,
    parent_tenant_id: str,
    child_tenant_id: str,
    customer_name: str,
    invite_email: str,
    invite_role: str,
    invite_result: dict[str, Any] | None = None,
) -> dict[str, str]:
    branding = resolve_branding(parent_tenant_id)
    report = branding.get("reportBranding") or {}
    partner_name = str(report.get("partnerDisplayName") or report.get("companyName") or "Your security partner")
    support = str(report.get("supportEmail") or "").strip()
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    login_url = f"{base}/dashboard/login?welcome=invite"
    subject_prefix = f"[{partner_name}]"
    body_lines = [
        f"Welcome to {customer_name}'s quantum readiness workspace.",
        f"Prepared by {partner_name}.",
        "",
        f"You have been invited as {invite_role.replace('_', ' ')}.",
        f"Sign in: {login_url}",
    ]
    if support:
        body_lines.extend(["", f"Questions? Contact {support}."])
    if invite_result and invite_result.get("localOnly"):
        body_lines.append("")
        body_lines.append("(Invitation recorded locally — WorkOS email may follow separately.)")
    send_report_email(
        to_email=invite_email,
        scan_id="partner-onboarding",
        target_domain=customer_name,
        report_url=login_url,
        readiness_band="Workspace ready",
        subject_prefix=subject_prefix,
        body_extra="\n".join(body_lines),
    )
    return {"sentTo": invite_email, "childTenantId": child_tenant_id}
