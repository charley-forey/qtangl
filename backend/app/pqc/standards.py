from __future__ import annotations

from typing import Any

from app.pqc.models import CryptoAsset, RemediationItem


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
        if asset.vulnerability.status == "safe" and asset.kind != "error":
            continue
        effort = int(effort_defaults.get(asset.kind, effort_defaults.get("default", 30)))
        items.append(
            RemediationItem(
                id=f"remediation-{asset.id}",
                asset_id=asset.id,
                priority=index + 1,
                title=f"Migrate {asset.label}",
                action=asset.vulnerability.pqc_replacement,
                pqc_algorithm=asset.vulnerability.pqc_replacement.split("(")[0].strip(),
                deadline=deadline_for_asset(asset, deadlines),
                effort_days=effort,
                standards_refs=asset.standards_refs,
                severity=asset.vulnerability.severity,
                summary=asset.hndl_verdict,
                metadata={"host": asset.host, "port": asset.port, "kind": asset.kind},
            )
        )
    return items
