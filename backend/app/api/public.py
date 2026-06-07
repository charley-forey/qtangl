from __future__ import annotations

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


class MonitorProvisionRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    company: str = Field(min_length=2, max_length=200)
    adminSecret: str


class LeadCaptureRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    source: str = Field(default="mini-assessment", max_length=128)
    scenario: str = Field(default="", max_length=64)


class UnsubscribeRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)


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
        success_url=f"{base}/dashboard?signup=success",
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
        result = provision_monitor_tenant(email=body.email, company=body.company)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return {"status": "success", **result}


@router.post("/lead-capture")
def public_lead_capture(body: LeadCaptureRequest) -> dict:
    """Capture mini-assessment lead and trigger onboarding drip step 1."""
    result = capture_lead(email=body.email, source=body.source, scenario=body.scenario)
    return {"status": "success", **result}


@router.post("/unsubscribe")
def public_unsubscribe(body: UnsubscribeRequest) -> dict:
    ok = unsubscribe_lead(email=body.email)
    return {"status": "success" if ok else "not_found", "unsubscribed": ok}


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
        if obj.get("metadata", {}).get("product") == "pqc-monitor":
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
