---
title: "HNDL for government contractors: CMMC and long-retention data"
description: "Harvest-now-decrypt-later exposure for defense contractors — NSM-10, CMMC Level 2, and classified-adjacent archives."
keyword: "CMMC harvest now decrypt later"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess?scenario=gov-contractor-cmmc"
datePublished: "2026-06-04"
eyebrow: "Government"
intro: "Contract deliverables, personnel records, and research archives may require confidentiality for 15–50 years — NSM-10 and CMMC assessors expect crypto inventory evidence."
sourceIds: [nsm-10, nsa-cnsa-2, nist-ir-8547, nist-pqc-overview]
---

## Key terms

NSM-10, CMMC, CNSA 2.0, Mosca inequality — see [HNDL hub](/q-day/hndl) and [gov HNDL framework](/q-day/frameworks/gov-hndl).

## Federal mandate context

NSM-10 directs migration away from quantum-vulnerable cryptography by **2035**. CNSA 2.0 sets earlier tiers for national-security systems (2030–2033). CMMC Level 2 assessors expect **inventory artifacts**, not verbal assurance.

## HNDL for contractor data

| Data class | Typical X | Harvest path |
|------------|-----------|--------------|
| Contract deliverables | 15–30 years | Insider, subcontractor |
| Personnel / clearance | 20–50 years | Backup exfiltration |
| Research archives | 15–40 years | Bulk collection |
| VPN / remote access | 5–10 years | TLS handshake capture |

## Evidence CMMC assessors want

| Artifact | Purpose |
|----------|---------|
| Signed TLS inventory PDF | Risk analysis documentation |
| CycloneDX CBOM | GRC and prime contractor reporting |
| Mosca HNDL score | Board and ISSO reporting |
| Monitor drift reports | Continuous safeguard evidence |

## 90-day plan

1. [Gov contractor scenario scan](/assess?scenario=gov-contractor-cmmc)
2. Map findings to NSM-10 and CNSA 2.0 tiers
3. Quantify HNDL on longest-retained deliverable classes
4. Schedule quarterly re-scans

[Government solutions](/solutions/government) · [CMMC crypto inventory blog](/blog/cmmc-crypto-inventory-evidence)
