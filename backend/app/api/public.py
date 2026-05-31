from __future__ import annotations

import os

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.billing.service import (
    create_monitor_checkout_session,
    handle_checkout_completed,
    provision_monitor_tenant,
    stripe_configured,
    verify_stripe_webhook,
)

router = APIRouter(prefix="/public", tags=["public"])


class MonitorSignupRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    company: str = Field(min_length=2, max_length=200)


class MonitorProvisionRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    company: str = Field(min_length=2, max_length=200)
    adminSecret: str


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


@router.post("/stripe-webhook")
async def stripe_webhook(request: Request) -> dict:
    """Stripe checkout.session.completed → auto-provision Monitor tenant."""
    payload = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    event = verify_stripe_webhook(payload, signature)
    if event is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature.")
    if event.get("type") == "checkout.session.completed":
        session = event.get("data", {}).get("object", {})
        if session.get("metadata", {}).get("product") == "pqc-monitor":
            result = handle_checkout_completed(session)
            return {"status": "success", **result}
    return {"status": "ignored", "type": event.get("type")}
