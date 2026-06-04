---
title: "HNDL for banking: transaction archives and Mosca"
description: "Financial data shelf-life, PCI-DSS 4.0 crypto agility, and harvest-now-decrypt-later exposure for regional banks."
keyword: "financial data quantum risk"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess?scenario=bank-tls-inventory"
datePublished: "2026-06-04"
eyebrow: "Banking"
intro: "Transaction records, wire audit logs, and M&A diligence materials often require confidentiality for 7–25 years — making Mosca inequality a present-day planning question."
sourceIds: [nist-pqc-overview, nist-ir-8547, mosca-inequality]
---

## Key terms

Mosca inequality, HNDL, crypto agility — see the [HNDL hub](/q-day/hndl).

## Why banks face HNDL pressure

| Data class | Typical shelf-life (X) | Collection risk |
|------------|------------------------|-----------------|
| Wire transfer archives | 7–15 years | Backup exfiltration |
| M&A diligence | 10–25 years | Data room copies |
| Core banking backups | 15+ years | Ransomware targets |
| API transaction logs | 3–7 years | Cloud misconfiguration |

When X + Y > Z (migration 5–8 years, quantum timeline ~10 years), HNDL exposure exists **today**.

## PCI-DSS 4.0 connection

PCI-DSS 4.0 emphasizes **crypto agility** — knowing what algorithms protect cardholder data and planning migration before QSAs ask. Inventory TLS, JWKS, and email STARTTLS; map to IR 8547 tiers.

See [PCI-DSS 4.0 guide](/q-day/frameworks/pci-dss-4) and [banking HNDL framework](/q-day/frameworks/banking-hndl).

## 90-day plan for regional banks

1. Baseline scan on external TLS + JWKS ([bank scenario](/assess?scenario=bank-tls-inventory))
2. Mosca score on longest-retained transaction archives
3. Export CBOM for QSA review
4. Pilot hybrid TLS on member-facing API gateway

[Banking solutions](/solutions/banking) · [Free mini-assessment](/assess/mini)
