from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from app.tenants.service import create_tenant, issue_api_key

logger = logging.getLogger(__name__)


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
    tenant_id = company.lower().replace(" ", "-")[:48] or None
    tenant = create_tenant(tenant_id=tenant_id, name=company)
    key = issue_api_key(tenant_id=tenant["tenantId"], label="monitor-primary")
    from app.notifications.email import send_report_email

    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    send_report_email(
        to_email=email,
        scan_id="onboarding",
        target_domain=company,
        report_url=f"{base}/dashboard",
        readiness_band="Monitor tier activated",
        subject_prefix="[Qtangl Welcome]",
        body_extra=f"Your tenant API key: {key['apiKey']} — store securely.",
    )
    return {"tenantId": tenant["tenantId"], "apiKey": key["apiKey"]}
