from __future__ import annotations

from app.pqc.models import CryptoAsset, RemediationItem


def explain_asset(asset: CryptoAsset) -> str:
    """Plain-language 'what this means' line for an asset finding."""
    kind = asset.kind
    status = asset.vulnerability.status
    hndl = asset.vulnerability.hndl_exposed or asset.already_too_late

    if asset.pqc_ready:
        return (
            f"{asset.label} already negotiates hybrid/PQC — maintain configuration and monitor "
            "for downgrade attacks."
        )

    if hndl and status in {"at-risk", "broken"}:
        return (
            f"{asset.label} uses {asset.algorithm} which an adversary could break with a future "
            "quantum computer. Intercepted traffic today may be decrypted later (HNDL risk)."
        )

    if kind == "tls" and status == "at-risk":
        return (
            f"Visitors to {asset.host} rely on {asset.algorithm} for transport security. "
            "Plan hybrid ML-KEM migration before NIST deprecation deadlines."
        )

    if kind == "jwks":
        return (
            f"API tokens signed with {asset.algorithm} on {asset.host} will need ML-DSA rotation "
            "with dual-key overlap for existing token TTLs."
        )

    if kind == "ssh":
        return (
            f"SSH access to {asset.host} uses {asset.algorithm}. Schedule host-key rotation "
            "during maintenance windows."
        )

    if status == "safe":
        return f"{asset.label} is classically secure today; monitor PQC migration timelines."

    return asset.hndl_verdict or asset.vulnerability.summary or "Manual review recommended."


def top_priorities(
    assets: list[CryptoAsset],
    backlog: list[RemediationItem],
    *,
    limit: int = 3,
) -> list[dict[str, str]]:
    """Top N priority actions from mosca_priority and remediation backlog."""
    ranked = sorted(
        assets,
        key=lambda asset: (-asset.mosca_priority, asset.vulnerability.severity == "critical"),
    )
    priorities: list[dict[str, str]] = []
    for asset in ranked[:limit]:
        priorities.append(
            {
                "title": f"Migrate {asset.label}",
                "action": explain_asset(asset),
                "severity": asset.vulnerability.severity,
            }
        )
    if len(priorities) < limit:
        for item in backlog[: limit - len(priorities)]:
            priorities.append(
                {
                    "title": item.title,
                    "action": item.summary,
                    "severity": item.severity,
                }
            )
    return priorities[:limit]
