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
    domain: str | None = None,
) -> dict[str, Any]:
    secret = os.environ.get("QTANGL_STRIPE_SECRET_KEY")
    price_id = os.environ.get("QTANGL_STRIPE_MONITOR_PRICE_ID")
    if not secret or not price_id:
        return {"ok": False, "reason": "stripe_unconfigured"}

    fields: dict[str, str] = {
        "mode": "subscription",
        "customer_email": email,
        "success_url": success_url,
        "cancel_url": cancel_url,
        "line_items[0][price]": price_id,
        "line_items[0][quantity]": "1",
        "metadata[company]": company,
        "metadata[email]": email,
        "metadata[product]": "pqc-monitor",
    }
    if domain:
        fields["metadata[domain]"] = domain.strip()

    payload = urllib.parse.urlencode(fields).encode("utf-8")

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


def create_tenant_checkout_session(
    *,
    tenant_id: str,
    email: str,
    product: str,
    success_url: str,
    cancel_url: str,
    stripe_customer_id: str | None = None,
) -> dict[str, Any]:
    """Checkout for logged-in tenant: one-time assess or monitor subscription."""
    secret = os.environ.get("QTANGL_STRIPE_SECRET_KEY")
    if not secret:
        return {"ok": False, "reason": "stripe_unconfigured"}

    if product == "assess":
        price_id = os.environ.get("QTANGL_STRIPE_ASSESS_PRICE_ID")
        mode = "payment"
        meta_product = "pqc-assess"
    elif product == "monitor":
        price_id = os.environ.get("QTANGL_STRIPE_MONITOR_PRICE_ID")
        mode = "subscription"
        meta_product = "pqc-monitor-upgrade"
    else:
        return {"ok": False, "reason": "invalid_product"}

    if not price_id:
        return {"ok": False, "reason": "stripe_price_unconfigured"}

    fields: dict[str, str] = {
        "mode": mode,
        "success_url": success_url,
        "cancel_url": cancel_url,
        "line_items[0][price]": price_id,
        "line_items[0][quantity]": "1",
        "metadata[tenant_id]": tenant_id,
        "metadata[product]": meta_product,
        "metadata[email]": email,
    }
    if stripe_customer_id:
        fields["customer"] = stripe_customer_id
    else:
        fields["customer_email"] = email

    payload = urllib.parse.urlencode(fields).encode("utf-8")
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
        logger.warning("Stripe tenant checkout failed: %s", exc.read().decode()[:200])
        return {"ok": False, "reason": f"stripe_http_{exc.code}"}
    except Exception as exc:
        return {"ok": False, "reason": str(exc)}


def find_tenant_id_for_email(*, email: str) -> str | None:
    """Resolve an existing tenant for this email (membership or pending onboarding)."""
    email_l = email.lower().strip()
    if not email_l:
        return None
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantMembership, User

    if persistence_enabled():
        with db_session() as session:
            user = session.query(User).filter(User.email == email_l).one_or_none()
            if user is not None:
                membership = (
                    session.query(TenantMembership)
                    .filter(TenantMembership.user_id == user.id)
                    .order_by(TenantMembership.created_at.desc())
                    .first()
                )
                if membership is not None:
                    return membership.tenant_id

    from app.billing.onboarding_tokens import find_onboarding_tenant_for_email

    return find_onboarding_tenant_for_email(email=email_l)


def _seed_monitor_allowlist(*, tenant_id: str, email: str, domain: str | None) -> bool:
    if not domain or not _domain_allowlist_seeded(email=email, domain=domain):
        return False
    from app.tenant.settings import append_tenant_scan_allowlist

    append_tenant_scan_allowlist(tenant_id=tenant_id, domain=domain.strip())
    return True


def _reset_onboarding_for_checkout(*, tenant_id: str) -> None:
    from app.tenant.settings import patch_tenant_onboarding_state

    patch_tenant_onboarding_state(
        tenant_id=tenant_id,
        patch={"dismissed": False, "complete": False, "step": "company"},
    )


def _monitor_welcome_email(
    *,
    email: str,
    company: str,
    tenant_id: str,
    api_key: str,
    upgraded: bool = False,
) -> dict[str, str]:
    from app.billing.onboarding_tokens import create_onboarding_token
    from app.notifications.email import send_report_email

    token_info = create_onboarding_token(tenant_id=tenant_id, api_key=api_key, email=email)
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    onboarding_v2 = os.getenv("QTANGL_ONBOARDING_V2", "false").lower() in {"1", "true", "yes"}
    retrieve_url = f"{base}/dashboard/login?onboarding={token_info['token']}"
    assess_url = f"{base}/assess?onboarding={token_info['token']}&mode=production"
    headline = "Your Monitor subscription is active." if upgraded else "Your Monitor workspace is ready."
    if onboarding_v2:
        body_extra = (
            f"{headline} Sign in with the secure link below (expires in 24 hours).\n\n"
            f"Dashboard: {retrieve_url}\n"
            f"Assess production mode: {assess_url}\n\n"
            "Create automation API keys in Settings after your first login."
        )
    else:
        body_extra = (
            f"{headline} Open the secure link below once to retrieve your "
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
    return {"expiresAt": token_info["expiresAt"], "loginUrl": retrieve_url}


def upgrade_monitor_tenant(
    *,
    email: str,
    company: str,
    tenant_id: str,
    domain: str | None = None,
    stripe_customer_id: str | None = None,
    stripe_subscription_id: str | None = None,
) -> dict[str, Any]:
    """Upgrade an existing tenant to Monitor after Stripe payment."""
    from app.billing.entitlements import upsert_subscription
    from app.tenants.service import issue_api_key

    upsert_subscription(
        tenant_id=tenant_id,
        tier="monitor",
        stripe_customer_id=stripe_customer_id,
        stripe_subscription_id=stripe_subscription_id,
        status="active",
    )
    allowlist_seeded = _seed_monitor_allowlist(tenant_id=tenant_id, email=email, domain=domain)
    _reset_onboarding_for_checkout(tenant_id=tenant_id)
    key = issue_api_key(tenant_id=tenant_id, label="monitor-primary", role="admin")
    welcome = _monitor_welcome_email(
        email=email,
        company=company,
        tenant_id=tenant_id,
        api_key=key["apiKey"],
        upgraded=True,
    )
    _notify_crm_monitor_signup(
        email=email,
        company=company,
        domain=domain,
        tenant_id=tenant_id,
        upgraded=True,
        allowlist_seeded=allowlist_seeded,
    )
    from app.audit.service import log_action

    log_action(
        tenant_id=tenant_id,
        action="billing.monitor_upgraded",
        actor="stripe",
        detail={"email": email, "upgradedExisting": True},
    )
    logger.info("Upgraded existing tenant=%s to monitor tier", tenant_id)
    return {
        "tenantId": tenant_id,
        "upgraded": True,
        "allowlistSeeded": allowlist_seeded,
        "onboardingTokenExpiresAt": welcome["expiresAt"],
    }


def provision_monitor_tenant(*, email: str, company: str, domain: str | None = None) -> dict[str, Any]:
    """Create tenant + API key after successful payment (or manual admin trigger)."""
    existing = find_tenant_id_for_email(email=email)
    if existing:
        return upgrade_monitor_tenant(
            email=email,
            company=company,
            tenant_id=existing,
            domain=domain,
        )

    core = _provision_tenant_core(
        email=email,
        company=company,
        tier="monitor",
        source="stripe_monitor",
        domain=domain,
        api_key_label="monitor-primary",
    )
    tenant_id = core["tenantId"]
    allowlist_seeded = _domain_allowlist_seeded(email=email, domain=domain)
    _reset_onboarding_for_checkout(tenant_id=tenant_id)
    welcome = _monitor_welcome_email(
        email=email,
        company=company,
        tenant_id=tenant_id,
        api_key=core["apiKey"],
        upgraded=False,
    )
    _notify_crm_monitor_signup(
        email=email,
        company=company,
        domain=domain,
        tenant_id=tenant_id,
        upgraded=False,
        allowlist_seeded=allowlist_seeded,
    )
    return {
        "tenantId": tenant_id,
        "onboardingTokenExpiresAt": welcome["expiresAt"],
        "allowlistSeeded": allowlist_seeded,
    }


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


def handle_assess_checkout_completed(session: dict[str, Any]) -> dict[str, Any]:
    from app.billing.entitlements import mark_assess_paid, upsert_subscription

    metadata = session.get("metadata") or {}
    tenant_id = str(metadata.get("tenant_id") or "")
    if not tenant_id:
        return {"provisioned": False, "reason": "missing_tenant_id"}
    mark_assess_paid(tenant_id=tenant_id)
    upsert_subscription(
        tenant_id=tenant_id,
        tier="free",
        stripe_customer_id=session.get("customer"),
        status="active",
    )
    from app.audit.service import log_action

    log_action(tenant_id=tenant_id, action="billing.assess_paid", actor="stripe", detail={"sessionId": session.get("id")})
    try:
        from app.coaching.milestones import record_milestone

        record_milestone(tenant_id=tenant_id, name="assessPaidAt")
    except Exception:
        pass
    return {"provisioned": True, "tenantId": tenant_id, "product": "assess"}


def handle_monitor_upgrade_completed(session: dict[str, Any]) -> dict[str, Any]:
    from app.billing.entitlements import upsert_subscription

    metadata = session.get("metadata") or {}
    tenant_id = str(metadata.get("tenant_id") or "")
    if not tenant_id:
        return {"provisioned": False, "reason": "missing_tenant_id"}
    email = str(metadata.get("email") or session.get("customer_email") or "")
    domain = metadata.get("domain")
    upsert_subscription(
        tenant_id=tenant_id,
        tier="monitor",
        stripe_customer_id=session.get("customer"),
        stripe_subscription_id=session.get("subscription"),
        status="active",
    )
    if email and domain:
        _seed_monitor_allowlist(tenant_id=tenant_id, email=email, domain=str(domain))
    _reset_onboarding_for_checkout(tenant_id=tenant_id)
    from app.audit.service import log_action

    log_action(tenant_id=tenant_id, action="billing.monitor_upgraded", actor="stripe", detail={"sessionId": session.get("id")})
    _notify_crm_monitor_signup(
        email=email,
        company=str(metadata.get("company") or tenant_id),
        domain=str(domain) if domain else None,
        tenant_id=tenant_id,
        upgraded=True,
        allowlist_seeded=bool(domain),
    )
    return {"provisioned": True, "tenantId": tenant_id, "product": "monitor"}


def handle_checkout_completed(session: dict[str, Any]) -> dict[str, Any]:
    """Provision tenant when checkout.session.completed fires."""
    metadata = session.get("metadata") or {}
    product = str(metadata.get("product") or "")

    if product == "pqc-assess":
        return handle_assess_checkout_completed(session)
    if product == "pqc-monitor-upgrade":
        return handle_monitor_upgrade_completed(session)

    from app.billing.entitlements import upsert_subscription

    company = metadata.get("company") or session.get("customer_details", {}).get("name") or "Monitor"
    email = (
        session.get("customer_email")
        or session.get("customer_details", {}).get("email")
        or metadata.get("email")
        or ""
    )
    domain = metadata.get("domain")
    if not email:
        return {"provisioned": False, "reason": "missing_email"}
    result = provision_monitor_tenant(email=email, company=company, domain=str(domain) if domain else None)
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


def _record_signup_audit(*, tenant_id: str, source: str, detail: dict[str, Any] | None = None) -> None:
    from app.audit.service import log_action

    payload = {"source": source, **(detail or {})}
    log_action(tenant_id=tenant_id, action="tenant.created", actor="system", detail=payload)
    log_action(tenant_id=tenant_id, action="signup.source", actor="system", detail={"source": source})


def _resolve_unique_tenant_id(company: str, *, explicit_id: str | None = None) -> str:
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import Tenant

    base_id = explicit_id or _slug_tenant_id(company)
    tenant_id = base_id
    if persistence_enabled():
        with db_session() as session:
            if session.get(Tenant, tenant_id) is not None:
                tenant_id = f"{base_id}-{uuid.uuid4().hex[:8]}"
    return tenant_id


def _provision_tenant_core(
    *,
    email: str,
    company: str,
    tier: str,
    source: str,
    tenant_id: str | None = None,
    domain: str | None = None,
    user_id: str | None = None,
    auth_mode: str = "magic_link",
    api_key_label: str = "primary",
    create_workos_org: bool = True,
) -> dict[str, Any]:
    """Shared tenant provisioning for assess signup, monitor checkout, and dashboard self-serve."""
    from app.billing.entitlements import upsert_tenant_subscription
    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantMembership
    from app.tenant.settings import set_tenant_scan_allowlist

    email_l = email.lower().strip()
    resolved_id = _resolve_unique_tenant_id(company, explicit_id=tenant_id)
    create_id = None if source == "dashboard_self_serve" else resolved_id
    tenant = create_tenant(
        tenant_id=create_id,
        name=company,
        admin_email=email_l,
        auth_mode=auth_mode,
    )
    tenant_id = tenant["tenantId"]
    upsert_tenant_subscription(tenant_id=tenant_id, tier=tier)
    key = issue_api_key(tenant_id=tenant_id, label=api_key_label, role="admin")

    if domain:
        email_domain = email_l.split("@")[-1]
        normalized = domain.lower().strip()
        if normalized == email_domain or normalized.endswith(f".{email_domain}"):
            set_tenant_scan_allowlist(tenant_id=tenant_id, domains=[normalized])

    if create_workos_org:
        try:
            from app.auth_workos.service import create_organization

            create_organization(tenant_id=tenant_id, name=company)
        except Exception as exc:
            logger.warning("WorkOS org creation skipped for tenant=%s source=%s: %s", tenant_id, source, exc)

    membership_id: str | None = None
    if user_id and persistence_enabled():
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
        membership_id = mem_id

    _record_signup_audit(
        tenant_id=tenant_id,
        source=source,
        detail={"email": email_l, "tier": tier, "membershipId": membership_id},
    )
    logger.info("Provisioned tenant=%s source=%s tier=%s", tenant_id, source, tier)
    return {
        "tenantId": tenant_id,
        "tenantName": company,
        "apiKey": key["apiKey"],
        "membershipId": membership_id,
        "role": "admin" if membership_id else None,
    }


def _notify_crm_signup(
    *,
    event: str,
    email: str,
    company: str,
    domain: str | None,
    tenant_id: str,
    extra: dict[str, Any] | None = None,
) -> None:
    """Optional CRM webhook when QTANGL_CRM_WEBHOOK_URL is set."""
    url = os.environ.get("QTANGL_CRM_WEBHOOK_URL", "").strip()
    if not url:
        return
    payload: dict[str, Any] = {
        "event": event,
        "email": email,
        "company": company,
        "domain": domain,
        "tenantId": tenant_id,
    }
    if extra:
        payload.update(extra)
    try:
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status >= 400:
                logger.warning("CRM webhook returned HTTP %s", response.status)
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        logger.warning("CRM webhook failed: %s", exc)


def _notify_crm_assess_signup(
    *,
    email: str,
    company: str,
    domain: str | None,
    tenant_id: str,
) -> None:
    _notify_crm_signup(
        event="assess_signup",
        email=email,
        company=company,
        domain=domain,
        tenant_id=tenant_id,
    )


def _notify_crm_monitor_signup(
    *,
    email: str,
    company: str,
    domain: str | None,
    tenant_id: str,
    upgraded: bool,
    allowlist_seeded: bool,
) -> None:
    _notify_crm_signup(
        event="monitor_signup",
        email=email,
        company=company,
        domain=domain,
        tenant_id=tenant_id,
        extra={"upgradedExisting": upgraded, "allowlistSeeded": allowlist_seeded, "source": "stripe_monitor"},
    )


def assess_signup_rate_limited(*, email: str) -> bool:
    """Simple in-memory rate limit per email domain (abuse prevention)."""
    import time

    limit = int(os.getenv("QTANGL_ASSESS_SIGNUP_LIMIT_PER_HOUR", "5"))
    if limit <= 0:
        return False
    email_l = email.lower().strip()
    domain = email_l.split("@")[-1] if "@" in email_l else email_l
    now = time.time()
    window = 3600.0
    if not hasattr(assess_signup_rate_limited, "_hits"):
        assess_signup_rate_limited._hits = {}  # type: ignore[attr-defined]
    hits: dict[str, list[float]] = assess_signup_rate_limited._hits  # type: ignore[attr-defined]
    bucket = hits.setdefault(domain, [])
    bucket[:] = [t for t in bucket if now - t < window]
    if len(bucket) >= limit:
        return True
    bucket.append(now)
    return False


def lead_capture_rate_limited(*, email: str) -> bool:
    """Rate limit mini-assessment / lead capture per email domain."""
    import time

    limit = int(os.getenv("QTANGL_LEAD_CAPTURE_LIMIT_PER_HOUR", "10"))
    if limit <= 0:
        return False
    email_l = email.lower().strip()
    domain = email_l.split("@")[-1] if "@" in email_l else email_l
    now = time.time()
    window = 3600.0
    if not hasattr(lead_capture_rate_limited, "_hits"):
        lead_capture_rate_limited._hits = {}  # type: ignore[attr-defined]
    hits: dict[str, list[float]] = lead_capture_rate_limited._hits  # type: ignore[attr-defined]
    bucket = hits.setdefault(domain, [])
    bucket[:] = [t for t in bucket if now - t < window]
    if len(bucket) >= limit:
        return True
    bucket.append(now)
    return False


def _domain_allowlist_seeded(*, email: str, domain: str | None) -> bool:
    if not domain:
        return False
    email_l = email.lower().strip()
    email_domain = email_l.split("@")[-1]
    normalized = domain.lower().strip()
    return normalized == email_domain or normalized.endswith(f".{email_domain}")


def provision_assess_tenant(*, email: str, company: str, domain: str | None = None) -> dict[str, Any]:
    """Create free-tier Assess tenant with onboarding token (self-serve R2)."""
    core = _provision_tenant_core(
        email=email,
        company=company,
        tier="free",
        source="assess_signup",
        domain=domain,
        api_key_label="assess-primary",
    )
    tenant_id = core["tenantId"]
    from app.billing.onboarding_tokens import create_onboarding_token
    from app.notifications.email import send_report_email

    token_info = create_onboarding_token(
        tenant_id=tenant_id,
        api_key=core["apiKey"],
        email=email,
    )
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    onboarding_v2 = os.getenv("QTANGL_ONBOARDING_V2", "false").lower() in {"1", "true", "yes"}
    login_url = f"{base}/dashboard/login?onboarding={token_info['token']}"
    assess_url = f"{base}/assess?onboarding={token_info['token']}&mode=production"
    allowlist_seeded = _domain_allowlist_seeded(email=email, domain=domain)
    if onboarding_v2:
        body_extra = (
            "Your Assess workspace is ready. Sign in with the secure link below (expires in 24 hours).\n\n"
            f"Sign in (recommended): {login_url}\n"
            f"Assess production mode: {assess_url}"
        )
    else:
        body_extra = (
            "Your Assess workspace is ready.\n\n"
            f"Sign in to dashboard: {login_url}\n"
            f"Or open Assess production mode: {assess_url}\n\n"
            "The onboarding link expires in 24 hours."
        )
    send_report_email(
        to_email=email,
        scan_id="assess-signup",
        target_domain=company,
        report_url=login_url,
        readiness_band="Assess free tier",
        subject_prefix="[Qtangl Assess]",
        body_extra=body_extra,
    )
    warning = None
    if domain and not allowlist_seeded:
        warning = (
            "Domain did not match your work email domain and was not added to your scan allowlist. "
            "Add authorized domains in the dashboard after sign-in."
        )
    elif not domain:
        warning = "No domain provided — add authorized domains in the dashboard before running a live scan."
    _notify_crm_assess_signup(email=email, company=company, domain=domain, tenant_id=tenant_id)
    return {
        "tenantId": tenant_id,
        "onboardingTokenExpiresAt": token_info["expiresAt"],
        "assessUrl": assess_url,
        "loginUrl": login_url,
        "allowlistSeeded": allowlist_seeded,
        "warning": warning,
    }


def dashboard_self_serve_signup_enabled() -> bool:
    return os.getenv("QTANGL_DASHBOARD_SELF_SERVE_SIGNUP", "true").lower() in {"1", "true", "yes"}


def provision_dashboard_workspace(*, user_id: str, email: str, name: str | None = None) -> dict[str, Any] | None:
    """First WorkOS sign-in from /dashboard — create free-tier tenant + admin membership."""
    if not dashboard_self_serve_signup_enabled():
        return None
    from app.db.config import persistence_enabled

    if not persistence_enabled():
        return None

    email_l = email.lower().strip()
    domain = email_l.split("@")[-1] if "@" in email_l else "workspace"
    company = (name or "").strip() or domain.split(".")[0].replace("-", " ").title() or "Workspace"

    core = _provision_tenant_core(
        email=email_l,
        company=company,
        tier="free",
        source="dashboard_self_serve",
        user_id=user_id,
        auth_mode="magic_link",
        api_key_label="dashboard-primary",
    )
    if email_l.endswith("@qtangl.com"):
        from app.tenant.settings import upsert_tenant_settings

        upsert_tenant_settings(
            tenant_id=core["tenantId"],
            settings={"orgType": "internal_hq", "dogfoodMirrorEnabled": True},
        )
    return {
        "tenantId": core["tenantId"],
        "tenantName": core["tenantName"],
        "role": core["role"],
        "membershipId": core["membershipId"],
    }
