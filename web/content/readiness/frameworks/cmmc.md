---
title: "CMMC Level 2 cryptographic inventory guide"
description: "CMMC 2.0 crypto inventory evidence for defense contractors — 2026–2030 enforcement window."
keyword: "CMMC level 2 cryptography"
journeyStage: assess
hubLink: "/solutions/government"
hubLabel: "Government solutions"
ctaPrimary: "/assess?scenario=gov-contractor-cmmc"
datePublished: "2026-06-03"
eyebrow: "Defense"
intro: "CMMC 2.0 Level 2 requires evidence of cryptographic inventory and migration planning. Enforcement ramps 2026–2030 — inventory now, not after the assessor arrives."
sourceIds: [nsm-10, nist-ir-8547, palo-alto-q-day]
---

## Executive summary

The Cybersecurity Maturity Model Certification (CMMC) program requires defense contractors to demonstrate implementation of NIST SP 800-171 controls — including cryptographic protection of Controlled Unclassified Information (CUI). Level 2 assessments increasingly probe **what algorithms you use**, not just whether TLS is enabled.

## CMMC and post-quantum readiness

While CMMC does not yet mandate ML-KEM deployment today, assessors and primes expect:

- Inventory of quantum-vulnerable algorithms protecting CUI
- Migration planning aligned to NSM-10 and NIST IR 8547
- Evidence of monitoring between assessment cycles

## Auditor evidence checklist

1. **Live TLS scan** of external CUI boundary systems
2. **CBOM export** importable into GRC or prime portal
3. **Signed report** with independent verify link
4. **Remediation backlog** with owners and target dates
5. **Re-scan proof** after critical fixes (Convert tier)

## SP 800-208 alignment

Code signing and firmware update mechanisms may require stateful hash-based signatures per NIST SP 800-208. Inventory must tag signing keys separately from TLS certificates.

## Why spreadsheets fail for CMMC

Manual inventories miss certificate rotations, new cloud endpoints, and partner API dependencies. CMMC assessors compare your evidence to live configuration — drift between spreadsheet and reality is a finding.

## Qtangl for DIB contractors

Qtangl maps scan findings to CMMC-relevant control language, exports signed compliance packs, and Monitor tier tracks drift between Level 2 assessments. **Inventory aid — not formal CMMC attestation.**

## Related resources

- Blog: [CMMC crypto inventory evidence](/blog/cmmc-crypto-inventory-evidence)
- Framework: [NSM-10 guide](/q-day/frameworks/nsm-10)
- Solutions: [/solutions/government](/solutions/government)
