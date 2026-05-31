from __future__ import annotations

from typing import Any

from app.pqc.models import CryptoAsset

CONTROL_MAP: dict[str, list[dict[str, str]]] = {
    "nist-ir-8547": [
        {"ref": "Migration planning", "theme": "Inventory quantum-vulnerable cryptography"},
        {"ref": "HNDL assessment", "theme": "Assess harvest-now-decrypt-later exposure"},
    ],
    "pci-dss-4": [
        {"ref": "4.2", "theme": "Protect cardholder data in transit"},
        {"ref": "6.3", "theme": "Cryptographic agility and key lifecycle"},
    ],
    "hipaa": [
        {"ref": "164.312(e)(1)", "theme": "Transmission security"},
        {"ref": "164.308(a)(1)", "theme": "Risk analysis including quantum threat"},
    ],
    "iso-27001": [{"ref": "A.8.24", "theme": "Use of cryptography"}],
    "dora": [{"ref": "Art. 6", "theme": "ICT risk management — crypto resilience"}],
    "soc2": [{"ref": "CC6.1", "theme": "Logical access — encryption controls"}],
    "gdpr-art32": [{"ref": "Art. 32", "theme": "Security of processing — state-of-the-art encryption"}],
    "fedramp": [{"ref": "SC-13", "theme": "Cryptographic protection"}],
    "cisa-pqc": [{"ref": "Roadmap", "theme": "Agency PQC migration timeline"}],
}


def controls_for_asset(asset: CryptoAsset) -> list[dict[str, str]]:
    controls: list[dict[str, str]] = []
    for ref_id in asset.standards_refs:
        for ctrl in CONTROL_MAP.get(ref_id, []):
            entry = {"framework": ref_id, **ctrl, "status": _control_status(asset)}
            if entry not in controls:
                controls.append(entry)
    return controls


def compliance_summary(assets: list[CryptoAsset]) -> dict[str, Any]:
    at_risk: list[dict[str, str]] = []
    satisfied: list[dict[str, str]] = []
    for asset in assets:
        for ctrl in controls_for_asset(asset):
            row = {**ctrl, "assetId": asset.id, "assetLabel": asset.label}
            if ctrl["status"] == "at_risk":
                at_risk.append(row)
            else:
                satisfied.append(row)
    return {
        "controlsAtRisk": at_risk[:20],
        "controlsSatisfied": satisfied[:20],
        "atRiskCount": len(at_risk),
        "satisfiedCount": len(satisfied),
    }


def _control_status(asset: CryptoAsset) -> str:
    if asset.pqc_ready and asset.vulnerability.status == "safe":
        return "satisfied"
    if asset.vulnerability.status in {"broken", "at-risk"}:
        return "at_risk"
    return "review"
