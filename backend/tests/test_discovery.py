from __future__ import annotations

from app.discovery.host_normalize import finding_dedupe_key, finding_to_crypto_asset
from app.discovery.schema import validate_finding


def test_validate_finding_rejects_private_key():
    ok, reason = validate_finding(
        {
            "schemaVersion": 1,
            "findingId": "x",
            "findingType": "certificate",
            "hostId": "h",
            "hostname": "host",
            "os": "linux",
            "confidence": "high",
            "algorithm": "BEGIN PRIVATE KEY",
        }
    )
    assert not ok
    assert "Private key" in reason


def test_finding_dedupe_stable():
    f = {
        "hostId": "abc",
        "findingType": "certificate",
        "location": "/etc/ssl/cert.pem",
        "fingerprint": "sha256:abc",
    }
    assert finding_dedupe_key(f) == finding_dedupe_key(f)


def test_finding_to_crypto_asset_host_cert():
    asset = finding_to_crypto_asset(
        {
            "schemaVersion": 1,
            "findingId": "cert-1",
            "findingType": "certificate",
            "hostId": "host-1",
            "hostname": "app01",
            "os": "linux",
            "location": "/etc/ssl/cert.pem",
            "algorithm": "RSA-2048",
            "keySize": 2048,
            "confidence": "high",
        },
        agent_hostname="app01",
    )
    assert asset.kind == "host_cert"
    assert asset.host == "app01"
