---
title: "Government contractor HNDL: CMMC, NSM-10, and long-retention data"
description: "Harvest-now-decrypt-later for defense contractors — classified-adjacent archives, NSM-10 deadlines, and CMMC evidence."
keyword: "CMMC harvest now decrypt later"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess?scenario=gov-contractor-cmmc"
datePublished: "2026-06-04"
eyebrow: "Government"
intro: "Contract deliverables and personnel records may require confidentiality for 15–50 years. NSM-10 and CMMC assessors expect cryptographic inventory — not slide decks."
sourceIds: [nsm-10, nsa-cnsa-2, nist-ir-8547, nist-pqc-overview, mosca-inequality]
---

## Executive summary

Government contractors and federal-adjacent SaaS providers hold data with decades-long confidentiality requirements. HNDL exposure is often present **today** while today's crypto still works — because migration timelines (Y) plus data shelf-life (X) exceed quantum timeline estimates (Z).

## Federal deadlines

| Framework | Key date | Requirement |
|-----------|----------|-------------|
| NSM-10 | 2035 | Migrate away from quantum-vulnerable crypto |
| CNSA 2.0 | 2030–2033 | Algorithm tiers for national-security systems |
| CMMC L2 | Ongoing | Cryptographic inventory and safeguard evidence |
| NIST IR 8547 | 2030 target | Transition to FIPS 203/204/205 |

## Data shelf-life for contractors

| Data class | Typical X | Harvest path |
|------------|-----------|--------------|
| Contract deliverables | 15–30 years | Subcontractor archives |
| Personnel / clearance | 20–50 years | Backup exfiltration |
| Research (CUI-adjacent) | 15–40 years | Bulk collection |
| VPN / remote access TLS | 5–10 years | Handshake capture |

## Collection vectors

- **Breach exfiltration** — fastest path in incident response data
- **Backup and archive copies** — long-retention tape and cloud snapshots
- **Insider and supply-chain** — M&A, legal holds, subcontractor data rooms
- **Bulk transit** — TLS sessions on contractor API and VPN endpoints

## CMMC evidence package

| Artifact | Assessor use |
|----------|--------------|
| Signed TLS inventory PDF | Risk analysis documentation |
| CycloneDX CBOM | Prime contractor reporting |
| Mosca HNDL score | ISSO and board reporting |
| Monitor drift diffs | Continuous safeguard evidence |

## Qtangl mapping

- [Gov contractor CMMC scenario](/assess?scenario=gov-contractor-cmmc)
- Framework mapping to NSM-10 and CNSA 2.0 tiers
- Signed verify links for prime audit cycles

**Inventory aid — not CMMC certification.**

## 90-day plan

1. Baseline scan on external TLS, SSH, JWKS
2. Mosca score on longest-retained deliverable classes
3. Export CBOM for prime contractor
4. Schedule quarterly re-scans

[Government solutions](/solutions/government) · [HNDL hub](/q-day/hndl)
