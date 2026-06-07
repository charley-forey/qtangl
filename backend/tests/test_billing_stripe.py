"""Stripe billing webhook and subscription lifecycle tests."""

from __future__ import annotations

import hashlib
import hmac
import json
import time

import pytest

from app.billing.service import (
    handle_checkout_completed,
    handle_subscription_deleted,
    handle_subscription_updated,
    verify_stripe_webhook,
)


def test_verify_stripe_webhook_valid_signature(monkeypatch):
    secret = "whsec_test_secret"
    monkeypatch.setenv("QTANGL_STRIPE_WEBHOOK_SECRET", secret)
    payload = b'{"type":"checkout.session.completed","data":{"object":{}}}'
    timestamp = str(int(time.time()))
    signed = f"{timestamp}.{payload.decode()}".encode()
    sig = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    header = f"t={timestamp},v1={sig}"
    event = verify_stripe_webhook(payload, header)
    assert event is not None
    assert event["type"] == "checkout.session.completed"


def test_verify_stripe_webhook_rejects_bad_signature(monkeypatch):
    monkeypatch.setenv("QTANGL_STRIPE_WEBHOOK_SECRET", "whsec_test")
    event = verify_stripe_webhook(b"{}", "t=1,v1=bad")
    assert event is None


def test_handle_checkout_completed_missing_email():
    result = handle_checkout_completed({"metadata": {"company": "Acme"}, "customer_email": ""})
    assert result["provisioned"] is False


def test_handle_subscription_updated_maps_cancelled():
    result = handle_subscription_updated({"status": "canceled", "customer": "cus_missing", "id": "sub_1"})
    assert result["updated"] is False


def test_handle_subscription_deleted_no_tenant():
    result = handle_subscription_deleted({"customer": "cus_unknown", "id": "sub_1"})
    assert result["updated"] is False
