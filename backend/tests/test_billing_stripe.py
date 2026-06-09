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


def test_verify_stripe_webhook_rejects_stale_timestamp(monkeypatch):
    secret = "whsec_test_secret"
    monkeypatch.setenv("QTANGL_STRIPE_WEBHOOK_SECRET", secret)
    payload = b'{"type":"checkout.session.completed","data":{"object":{}}}'
    stale_timestamp = str(int(time.time()) - 600)
    signed = f"{stale_timestamp}.{payload.decode()}".encode()
    sig = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    header = f"t={stale_timestamp},v1={sig}"
    event = verify_stripe_webhook(payload, header)
    assert event is None


def test_tier_from_stripe_price_id(monkeypatch):
    from app.billing.service import tier_from_stripe_price_id

    monkeypatch.setenv("QTANGL_STRIPE_CONVERT_PRICE_ID", "price_convert")
    assert tier_from_stripe_price_id("price_convert") == "convert"
    assert tier_from_stripe_price_id("price_unknown") == "monitor"


def test_handle_checkout_completed_missing_email():
    result = handle_checkout_completed({"metadata": {"company": "Acme"}, "customer_email": ""})
    assert result["provisioned"] is False


def test_handle_subscription_updated_maps_cancelled():
    result = handle_subscription_updated({"status": "canceled", "customer": "cus_missing", "id": "sub_1"})
    assert result["updated"] is False


def test_handle_subscription_deleted_no_tenant():
    result = handle_subscription_deleted({"customer": "cus_unknown", "id": "sub_1"})
    assert result["updated"] is False


def test_provision_monitor_email_excludes_plaintext_api_key(monkeypatch, tmp_path):
    """Welcome email must use onboarding link only — never the raw API key."""
    import os

    from app.billing.service import provision_monitor_tenant

    db_path = tmp_path / "billing.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
    os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"

    import app.db.engine as engine_module

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None

    from app.db.engine import init_db

    init_db()

    plaintext_key = "qtangl_plaintext_key_must_not_email_abc123"
    captured: list[dict] = []

    def fake_issue_api_key(**kwargs):
        return {"apiKey": plaintext_key, "keyId": "key-onboard-test"}

    def fake_send_report_email(**kwargs):
        captured.append(kwargs)
        return {"sent": True}

    monkeypatch.setattr("app.billing.service.issue_api_key", fake_issue_api_key)
    monkeypatch.setattr("app.notifications.email.send_report_email", fake_send_report_email)

    provision_monitor_tenant(email="buyer@example.com", company="Acme Monitor")

    assert captured, "expected welcome email to be attempted"
    email_kwargs = captured[0]
    body_extra = email_kwargs.get("body_extra") or ""
    report_url = email_kwargs.get("report_url") or ""
    combined = f"{body_extra}\n{report_url}"
    assert plaintext_key not in combined
    assert "onboarding=" in combined

    if engine_module._engine is not None:
        engine_module._engine.dispose()
    engine_module._engine = None
    engine_module._SessionLocal = None
    os.environ.pop("DATABASE_URL", None)
