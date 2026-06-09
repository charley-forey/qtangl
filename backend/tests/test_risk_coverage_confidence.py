from __future__ import annotations

from app.discovery.host_normalize import finding_to_crypto_asset
from app.pqc.risk import coverage_confidence_for_assets


def test_coverage_confidence_boosts_with_host_and_code():
    host = finding_to_crypto_asset(
        {
            "schemaVersion": 1,
            "findingId": "h1",
            "findingType": "certificate",
            "hostId": "host-1",
            "hostname": "app01",
            "os": "linux",
            "algorithm": "RSA-2048",
            "confidence": "high",
        },
        agent_hostname="app01",
    )
    host.metadata["sourceMethod"] = "qtangl:host-sensor"
    code = finding_to_crypto_asset(
        {
            "schemaVersion": 1,
            "findingId": "c1",
            "findingType": "source_code",
            "hostId": "repo",
            "hostname": "repo",
            "os": "linux",
            "algorithm": "RSA-2048",
            "confidence": "medium",
            "reachability": "confirmed",
        },
        agent_hostname="repo",
    )
    code.kind = "source_code"  # type: ignore[misc]
    code.metadata["sourceMethod"] = "qtangl:code-scan"
    result = coverage_confidence_for_assets([host, code])
    assert result["score"] > 50
    assert result["discoveryMethods"]["hostFindings"] == 1
    assert result["discoveryMethods"]["codeFindings"] == 1
