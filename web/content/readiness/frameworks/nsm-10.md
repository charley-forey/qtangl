---
title: "NSM-10 PQC migration guide for contractors and federal-adjacent SaaS"
description: "National Security Memorandum 10 requirements, CNSA 2.0 crosswalk, and inventory evidence for 2035 migration."
keyword: "NSM-10 PQC migration"
journeyStage: assess
hubLink: "/q-day/deadlines"
hubLabel: "Compliance deadlines"
ctaPrimary: "/assess?scenario=gov-contractor-cmmc"
datePublished: "2026-06-03"
eyebrow: "Federal mandate"
intro: "NSM-10 directs federal agencies and their contractors to migrate away from quantum-vulnerable cryptography by 2035 — with earlier CNSA 2.0 tiers for national security systems."
sourceIds: [nsm-10, nsa-cnsa-2, nist-ir-8547]
---

## Executive summary

NSM-10 (May 2022) establishes U.S. policy to migrate away from quantum-vulnerable public-key cryptography. Defense contractors, federal-adjacent SaaS vendors, and primes must inventory crypto, plan migration, and evidence progress to auditors and contracting officers — not just assert "we use TLS."

**Deadline:** 2035 for broad migration; CNSA 2.0 sets tiered deadlines of 2030–2033 for national security systems.

## Who must comply

- Federal agencies and national security systems
- Defense Industrial Base (DIB) contractors handling CUI
- SaaS vendors on FedRAMP or CMMC paths serving federal customers
- Subcontractors whose primes flow down crypto requirements

## What auditors expect

| Evidence type | Why it matters |
|---------------|----------------|
| Algorithm-level TLS inventory | Proves you know RSA/ECDSA exposure |
| CycloneDX CBOM | Machine-readable for GRC and prime review |
| Signed scan + `/verify` | Independent signature check |
| Drift monitoring | Shows progress between cycles |

## CNSA 2.0 crosswalk

CNSA 2.0 defines approved algorithm tiers and transition dates for classified and national security systems. Map your inventory findings to CNSA tiers before NSM-10's 2035 horizon — many DIB systems align to earlier CNSA clocks.

## Common failure modes

- One-time spreadsheet inventories that miss JWKS, STARTTLS, and SaaS dependencies
- Vendor attestation without algorithm tags
- Migration roadmaps without re-scan proof after fixes

## Qtangl mapping

- **Assess:** Baseline scan with NSM-10 and CNSA 2.0 crosswalk in signed PDF
- **Monitor:** Drift diffs between audit cycles
- **Convert:** Prioritized backlog with verification scans per remediation item

## Prime and sub flow

Primes increasingly require cryptographic inventory evidence in contract deliverables. Subs should export CBOM JSON and signed reports that primes can aggregate — not PDF screenshots of spreadsheets.

## 90-day starting plan

1. Baseline external TLS inventory with algorithm classification
2. Export CBOM and map to CNSA 2.0 tiers
3. Present readiness score to ISSO or prime security contact
4. Schedule quarterly re-scans before CMMC or authorization reviews
