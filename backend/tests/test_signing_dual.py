"""Tests for dual ML-DSA + Ed25519 signing."""

from __future__ import annotations

from app.pqc.signing import content_hash_for_payload, sign_report_payload, verify_report_signature


def test_dual_signatures_golden_hash_stable():
    payload = {"scanId": "golden-dual", "readinessScore": 72.5, "targetDomain": "example.com"}
    h1 = content_hash_for_payload(payload)
    signed = sign_report_payload(payload)
    h2 = content_hash_for_payload(payload)
    assert h1 == h2
    assert signed["contentHash"] == h1


def test_sign_and_verify_ed25519():
    payload = {"scanId": "dual-1", "readinessScore": 55.0}
    signed = sign_report_payload(payload)
    result = verify_report_signature(payload, signed)
    assert result["valid"] is True
    per = result.get("perSignature") or []
    assert len(per) >= 1
    assert any(s.get("valid") for s in per)


def test_signatures_array_present():
    payload = {"scanId": "dual-2", "readinessScore": 60.0}
    signed = sign_report_payload(payload)
    assert "signatures" in signed
    assert isinstance(signed["signatures"], list)
    assert signed["alg"] == signed["signatures"][0]["alg"]
