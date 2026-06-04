---
title: "HIPAA and harvest-now-decrypt-later for healthcare payers"
description: "Long-lived PHI, HNDL exposure, and PQC inventory evidence for healthcare payers and providers."
keyword: "HIPAA quantum risk"
journeyStage: assess
hubLink: "/solutions/healthcare"
hubLabel: "Healthcare solutions"
ctaPrimary: "/assess?scenario=healthcare-insurer-hndl"
datePublished: "2026-06-03"
eyebrow: "Healthcare"
intro: "Healthcare records often require confidentiality for decades — making harvest-now-decrypt-later a present-day concern under HIPAA security rule obligations."
sourceIds: [nist-pqc-overview, palo-alto-q-day, nist-ir-8547]
---

## Executive summary

HIPAA requires covered entities and business associates to protect electronic protected health information (ePHI) with appropriate administrative, physical, and technical safeguards. While HIPAA does not yet name ML-KEM, the Security Rule's risk analysis obligation includes **identifying threats to ePHI confidentiality** — including future cryptanalytic advances.

## HNDL and PHI shelf-life

Medical records, claims archives, and research datasets may remain confidential for 30–50 years. Mosca's inequality applies: if data shelf-life plus migration time exceeds the quantum timeline, ciphertext harvested today is a liability.

## How PHI ciphertext gets copied

| Vector | Healthcare example | What is stored |
|--------|-------------------|----------------|
| Breach exfiltration | Ransomware on claims DB | Encrypted PHI dumps |
| Long-term archives | 30-year claims retention | Tape, S3, cold storage |
| Cloud misconfiguration | Open backup bucket | Member portal exports |
| Email STARTTLS | Claims notification systems | TLS sessions + handshakes |
| Third-party BAA flows | Payer-processor APIs | Quantum-vulnerable TLS |

Typical Mosca inputs for payers: X = 35 years, Y = 7 years, Z = 10 years → inequality holds.

## What payers and providers should inventory

- External TLS for member portals and API integrations
- VPN concentrators for administrative access
- Email STARTTLS for claims and notification systems
- Third-party SaaS with BAA coverage — algorithm visibility varies

## NIST IR 8547 alignment

NIST transition guidance (2030 target) is referenced by healthcare sector frameworks and large payer security programs. Map inventory findings to IR 8547 categories for board reporting.

## Evidence for OCR and internal audit

| Artifact | Use |
|----------|-----|
| Signed TLS inventory | Risk analysis documentation |
| CBOM export | Vendor and GRC integration |
| Mosca HNDL score | Board and compliance committee reporting |
| Monitor drift reports | Ongoing safeguard evidence |

## Qtangl mapping

Assess tier produces healthcare-scenario fixture or live scan with HNDL scoring. Monitor catches drift when new member-facing services ship. **Inventory aid — not HIPAA attestation.**

## 90-day plan for payers

1. Baseline scan on member-facing TLS footprint
2. Quantify HNDL exposure for longest-retained data classes
3. Export CBOM for GRC integration
4. Schedule quarterly re-scans aligned to release cadence
