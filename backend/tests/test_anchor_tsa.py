"""Tests for RFC 3161 TSA anchoring."""

from __future__ import annotations

from app.pqc.anchor_tsa import request_tsa_timestamp


def test_tsa_skipped_without_url(monkeypatch):
    monkeypatch.delenv("QTANGL_ANCHOR_TSA_URL", raising=False)
    assert request_tsa_timestamp("a" * 64) is None
