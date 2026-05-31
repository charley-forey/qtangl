from __future__ import annotations

from typing import Any

# Authoritative reference registry — mirrored in web/lib/pqc-glossary.ts
GLOSSARY: list[dict[str, str]] = [
    {
        "id": "readiness_score",
        "term": "Readiness score",
        "plain": (
            "0–100 composite score reflecting quantum-vulnerable asset share, HNDL exposure, "
            "PQC-ready endpoints, and remediation coverage. Higher is better."
        ),
        "url": "https://csrc.nist.gov/pubs/ir/8547/final",
    },
    {
        "id": "readiness_band",
        "term": "Readiness band",
        "plain": (
            "Qualitative tier (Critical / At Risk / Developing / Prepared) derived from the "
            "readiness score for executive reporting."
        ),
        "url": "https://csrc.nist.gov/pubs/ir/8547/final",
    },
    {
        "id": "coverage_confidence",
        "term": "Coverage confidence",
        "plain": (
            "Heuristic 0–95% estimate of scan completeness based on classified asset count. "
            "Not a guarantee — shadow keys and offline HSMs may be missed."
        ),
        "url": "",
    },
    {
        "id": "mosca",
        "term": "Mosca inequality (X + Y > Z)",
        "plain": (
            "Dr. Michele Mosca's harvest-now-decrypt-later test: data shelf-life (X) plus "
            "migration time (Y) versus years to cryptographically relevant quantum computing (Z). "
            "When X + Y > Z, intercepted ciphertext may be decrypted before you finish migrating."
        ),
        "url": "https://globalriskinstitute.org/publications/quantum-threat-timeline-report-2023/",
    },
    {
        "id": "hndl",
        "term": "HNDL (Harvest Now, Decrypt Later)",
        "plain": (
            "Adversaries record encrypted traffic today and decrypt it once a cryptographically "
            "relevant quantum computer exists. Long-lived secrets and archived ciphertext are most exposed."
        ),
        "url": "https://csrc.nist.gov/pubs/ir/8547/final",
    },
    {
        "id": "already_too_late",
        "term": "Already too late",
        "plain": (
            "Asset flagged when Mosca inequality holds for its data class — migration may not "
            "protect previously intercepted ciphertext."
        ),
        "url": "",
    },
    {
        "id": "shor_qubits",
        "term": "Shor logical qubits",
        "plain": (
            "Order-of-magnitude estimate of logical qubits required to break this key size via "
            "Shor's algorithm. Estimates only — not a Q-Day prediction."
        ),
        "url": "https://csrc.nist.gov/projects/post-quantum-cryptography",
    },
    {
        "id": "severity",
        "term": "Severity",
        "plain": (
            "Business impact tier (critical / high / medium / low / info) based on algorithm, "
            "exposure, and asset kind."
        ),
        "url": "",
    },
    {
        "id": "status",
        "term": "Quantum status",
        "plain": (
            "Classification: broken (deprecated now), at-risk (Shor-vulnerable), safe "
            "(symmetric / PQC-ready), or unknown."
        ),
        "url": "https://csrc.nist.gov/projects/post-quantum-cryptography",
    },
    {
        "id": "pqc_ready",
        "term": "PQC ready",
        "plain": (
            "Endpoint negotiates hybrid post-quantum key exchange (e.g. X25519MLKEM768) or "
            "uses NIST-approved PQC algorithms."
        ),
        "url": "https://csrc.nist.gov/pubs/fips/203/final",
    },
    {
        "id": "remediation_coverage",
        "term": "Remediation coverage",
        "plain": (
            "Percentage of identified gaps with an assigned remediation action and tracked status."
        ),
        "url": "",
    },
    {
        "id": "crypto_agility",
        "term": "Crypto-agility score",
        "plain": (
            "Distinct from readiness: measures how quickly keys and algorithms can be rotated "
            "without service disruption."
        ),
        "url": "https://csrc.nist.gov/pubs/ir/8547/final",
    },
]

FRAMEWORKS: list[dict[str, str]] = [
    {
        "id": "nist-ir-8547",
        "name": "NIST IR 8547",
        "plain": "Transition to post-quantum cryptography standards",
        "url": "https://csrc.nist.gov/pubs/ir/8547/final",
    },
    {
        "id": "fips-203",
        "name": "FIPS 203 (ML-KEM)",
        "plain": "Module-Lattice-Based Key-Encapsulation Mechanism",
        "url": "https://csrc.nist.gov/pubs/fips/203/final",
    },
    {
        "id": "fips-204",
        "name": "FIPS 204 (ML-DSA)",
        "plain": "Module-Lattice-Based Digital Signature Algorithm",
        "url": "https://csrc.nist.gov/pubs/fips/204/final",
    },
    {
        "id": "fips-205",
        "name": "FIPS 205 (SLH-DSA)",
        "plain": "Stateless Hash-Based Digital Signature Algorithm",
        "url": "https://csrc.nist.gov/pubs/fips/205/final",
    },
    {
        "id": "sp-800-208",
        "name": "NIST SP 800-208",
        "plain": "Stateful hash signatures for firmware/code signing",
        "url": "https://csrc.nist.gov/pubs/sp/800/208/final",
    },
    {
        "id": "cnsa-2.0",
        "name": "CNSA 2.0",
        "plain": "NSA Commercial National Security Algorithm Suite 2.0",
        "url": "https://www.nsa.gov/Cybersecurity/Commercial-Solutions-for-Classified-Program/Quantum-Computing/",
    },
    {
        "id": "nsm-10",
        "name": "NSM-10",
        "plain": "National Security Memorandum on post-quantum cryptography",
        "url": "https://www.whitehouse.gov/briefing-room/statements-releases/2022/05/04/national-security-memorandum-on-promoting-united-states-leadership-in-quantum-computing/",
    },
    {
        "id": "pci-dss-4",
        "name": "PCI-DSS 4.0",
        "plain": "Payment card industry cryptographic agility requirements",
        "url": "https://www.pcisecuritystandards.org/",
    },
    {
        "id": "cmmc",
        "name": "CMMC / FedRAMP",
        "plain": "Federal contractor cryptographic inventory and migration",
        "url": "https://dodcio.defense.gov/CMMC/",
    },
    {
        "id": "hipaa",
        "name": "HIPAA Security Rule",
        "plain": "PHI transmission security and risk analysis",
        "url": "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
    },
    {
        "id": "eu-cra",
        "name": "EU Cyber Resilience Act",
        "plain": "Crypto-agility and vulnerability disclosure for digital products",
        "url": "https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act",
    },
    {
        "id": "iso-27001",
        "name": "ISO/IEC 27001",
        "plain": "Information security management — cryptographic controls",
        "url": "https://www.iso.org/standard/27001",
    },
    {
        "id": "dora",
        "name": "DORA",
        "plain": "Digital Operational Resilience Act (EU financial sector)",
        "url": "https://finance.ec.europa.eu/regulation-and-supervision/financial-services-legislation/implementing-and-delegated-acts/digital-operational-resilience-act_en",
    },
    {
        "id": "soc2",
        "name": "SOC 2",
        "plain": "Trust services criteria — encryption and key management",
        "url": "https://www.aicpa.org/resources/landing/system-and-organization-controls-soc-2",
    },
    {
        "id": "gdpr-art32",
        "name": "GDPR Art. 32",
        "plain": "Security of processing — state-of-the-art encryption",
        "url": "https://gdpr-info.eu/art-32-gdpr/",
    },
    {
        "id": "fedramp",
        "name": "FedRAMP",
        "plain": "Federal cloud security — FIPS-validated cryptography",
        "url": "https://www.fedramp.gov/",
    },
    {
        "id": "cisa-pqc",
        "name": "CISA PQC Roadmap",
        "plain": "CISA guidance for migrating to post-quantum cryptography",
        "url": "https://www.cisa.gov/quantum",
    },
    {
        "id": "bsi",
        "name": "BSI TR-02102",
        "plain": "German Federal Office for Information Security crypto guidance",
        "url": "https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Informationen-und-Empfehlungen/Empfehlungen-nach-Angriffszielen/Quantencomputer/quantencomputer_node.html",
    },
    {
        "id": "anssi",
        "name": "ANSSI",
        "plain": "French national cybersecurity agency PQC recommendations",
        "url": "https://www.ssi.gouv.fr/",
    },
    {
        "id": "etsi",
        "name": "ETSI TS 103 744",
        "plain": "Quantum-safe hybrid key exchange for TLS and IKE",
        "url": "https://www.etsi.org/",
    },
    {
        "id": "mas-trm",
        "name": "MAS TRM",
        "plain": "Monetary Authority of Singapore technology risk management",
        "url": "https://www.mas.gov.sg/regulation/guidelines/technology-risk-management-guidelines",
    },
]

_ALL_BY_ID: dict[str, dict[str, str]] = {
    item["id"]: item for item in GLOSSARY + FRAMEWORKS
}


def glossary_entry(entry_id: str) -> dict[str, str] | None:
    return _ALL_BY_ID.get(entry_id)


def framework_url(framework_id: str) -> str:
    entry = _ALL_BY_ID.get(framework_id, {})
    return entry.get("url", "")


def glossary_for_report() -> list[dict[str, str]]:
    return list(GLOSSARY)


def references_for_report() -> list[dict[str, str]]:
    numbered: list[dict[str, str]] = []
    index = 1
    for item in FRAMEWORKS:
        if item.get("url"):
            numbered.append(
                {
                    "index": str(index),
                    "id": item["id"],
                    "term": item["name"],
                    "plain": item["plain"],
                    "url": item["url"],
                }
            )
            index += 1
    return numbered


def attach_framework_urls(summary: list[dict[str, Any]]) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for entry in summary:
        ref_id = str(entry.get("id", ""))
        url = framework_url(ref_id) or entry.get("url", "")
        enriched.append({**entry, "url": url})
    return enriched
