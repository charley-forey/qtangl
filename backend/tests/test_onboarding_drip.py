"""Onboarding drip lead capture tests."""

from __future__ import annotations

from app.notifications.lead_drip import capture_lead, unsubscribe_lead
from app.notifications.onboarding import ONBOARDING_DRIP_SUBJECTS, send_onboarding_email


def test_send_onboarding_email_invalid_step():
    result = send_onboarding_email(to_email="test@example.com", step=99)
    assert result["sent"] is False
    assert result["reason"] == "invalid_step"


def test_send_onboarding_email_smtp_unconfigured(monkeypatch):
    monkeypatch.delenv("QTANGL_SMTP_HOST", raising=False)
    result = send_onboarding_email(to_email="test@example.com", step=1)
    assert result["sent"] is False
    assert result["reason"] == "smtp_unconfigured"


def test_capture_lead_without_persistence(monkeypatch):
    monkeypatch.setattr("app.notifications.lead_drip.persistence_enabled", lambda: False)
    result = capture_lead(email="lead@example.com", source="mini-assessment-bank", scenario="bank")
    assert result["captured"] is True
    assert result["persisted"] is False


def test_drip_has_five_steps():
    assert len(ONBOARDING_DRIP_SUBJECTS) == 5


def test_unsubscribe_without_persistence(monkeypatch):
    monkeypatch.setattr("app.notifications.lead_drip.persistence_enabled", lambda: False)
    assert unsubscribe_lead(email="x@y.com") is False
