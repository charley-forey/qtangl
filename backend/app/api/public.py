from __future__ import annotations

import json
import os

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.billing.service import (
    create_monitor_checkout_session,
    handle_checkout_completed,
    handle_payment_failed,
    handle_subscription_deleted,
    handle_subscription_updated,
    provision_monitor_tenant,
    stripe_configured,
    verify_stripe_webhook,
)
from app.notifications.lead_drip import capture_lead, unsubscribe_lead

router = APIRouter(prefix="/public", tags=["public"])


class MonitorSignupRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    company: str = Field(min_length=2, max_length=200)
    domain: str | None = Field(default=None, max_length=253)


class MonitorProvisionRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    company: str = Field(min_length=2, max_length=200)
    domain: str | None = Field(default=None, max_length=253)
    adminSecret: str


class LeadCaptureRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    source: str = Field(default="mini-assessment", max_length=128)
    scenario: str = Field(default="", max_length=64)


class UnsubscribeRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)


class AssessSignupRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    company: str = Field(min_length=2, max_length=200)
    domain: str | None = Field(default=None, max_length=253)


@router.post("/assess-signup")
def public_assess_signup(body: AssessSignupRequest) -> dict:
    """Self-serve Assess signup — free tier tenant + onboarding token."""
    from app.billing.service import assess_signup_rate_limited, provision_assess_tenant

    if assess_signup_rate_limited(email=body.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many signup attempts for this email. Try again later.",
        )
    try:
        result = provision_assess_tenant(email=body.email, company=body.company, domain=body.domain)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return {"status": "success", **result}


@router.post("/monitor-signup")
def public_monitor_signup(body: MonitorSignupRequest) -> dict:
    """Start Monitor tier checkout (Stripe) or return contact instructions."""
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    if not stripe_configured():
        return {
            "status": "contact",
            "message": "Self-serve checkout is not enabled. Email hello@qtangl.com for a pilot.",
        }
    session = create_monitor_checkout_session(
        email=body.email,
        company=body.company,
        domain=body.domain,
        success_url=f"{base}/dashboard/login?signup=success",
        cancel_url=f"{base}/access?signup=cancelled",
    )
    if not session.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=session.get("reason", "Checkout unavailable"),
        )
    return {"status": "success", "checkoutUrl": session["checkoutUrl"]}


@router.post("/monitor-provision")
def public_monitor_provision(body: MonitorProvisionRequest) -> dict:
    """Manual provision after Stripe payment (webhook alternative for pilots)."""
    expected = os.environ.get("QTANGL_SIGNUP_PROVISION_SECRET")
    if not expected or body.adminSecret != expected:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid provision secret.")
    try:
        result = provision_monitor_tenant(email=body.email, company=body.company, domain=body.domain)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return {"status": "success", **result}


@router.post("/lead-capture")
def public_lead_capture(request: Request, body: LeadCaptureRequest) -> dict:
    """Capture mini-assessment lead and trigger onboarding drip step 1."""
    from app.billing.service import lead_capture_rate_limited

    if lead_capture_rate_limited(email=body.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many lead capture attempts for this email. Try again later.",
        )
    result = capture_lead(email=body.email, source=body.source, scenario=body.scenario)
    return {"status": "success", **result}


@router.post("/unsubscribe")
def public_unsubscribe(body: UnsubscribeRequest) -> dict:
    ok = unsubscribe_lead(email=body.email)
    return {"status": "success" if ok else "not_found", "unsubscribed": ok}


@router.get("/onboarding-key/{token}")
def public_redeem_onboarding_key(token: str, peek: bool = False) -> dict:
    """Onboarding after Assess/Monitor signup (24h TTL). Use peek=true for assess-first (non-destructive)."""
    from app.billing.onboarding_tokens import peek_onboarding_token, redeem_onboarding_token

    if peek:
        result = peek_onboarding_token(token)
    else:
        result = redeem_onboarding_token(token)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding link invalid, expired, or already used.",
        )
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    onboarding_v2 = os.getenv("QTANGL_ONBOARDING_V2", "false").lower() in {"1", "true", "yes"}
    login_url = f"{base}/dashboard/login?onboarding={token}"
    assess_url = f"{base}/assess?onboarding={token}&mode=production"
    if onboarding_v2 and not peek:
        return {
            "status": "success",
            "tenantId": result["tenantId"],
            "loginUrl": login_url,
            "dashboardUrl": login_url,
            "assessUrl": assess_url,
            "email": result.get("email"),
        }
    if onboarding_v2 and peek:
        return {
            "status": "success",
            "tenantId": result["tenantId"],
            "loginUrl": login_url,
            "dashboardUrl": login_url,
            "assessUrl": assess_url,
            "email": result.get("email"),
            "peek": True,
        }
    payload: dict = {
        "status": "success",
        "tenantId": result["tenantId"],
        "dashboardUrl": f"{base}/dashboard",
        "assessUrl": assess_url,
        "loginUrl": login_url,
        "email": result.get("email"),
    }
    if peek:
        payload["peek"] = True
    if result.get("apiKey"):
        payload["apiKey"] = result["apiKey"]
    return payload


@router.post("/workos/webhook")
async def workos_webhook(request: Request) -> dict:
    from app.audit.service import log_action
    from app.auth_workos.service import handle_webhook_event, verify_webhook_signature

    payload = await request.body()
    signature = request.headers.get("WorkOS-Signature", "")
    if not verify_webhook_signature(payload, signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature.")
    try:
        event = json.loads(payload.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload.") from exc
    result = handle_webhook_event(event)
    membership = result.get("membership") or {}
    tenant_id = membership.get("tenantId") or result.get("tenantId")
    if tenant_id:
        log_action(
            tenant_id=str(tenant_id),
            action=f"workos.{result.get('event', 'event')}",
            actor=str(membership.get("email") or "workos"),
            detail={"handled": result.get("handled"), "event": result.get("event")},
        )
    return {"status": "success", **result}


@router.post("/stripe-webhook")
async def stripe_webhook(request: Request) -> dict:
    """Stripe lifecycle events → provision or update Monitor tenant."""
    payload = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    event = verify_stripe_webhook(payload, signature)
    if event is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature.")

    event_type = event.get("type")
    obj = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        metadata = obj.get("metadata") or {}
        product = metadata.get("product")
        if product in {"pqc-monitor", "pqc-assess", "pqc-monitor-upgrade"}:
            result = handle_checkout_completed(obj)
            return {"status": "success", **result}
    elif event_type == "customer.subscription.updated":
        result = handle_subscription_updated(obj)
        return {"status": "success", **result}
    elif event_type == "customer.subscription.deleted":
        result = handle_subscription_deleted(obj)
        return {"status": "success", **result}
    elif event_type == "invoice.payment_failed":
        result = handle_payment_failed(obj)
        return {"status": "success", **result}

    return {"status": "ignored", "type": event_type}
