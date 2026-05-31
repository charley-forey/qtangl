from __future__ import annotations

from typing import Any

from app.pqc.models import CryptoAsset, RemediationItem
from app.pqc.references import framework_url


def default_standards() -> dict[str, Any]:
    return {
        "frameworks": [
            {
                "id": "fips-203",
                "name": "FIPS 203 (ML-KEM)",
                "summary": "Module-Lattice-Based Key-Encapsulation Mechanism",
            },
            {
                "id": "fips-204",
                "name": "FIPS 204 (ML-DSA)",
                "summary": "Module-Lattice-Based Digital Signature Algorithm",
            },
            {
                "id": "fips-205",
                "name": "FIPS 205 (SLH-DSA)",
                "summary": "Stateless Hash-Based Digital Signature Algorithm",
            },
            {
                "id": "sp-800-208",
                "name": "NIST SP 800-208",
                "summary": "Stateful hash signatures for firmware/code signing",
            },
            {
                "id": "cnsa-2.0",
                "name": "CNSA 2.0",
                "summary": "NSA commercial national security algorithm suite 2.0",
                "deadline": "2030-2033",
            },
            {
                "id": "nsm-10",
                "name": "NSM-10",
                "summary": "National Security Memorandum on post-quantum cryptography",
                "deadline": "2035",
            },
            {
                "id": "nist-ir-8547",
                "name": "NIST IR 8547",
                "summary": "Transition to post-quantum cryptography standards",
                "deadline": "2030",
            },
            {
                "id": "pci-dss-4",
                "name": "PCI-DSS 4.0",
                "summary": "Cryptographic agility and inventory expectations",
            },
            {
                "id": "cmmc",
                "name": "CMMC / FedRAMP",
                "summary": "Federal contractor cryptographic inventory and migration",
            },
        ],
        "mappings": {
            "rsa": ["nist-ir-8547", "cnsa-2.0", "nsm-10", "pci-dss-4"],
            "ecdsa": ["fips-204", "nist-ir-8547", "cnsa-2.0"],
            "ecdh": ["fips-203", "nist-ir-8547", "cnsa-2.0"],
            "tls": ["nist-ir-8547", "pci-dss-4", "cmmc"],
            "jwks": ["fips-204", "pci-dss-4"],
            "ssh": ["nist-ir-8547", "cmmc"],
            "email": ["pci-dss-4", "nist-ir-8547"],
            "code_signing": ["sp-800-208", "fips-205"],
            "document_signing": ["sp-800-208", "fips-205"],
        },
    }


def standards_refs_for_asset(asset: CryptoAsset, standards: dict[str, Any]) -> list[str]:
    mappings: dict[str, list[str]] = standards.get("mappings", {})
    refs: list[str] = []
    algo = asset.algorithm.lower()
    if "rsa" in algo:
        refs.extend(mappings.get("rsa", []))
    elif "ec" in algo or "ed25519" in algo:
        refs.extend(mappings.get("ecdsa", []))
    refs.extend(mappings.get(asset.kind, []))
    # dedupe preserve order
    seen: set[str] = set()
    out: list[str] = []
    for ref in refs:
        if ref not in seen:
            seen.add(ref)
            out.append(ref)
    return out


def standards_summary_for_report(
    assets: list[CryptoAsset],
    standards: dict[str, Any],
    deadlines: dict[str, Any],
) -> list[dict[str, Any]]:
    frameworks = {item["id"]: item for item in standards.get("frameworks", [])}
    counts: dict[str, int] = {}
    for asset in assets:
        for ref in asset.standards_refs:
            counts[ref] = counts.get(ref, 0) + 1

    summary: list[dict[str, Any]] = []
    for ref_id, count in sorted(counts.items(), key=lambda item: -item[1]):
        framework = frameworks.get(ref_id, {"id": ref_id, "name": ref_id})
        deadline = deadlines.get(ref_id) or framework.get("deadline")
        summary.append(
            {
                "id": ref_id,
                "name": framework.get("name", ref_id),
                "assetCount": count,
                "deadline": deadline,
                "summary": framework.get("summary", ""),
                "url": framework_url(ref_id) or framework.get("url", ""),
            }
        )
    return summary


def deadline_for_asset(asset: CryptoAsset, deadlines: dict[str, Any]) -> str:
    for ref in asset.standards_refs:
        if ref in deadlines:
            return str(deadlines[ref])
    if asset.vulnerability.status == "broken":
        return str(deadlines.get("immediate", "Immediate"))
    return str(deadlines.get("default", "2030-12-31"))


def remediation_action_for_asset(asset: CryptoAsset) -> tuple[str, str]:
    """Return concrete (action, summary) migration guidance."""
    if asset.pqc_ready:
        return (
            "Maintain hybrid PQC configuration and monitor for downgrade",
            "Endpoint negotiates hybrid/PQC today. Document baseline, enable downgrade detection, "
            "and schedule certificate renewals with PQC-capable CA paths.",
        )

    algo = asset.algorithm.lower()
    kind = asset.kind

    if kind == "tls":
        if "ec" in algo or "ecdsa" in algo or "ed25519" in algo:
            return (
                "Deploy TLS 1.3 hybrid KEX (X25519MLKEM768) and migrate leaf certificate to ML-DSA-65",
                "Phase 1: enable hybrid key exchange on load balancers and API gateways. "
                "Phase 2: re-issue ECDSA leaf certificates via a PQC-capable CA. "
                "Maintain classical fallback during phased rollout with rollback plan.",
            )
        if "rsa" in algo:
            return (
                "Migrate to ML-KEM-768 hybrid key exchange and ML-DSA-65 certificate signatures",
                "Replace RSA key exchange with hybrid ML-KEM-768. Plan HSM/agility requirements "
                "for certificate rotation and validate client compatibility in staging.",
            )
        return (
            "Inventory TLS cipher suites and enable hybrid PQC per NIST IR 8547",
            "Document negotiated ciphers and groups, then pilot hybrid PQC on non-production endpoints.",
        )

    if kind == "jwks":
        return (
            "Rotate JWT signing keys to ML-DSA-65 (FIPS 204) with dual-key overlap",
            "Publish new JWKS with ML-DSA keys while retaining classical keys during token TTL overlap. "
            "Update OIDC clients and API gateways to accept both key sets.",
        )

    if kind == "ssh":
        if "rsa" in algo:
            return (
                "Replace SSH RSA host keys with ML-DSA or Ed25519 + document PQC roadmap",
                "Generate new host keys, update known_hosts inventory, and schedule bastion rotation "
                "during maintenance windows with operator notification.",
            )
        return (
            "Evaluate SSH host key against CNSA 2.0 timelines",
            "Ed25519 host keys are classically strong; plan PQC host-key migration when OpenSSH "
            "PQC host-key support is available in your baseline.",
        )

    if kind == "email":
        return (
            "Enable STARTTLS with ML-KEM hybrid where supported; upgrade MTA certificates",
            "Verify SMTP/IMAP TLS certificates, enable MTA-STS, and plan mail-gateway certificate "
            "migration aligned with PCI-DSS 4.0 transit encryption requirements.",
        )

    if kind in {"code_signing", "document_signing"}:
        return (
            "Migrate code/document signing to SLH-DSA (FIPS 205) per SP 800-208",
            "Inventory signing pipelines, pilot SLH-DSA in CI/CD, and maintain classical signatures "
            "during dual-sign overlap for artifact verification.",
        )

    return (
        asset.vulnerability.pqc_replacement or "Review NIST SP 800-208 / FIPS 203-205 guidance",
        asset.hndl_verdict or "Manual review required for this asset class.",
    )


def build_remediation_backlog(
    assets: list[CryptoAsset],
    *,
    standards: dict[str, Any],
    deadlines: dict[str, Any],
    remediation_weights: dict[str, Any],
) -> list[RemediationItem]:
    items: list[RemediationItem] = []
    effort_defaults = remediation_weights.get("effortDays", {})
    for index, asset in enumerate(assets):
        if asset.vulnerability.status == "safe" and not asset.pqc_ready:
            continue
        if asset.pqc_ready and asset.vulnerability.status == "safe":
            continue
        effort = int(effort_defaults.get(asset.kind, effort_defaults.get("default", 30)))
        action, summary = remediation_action_for_asset(asset)
        items.append(
            RemediationItem(
                id=f"remediation-{asset.id}",
                asset_id=asset.id,
                priority=index + 1,
                title=f"Migrate {asset.label}",
                action=action,
                pqc_algorithm=action.split("(")[0].strip()[:80],
                deadline=deadline_for_asset(asset, deadlines),
                effort_days=effort,
                standards_refs=asset.standards_refs,
                severity=asset.vulnerability.severity,
                summary=summary,
                metadata={"host": asset.host, "port": asset.port, "kind": asset.kind},
            )
        )
    return items
