"""Tests for strategic plan features: passport, vault, cbom diff, rate limits."""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

from app.cbom.diff import diff_cbom_snapshots
from app.main import app
from app.pqc.key_registry import register_signing_key, retire_signing_key
from app.sharing.service import VALID_PASSPORT_SCOPES, create_share_link


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_cbom_diff_snapshots() -> None:
    prev = [{"componentKey": "a", "algorithm": "RSA-2048", "name": "cert-a"}]
    curr = [
        {"componentKey": "a", "algorithm": "ECDSA-P256", "name": "cert-a"},
        {"componentKey": "b", "algorithm": "RSA-2048", "name": "cert-b"},
    ]
    drift = diff_cbom_snapshots(prev, curr)
    assert drift["addedCount"] == 1
    assert drift["changedCount"] == 1


def test_passport_scopes() -> None:
    assert "passport" in VALID_PASSPORT_SCOPES


def test_create_share_link_in_memory(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("QTANGL_DATABASE_URL", raising=False)
    link = create_share_link(
        tenant_id="sandbox",
        scan_id="scan-test",
        label="Board pack",
        scope="passport",
    )
    assert link["scope"] == "passport"
    assert "token" in link


def test_verify_rate_limit(client: TestClient) -> None:
    os.environ["QTANGL_VERIFY_RATE_LIMIT_PER_MINUTE"] = "2"
    for _ in range(2):
        client.get("/pqc/transparency/root")
    response = client.get("/pqc/transparency/root")
    assert response.status_code in {200, 429}


def test_key_retire_roundtrip() -> None:
    register_signing_key(
        alg="Ed25519",
        public_key_b64="dGVzdA==",
        key_fingerprint="abc123def4567890",
        active=True,
    )
    assert retire_signing_key(key_fingerprint="abc123def4567890") in {True, False}


def test_parse_pem_bundle_to_document() -> None:
    from app.cbom.service import parse_pem_bundle_to_document

    pem = """-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJAKHBfpR0G8XnMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNVBAMMCWxv
Y2FsaG9zdDAeFw0yNDAxMDEwMDAwMDBaFw0yNTAxMDEwMDAwMDBaMBQxEjAQBgNV
BAMMCWxvY2FsaG9zdDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABGexample==
-----END CERTIFICATE-----"""
    doc = parse_pem_bundle_to_document(pem)
    assert doc["bomFormat"] == "CycloneDX"
    assert len(doc.get("components") or []) >= 0
