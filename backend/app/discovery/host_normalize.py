from __future__ import annotations

import hashlib
from typing import Any

from app.pqc.models import CryptoAsset, QuantumVulnerability
from app.pqc.vulnerability import classify_algorithm

FINDING_TYPE_TO_KIND = {
    "certificate": "host_cert",
    "library": "host_library",
    "listener": "host_listener",
    "config": "host_config",
    "runtime_crypto": "runtime_crypto",
}


def finding_dedupe_key(finding: dict[str, Any]) -> str:
    if finding.get("findingId"):
        return str(finding["findingId"])
    raw = "|".join(
        [
            str(finding.get("hostId", "")),
            str(finding.get("findingType", "")),
            str(finding.get("location", "")),
            str(finding.get("fingerprint", "")),
        ]
    )
    return hashlib.sha256(raw.encode()).hexdigest()


def finding_to_crypto_asset(finding: dict[str, Any], *, agent_hostname: str) -> CryptoAsset:
    finding_type = str(finding.get("findingType", "certificate"))
    kind = FINDING_TYPE_TO_KIND.get(finding_type, "host_cert")
    algorithm = str(finding.get("algorithm") or finding.get("libraryName") or "unknown")
    key_size = finding.get("keySize")
    if isinstance(key_size, str) and key_size.isdigit():
        key_size = int(key_size)
    elif not isinstance(key_size, int):
        key_size = None
    vuln = classify_algorithm(algorithm, key_size=key_size)
    host = str(finding.get("hostname") or agent_hostname)
    location = str(finding.get("location") or host)
    fid = finding_dedupe_key(finding)
    asset_id = f"host-{kind}-{fid[:16]}"
    label = f"{kind}:{location}" if location else f"{kind}:{host}"
    confidence = str(finding.get("confidence", "medium"))
    mosca_priority = {"high": 0.9, "medium": 0.6, "low": 0.3}.get(confidence, 0.5)
    if vuln.status == "broken":
        mosca_priority = min(1.0, mosca_priority + 0.2)
    return CryptoAsset(
        id=asset_id,
        kind=kind,  # type: ignore[arg-type]
        host=host,
        port=finding.get("port") if isinstance(finding.get("port"), int) else None,
        label=label,
        algorithm=algorithm,
        key_size=key_size,
        validity_days=None,
        san_domains=[],
        negotiated_cipher=None,
        negotiated_group=None,
        tls_version=None,
        vulnerability=QuantumVulnerability(
            algorithm=vuln.algorithm,
            key_size=vuln.key_size,
            shor_logical_qubits=vuln.shor_logical_qubits,
            classical_security_bits=vuln.classical_security_bits,
            status=vuln.status,
            hndl_exposed=vuln.hndl_exposed,
            pqc_replacement=vuln.pqc_replacement,
            severity=vuln.severity,
            summary=vuln.summary,
        ),
        hndl_verdict=vuln.summary,
        already_too_late=vuln.hndl_exposed and vuln.status == "broken",
        mosca_priority=mosca_priority,
        standards_refs=[],
        pqc_ready=False,
        metadata={
            "findingId": fid,
            "findingType": finding_type,
            "fingerprint": finding.get("fingerprint"),
            "libraryVersion": finding.get("libraryVersion"),
            "confidence": confidence,
        },
    )


def findings_to_assets(findings: list[dict[str, Any]], *, agent_hostname: str) -> list[CryptoAsset]:
    return [finding_to_crypto_asset(f, agent_hostname=agent_hostname) for f in findings]
