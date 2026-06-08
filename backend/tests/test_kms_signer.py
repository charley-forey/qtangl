"""Tests for KMS signer (mocked)."""

from __future__ import annotations

from app.pqc.kms_signer import decrypt_envelope_key


def test_decrypt_envelope_none_without_config(monkeypatch):
    monkeypatch.delenv("QTANGL_SIGNING_KEY_ENC_B64", raising=False)
    assert decrypt_envelope_key() is None
