---
title: "Banking HNDL: transaction archives and Mosca inequality"
description: "Harvest-now-decrypt-later exposure for regional banks — PCI-DSS 4.0, transaction shelf-life, and inventory evidence."
keyword: "banking harvest now decrypt later"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess?scenario=bank-tls-inventory"
datePublished: "2026-06-04"
eyebrow: "Banking"
intro: "Financial records and wire audit logs often require confidentiality for 7–25 years. When migration takes five to eight years, Mosca inequality frequently holds today."
sourceIds: [nist-pqc-overview, nist-ir-8547, mosca-inequality]
---

## Executive summary

Regional banks and payment processors hold transaction archives, M&A diligence, and core banking backups with multi-year to multi-decade confidentiality requirements. HNDL means ciphertext copied today — via breach, backup exfiltration, or cloud misconfiguration — may be decryptable before migration completes.

## Data shelf-life by banking data class

| Data class | Typical X (years) | Primary harvest path |
|------------|-------------------|----------------------|
| Wire transfer archives | 7–15 | Backup exfiltration |
| M&A diligence | 10–25 | Data room copies |
| Core banking backups | 15+ | Ransomware |
| API / cardholder logs | 3–7 | Cloud misconfig |

## PCI-DSS 4.0 and crypto agility

PCI-DSS 4.0 requires knowing what cryptography protects cardholder data and demonstrating agility. Qtangl maps TLS, JWKS, and STARTTLS findings to PCI-DSS 4.0 controls with signed evidence.

## Mosca worked example (regional bank)

- X = 15 years (transaction archive retention)
- Y = 6 years (realistic migration runway)
- Z = 10 years (industry quantum timeline estimate)

X + Y = 21 > Z → **HNDL exposure today**

## Collection vectors for financial services

1. **Ransomware exfiltration** — backup appliances and file shares
2. **Long-term tape/S3 archives** — encrypted with RSA/ECIES envelopes
3. **Third-party processor copies** — BAU data flows with quantum-vulnerable TLS
4. **Bulk transit capture** — TLS handshakes on payment API traffic

## Qtangl mapping

- [Bank TLS inventory scenario](/assess?scenario=bank-tls-inventory)
- Mosca HNDL scoring on financial data classes
- CBOM export for QSA and internal audit
- Monitor drift between assessment cycles

**Inventory aid — not PCI attestation.**

## 90-day plan

1. Baseline external TLS + JWKS scan
2. Tag findings by data shelf-life tier
3. Export CBOM for GRC
4. Pilot hybrid TLS on API gateway

[Banking solutions](/solutions/banking) · [HNDL hub](/q-day/hndl)
