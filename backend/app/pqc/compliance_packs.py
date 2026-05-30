from __future__ import annotations

from typing import Any

from app.pqc.models import ScanScenario

SCENARIO_PACKS: dict[str, dict[str, Any]] = {
    "bank-tls-inventory": {
        "title": "Regional bank TLS inventory — compliance pack",
        "primaryFrameworks": [
            {
                "id": "nsm-10",
                "name": "NSM-10 / NIST IR 8547",
                "relevance": "Federal PQC migration mandate for agencies and regulated financial partners.",
            },
            {
                "id": "pci-dss-4",
                "name": "PCI-DSS 4.0",
                "relevance": "Cardholder data environments require strong cryptography and key lifecycle controls.",
            },
            {
                "id": "nist-csf",
                "name": "NIST Cybersecurity Framework",
                "relevance": "Identify and protect cryptographic assets supporting customer-facing services.",
            },
        ],
        "controlThemes": [
            {
                "framework": "PCI-DSS 4.0",
                "controlRef": "4.2 / 6.3",
                "theme": "Protect cardholder data in transit with approved algorithms and key sizes.",
            },
            {
                "framework": "NIST IR 8547",
                "controlRef": "Migration planning",
                "theme": "Inventory quantum-vulnerable TLS endpoints and prioritize hybrid/PQC migration.",
            },
            {
                "framework": "NSM-10",
                "controlRef": "Agency alignment",
                "theme": "Track RSA/ECDSA exposure against 2030 deprecation timelines.",
            },
        ],
    },
    "gov-contractor-cmmc": {
        "title": "Gov contractor CMMC readiness — compliance pack",
        "primaryFrameworks": [
            {
                "id": "cmmc-l2",
                "name": "CMMC Level 2",
                "relevance": "CUI protection requires documented cryptographic inventory and remediation plans.",
            },
            {
                "id": "cnsa-2",
                "name": "CNSA 2.0",
                "relevance": "National security systems must adopt approved PQC algorithms on defined timelines.",
            },
            {
                "id": "nist-sp-800-208",
                "name": "NIST SP 800-208",
                "relevance": "Guidance for approved stateful hash-based signature schemes during transition.",
            },
        ],
        "controlThemes": [
            {
                "framework": "CMMC Level 2",
                "controlRef": "SC.L2-3.13.11",
                "theme": "Employ FIPS-validated cryptography and document non-compliant legacy use.",
            },
            {
                "framework": "CMMC Level 2",
                "controlRef": "SC.L2-3.13.16",
                "theme": "Protect CUI at rest and in transit; track TLS/JWKS/SSH key exposure.",
            },
            {
                "framework": "CNSA 2.0",
                "controlRef": "Algorithm transition",
                "theme": "Replace RSA/ECDSA with ML-KEM / ML-DSA or approved hybrids before deadlines.",
            },
        ],
    },
    "healthcare-insurer-hndl": {
        "title": "Healthcare insurer HNDL exposure — compliance pack",
        "primaryFrameworks": [
            {
                "id": "hipaa",
                "name": "HIPAA Security Rule",
                "relevance": "PHI confidentiality depends on transit encryption resistant to future decryption.",
            },
            {
                "id": "nist-ir-8547",
                "name": "NIST IR 8547",
                "relevance": "PQC migration planning for long-retained regulated data.",
            },
            {
                "id": "eu-cra",
                "name": "EU Cyber Resilience Act (CRA)",
                "relevance": "Crypto-agility and vulnerability disclosure for products handling health data.",
            },
        ],
        "controlThemes": [
            {
                "framework": "HIPAA",
                "controlRef": "164.312(e)(1)",
                "theme": "Transmission security — assess HNDL risk for PHI encrypted with RSA/ECDSA today.",
            },
            {
                "framework": "HIPAA",
                "controlRef": "164.308(a)(1)",
                "theme": "Risk analysis must include quantum threat to long-lived ciphertext.",
            },
            {
                "framework": "NIST IR 8547",
                "controlRef": "HNDL assessment",
                "theme": "Apply Mosca inequality to data shelf life vs migration runway vs Q-Day.",
            },
        ],
    },
}


def build_compliance_pack(
    scenario: ScanScenario,
    standards_summary: list[dict[str, Any]],
) -> dict[str, Any]:
    """Build a scenario-specific compliance report pack with framework mapping."""
    pack_def = SCENARIO_PACKS.get(scenario.id, {})
    primary_frameworks = pack_def.get("primaryFrameworks", [])
    control_themes = pack_def.get("controlThemes", [])

    framework_ids = {item["id"] for item in primary_frameworks}
    mapped_from_scan = [
        entry
        for entry in standards_summary
        if entry.get("id") in framework_ids or any(fid in entry.get("id", "") for fid in framework_ids)
    ]
    if not mapped_from_scan:
        mapped_from_scan = standards_summary

    gaps = _gap_findings(standards_summary, control_themes)

    return {
        "packId": scenario.id,
        "title": pack_def.get("title", f"{scenario.title} — compliance pack"),
        "mandate": scenario.target.mandate,
        "organization": scenario.target.organization,
        "persona": scenario.target.persona,
        "primaryFrameworks": primary_frameworks,
        "controlThemes": control_themes,
        "mappedStandardsFromScan": mapped_from_scan,
        "gapFindings": gaps,
    }


def _gap_findings(
    standards_summary: list[dict[str, Any]],
    control_themes: list[dict[str, str]],
) -> list[dict[str, str]]:
    if not standards_summary:
        return [
            {
                "framework": theme["framework"],
                "finding": f"No scan coverage mapped to {theme['theme']}.",
                "status": "unknown",
            }
            for theme in control_themes[:3]
        ]

    findings: list[dict[str, str]] = []
    for entry in standards_summary[:6]:
        name = entry.get("name", entry.get("id", "unknown"))
        count = entry.get("assetCount", 0)
        deadline = entry.get("deadline", "unspecified")
        findings.append(
            {
                "framework": name,
                "asset": f"{count} asset(s)",
                "finding": (
                    entry.get("summary")
                    or f"{count} quantum-vulnerable asset(s) require migration by {deadline}."
                ),
                "status": "gap",
            }
        )
    return findings
