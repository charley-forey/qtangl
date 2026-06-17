from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid
from typing import Any

from app.tenants.service import create_tenant, issue_api_key

logger = logging.getLogger(__name__)

STRIPE_WEBHOOK_TOLERANCE_SEC = 300

TIER_FROM_PRODUCT = {
    "pqc-monitor": "monitor",
    "pqc-convert": "convert",
    "pqc-enterprise": "enterprise",
}


def tier_from_stripe_price_id(price_id: str | None) -> str:
    if not price_id:
        return "monitor"
    price_map = {
        os.environ.get("QTANGL_STRIPE_MONITOR_PRICE_ID"): "monitor",
        os.environ.get("QTANGL_STRIPE_CONVERT_PRICE_ID"): "convert",
        os.environ.get("QTANGL_STRIPE_ENTERPRISE_PRICE_ID"): "enterprise",
    }
    return price_map.get(price_id, "monitor")


def tier_from_stripe_metadata(metadata: dict[str, Any]) -> str:
    product = str(metadata.get("product") or "")
    return TIER_FROM_PRODUCT.get(product, "monitor")


def _slug_tenant_id(company: str) -> str:
    import re

    slug = re.sub(r"[^a-z0-9-]", "", company.lower().replace(" ", "-").replace("_", "-"))
    slug = slug.strip("-")[:40] or "monitor"
    return slug


def stripe_configured() -> bool:
    return bool(os.environ.get("QTANGL_STRIPE_SECRET_KEY"))


def create_monitor_checkout_session(
    *,
    email: str,
    company: str,
    success_url: str,
    cancel_url: str,
) -> dict[str, Any]:
    secret = os.environ.get("QTANGL_STRIPE_SECRET_KEY")
    price_id = os.environ.get("QTANGL_STRIPE_MONITOR_PRICE_ID")
    if not secret or not price_id:
        return {"ok": False, "reason": "stripe_unconfigured"}

    payload = urllib.parse.urlencode(
        {
            "mode": "subscription",
            "customer_email": email,
            "success_url": success_url,
            "cancel_url": cancel_url,
            "line_items[0][price]": price_id,
            "line_items[0][quantity]": "1",
            "metadata[company]": company,
            "metadata[product]": "pqc-monitor",
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        "https://api.stripe.com/v1/checkout/sessions",
        data=payload,
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            session = json.loads(response.read().decode("utf-8"))
            return {"ok": True, "checkoutUrl": session.get("url"), "sessionId": session.get("id")}
    except urllib.error.HTTPError as exc:
        logger.warning("Stripe checkout failed: %s", exc.read().decode()[:200])
        return {"ok": False, "reason": f"stripe_http_{exc.code}"}
    except Exception as exc:
        return {"ok": False, "reason": str(exc)}


def provision_monitor_tenant(*, email: str, company: str) -> dict[str, Any]:
    """Create tenant + API key after successful payment (or manual admin trigger)."""
    base_id = _slug_tenant_id(company)
    tenant_id = base_id
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import Tenant

    if persistence_enabled():
        with db_session() as session:
            if session.get(Tenant, tenant_id) is not None:
                tenant_id = f"{base_id}-{uuid.uuid4().hex[:8]}"
    tenant = create_tenant(tenant_id=tenant_id, name=company, admin_email=email)
    key = issue_api_key(tenant_id=tenant["tenantId"], label="monitor-primary")
    from app.billing.entitlements import upsert_tenant_subscription

    upsert_tenant_subscription(tenant_id=tenant["tenantId"], tier="monitor")
    from app.billing.onboarding_tokens import create_onboarding_token
    from app.notifications.email import send_report_email

    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    token_info = create_onboarding_token(
        tenant_id=tenant["tenantId"],
        api_key=key["apiKey"],
        email=email,
    )
    onboarding_v2 = os.getenv("QTANGL_ONBOARDING_V2", "false").lower() in {"1", "true", "yes"}
    retrieve_url = f"{base}/dashboard/login?onboarding={token_info['token']}"
    assess_url = f"{base}/assess?onboarding={token_info['token']}&mode=production"
    if onboarding_v2:
        body_extra = (
            "Your Monitor workspace is ready. Sign in with the secure link below (expires in 24 hours).\n\n"
            f"Dashboard: {retrieve_url}\n"
            f"Assess production mode: {assess_url}\n\n"
            "Create automation API keys in Settings after your first login."
        )
    else:
        body_extra = (
            "Your Monitor workspace is ready. Open the secure link below once to retrieve your "
            "tenant API key (expires in 24 hours). Store it in a password manager — we cannot resend it.\n\n"
            f"Dashboard (recommended): {retrieve_url}\n"
            f"Assess production mode: {assess_url}"
        )
    send_report_email(
        to_email=email,
        scan_id="onboarding",
        target_domain=company,
        report_url=retrieve_url,
        readiness_band="Monitor tier activated",
        subject_prefix="[Qtangl Welcome]",
        body_extra=body_extra,
    )
    return {"tenantId": tenant["tenantId"], "onboardingTokenExpiresAt": token_info["expiresAt"]}


def verify_stripe_webhook(payload: bytes, signature_header: str) -> dict[str, Any] | None:
    """Verify Stripe webhook signature and return parsed event."""
    secret = os.environ.get("QTANGL_STRIPE_WEBHOOK_SECRET")
    if not secret:
        return None
    try:
        import hmac
        import hashlib
        import time

        parts = dict(item.split("=", 1) for item in signature_header.split(",") if "=" in item)
        timestamp = parts.get("t", "")
        sig = parts.get("v1", "")
        if not timestamp or not sig:
            return None
        try:
            ts_int = int(timestamp)
        except ValueError:
            return None
        if abs(int(time.time()) - ts_int) > STRIPE_WEBHOOK_TOLERANCE_SEC:
            return None
        signed = f"{timestamp}.{payload.decode('utf-8')}".encode()
        expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, sig):
            return None
        return json.loads(payload.decode("utf-8"))
    except Exception:
        return None


def handle_checkout_completed(session: dict[str, Any]) -> dict[str, Any]:
    """Provision tenant when checkout.session.completed fires."""
    from app.billing.entitlements import upsert_subscription

    metadata = session.get("metadata") or {}
    company = metadata.get("company") or session.get("customer_details", {}).get("name") or "Monitor"
    email = session.get("customer_email") or session.get("customer_details", {}).get("email") or ""
    if not email:
        return {"provisioned": False, "reason": "missing_email"}
    result = provision_monitor_tenant(email=email, company=company)
    tier = tier_from_stripe_metadata(metadata)
    upsert_subscription(
        tenant_id=result["tenantId"],
        tier=tier,
        stripe_customer_id=session.get("customer"),
        stripe_subscription_id=session.get("subscription"),
        status="active",
    )
    return {"provisioned": True, **result}


def handle_subscription_updated(subscription: dict[str, Any]) -> dict[str, Any]:
    from app.billing.entitlements import upsert_subscription

    status_map = {
        "active": "active",
        "trialing": "active",
        "past_due": "past_due",
        "canceled": "cancelled",
        "unpaid": "cancelled",
        "incomplete": "incomplete",
    }
    stripe_status = str(subscription.get("status", "active"))
    mapped = status_map.get(stripe_status, "active")
    customer_id = subscription.get("customer")
    sub_id = subscription.get("id")
    tenant_id = _tenant_id_for_stripe_customer(customer_id)
    if not tenant_id:
        return {"updated": False, "reason": "tenant_not_found"}
    price_id = None
    items = subscription.get("items") or {}
    data = items.get("data") if isinstance(items, dict) else None
    if data:
        price_id = (data[0].get("price") or {}).get("id")
    metadata = subscription.get("metadata") or {}
    if mapped == "active":
        tier = tier_from_stripe_metadata(metadata) if metadata.get("product") else tier_from_stripe_price_id(price_id)
    else:
        tier = "free"
    upsert_subscription(
        tenant_id=tenant_id,
        tier=tier,
        stripe_customer_id=str(customer_id) if customer_id else None,
        stripe_subscription_id=str(sub_id) if sub_id else None,
        status=mapped,
    )
    return {"updated": True, "tenantId": tenant_id, "status": mapped}


def handle_subscription_deleted(subscription: dict[str, Any]) -> dict[str, Any]:
    from app.billing.entitlements import upsert_subscription

    customer_id = subscription.get("customer")
    tenant_id = _tenant_id_for_stripe_customer(customer_id)
    if not tenant_id:
        return {"updated": False, "reason": "tenant_not_found"}
    upsert_subscription(
        tenant_id=tenant_id,
        tier="free",
        stripe_customer_id=str(customer_id) if customer_id else None,
        stripe_subscription_id=None,
        status="cancelled",
    )
    return {"updated": True, "tenantId": tenant_id, "status": "cancelled"}


def handle_payment_failed(invoice: dict[str, Any]) -> dict[str, Any]:
    customer_id = invoice.get("customer")
    tenant_id = _tenant_id_for_stripe_customer(customer_id)
    if not tenant_id:
        return {"updated": False, "reason": "tenant_not_found"}
    from app.billing.entitlements import upsert_subscription

    upsert_subscription(
        tenant_id=tenant_id,
        tier="monitor",
        stripe_customer_id=str(customer_id) if customer_id else None,
        status="past_due",
    )
    return {"updated": True, "tenantId": tenant_id, "status": "past_due"}


def _tenant_id_for_stripe_customer(customer_id: str | None) -> str | None:
    if not customer_id:
        return None
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantSubscription as SubscriptionRow

    if not persistence_enabled():
        return None
    with db_session() as session:
        row = (
            session.query(SubscriptionRow)
            .filter(SubscriptionRow.stripe_customer_id == customer_id)
            .one_or_none()
        )
        return row.tenant_id if row else None


def create_billing_portal_session(*, customer_id: str, return_url: str) -> dict[str, Any]:
    secret = os.environ.get("QTANGL_STRIPE_SECRET_KEY")
    if not secret or not customer_id:
        return {"ok": False, "reason": "stripe_unconfigured"}
    payload = urllib.parse.urlencode(
        {"customer": customer_id, "return_url": return_url}
    ).encode("utf-8")
    request = urllib.request.Request(
        "https://api.stripe.com/v1/billing_portal/sessions",
        data=payload,
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            session = json.loads(response.read().decode("utf-8"))
            return {"ok": True, "portalUrl": session.get("url")}
    except Exception as exc:
        return {"ok": False, "reason": str(exc)}


def provision_assess_tenant(*, email: str, company: str, domain: str | None = None) -> dict[str, Any]:
    """Create free-tier Assess tenant with onboarding token (self-serve R2)."""
    base_id = _slug_tenant_id(company)
    tenant_id = base_id
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import Tenant

    if persistence_enabled():
        with db_session() as session:
            if session.get(Tenant, tenant_id) is not None:
                tenant_id = f"{base_id}-{uuid.uuid4().hex[:8]}"
    tenant = create_tenant(tenant_id=tenant_id, name=company, admin_email=email)
    key = issue_api_key(tenant_id=tenant["tenantId"], label="assess-primary")
    from app.billing.entitlements import upsert_tenant_subscription
    from app.billing.onboarding_tokens import create_onboarding_token
    from app.notifications.email import send_report_email
    from app.tenant.settings import set_tenant_scan_allowlist

    upsert_tenant_subscription(tenant_id=tenant["tenantId"], tier="free")
    if domain:
        email_domain = email.split("@")[-1].lower()
        normalized = domain.lower().strip()
        if normalized == email_domain or normalized.endswith(f".{email_domain}"):
            set_tenant_scan_allowlist(tenant_id=tenant["tenantId"], domains=[normalized])

    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    token_info = create_onboarding_token(
        tenant_id=tenant["tenantId"],
        api_key=key["apiKey"],
        email=email,
    )
    onboarding_v2 = os.getenv("QTANGL_ONBOARDING_V2", "false").lower() in {"1", "true", "yes"}
    login_url = f"{base}/dashboard/login?onboarding={token_info['token']}"
    assess_url = f"{base}/assess?onboarding={token_info['token']}&mode=production"
    if onboarding_v2:
        body_extra = (
            "Your Assess workspace is ready. Sign in with the secure link below (expires in 24 hours).\n\n"
            f"Sign in: {login_url}\n"
            f"Assess production mode: {assess_url}"
        )
    else:
        body_extra = (
            "Your Assess workspace is ready. Open the secure link below once to retrieve your "
            f"tenant API key (expires in 24 hours).\n\n{assess_url}"
        )
    send_report_email(
        to_email=email,
        scan_id="assess-signup",
        target_domain=company,
        report_url=login_url if onboarding_v2 else assess_url,
        readiness_band="Assess free tier",
        subject_prefix="[Qtangl Assess]",
        body_extra=body_extra,
    )
    return {
        "tenantId": tenant["tenantId"],
        "onboardingTokenExpiresAt": token_info["expiresAt"],
        "assessUrl": assess_url,
    }


def dashboard_self_serve_signup_enabled() -> bool:
    return os.getenv("QTANGL_DASHBOARD_SELF_SERVE_SIGNUP", "true").lower() in {"1", "true", "yes"}


def provision_dashboard_workspace(*, user_id: str, email: str, name: str | None = None) -> dict[str, Any] | None:
    """First WorkOS sign-in from /dashboard — create free-tier tenant + admin membership."""
    if not dashboard_self_serve_signup_enabled():
        return None
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantMembership
    from app.billing.entitlements import upsert_tenant_subscription

    if not persistence_enabled():
        return None

    email_l = email.lower().strip()
    domain = email_l.split("@")[-1] if "@" in email_l else "workspace"
    company = (name or "").strip() or domain.split(".")[0].replace("-", " ").title() or "Workspace"

    tenant = create_tenant(tenant_id=None, name=company, admin_email=email_l, auth_mode="magic_link")
    tenant_id = tenant["tenantId"]
    upsert_tenant_subscription(tenant_id=tenant_id, tier="free")
    issue_api_key(tenant_id=tenant_id, label="dashboard-primary", role="admin")

    mem_id = f"mem-{uuid.uuid4().hex[:12]}"
    with db_session() as session:
        session.add(
            TenantMembership(
                id=mem_id,
                tenant_id=tenant_id,
                user_id=user_id,
                role="admin",
            )
        )
    logger.info("Self-serve dashboard workspace provisioned tenant=%s user=%s", tenant_id, user_id)
    return {"tenantId": tenant_id, "tenantName": company, "role": "admin", "membershipId": mem_id}
