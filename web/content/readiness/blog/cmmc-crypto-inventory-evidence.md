---
title: "CMMC crypto controls: inventory evidence auditors want"
description: "What CMMC Level 2 assessors expect for cryptographic inventory — artifacts, not slide decks."
keyword: "CMMC PQC requirements"
journeyStage: assess
hubLink: "/q-day/frameworks/cmmc"
hubLabel: "CMMC crypto inventory guide"
ctaPrimary: "/assess?scenario=gov-contractor-cmmc"
datePublished: "2026-06-06"
eyebrow: "Framework"
intro: "Defense contractors face CMMC Level 2 enforcement between 2026 and 2030. Primes and assessors increasingly ask for cryptographic inventory evidence — not verbal assurance."
sourceIds: [nsm-10, nist-ir-8547, palo-alto-q-day]
---

## What CMMC expects

CMMC 2.0 Level 2 aligns with NIST SP 800-171 controls around cryptographic module validation, key management, and protection of CUI. Assessors want evidence that you:

- Know which algorithms protect CUI in transit and at rest
- Have a migration plan for quantum-vulnerable cryptography
- Can demonstrate progress between assessment cycles

## Evidence that works

| Artifact | Purpose |
|----------|---------|
| Live TLS inventory | External attack surface with algorithm tags |
| CycloneDX CBOM | Machine-readable asset list for GRC |
| Signed scan report + `/verify` | Independent signature check |
| Drift diff between scans | Proves monitoring, not one-time panic |

## What does not work

- Annual spreadsheet exercises that go stale within weeks
- Vendor attestation letters without algorithm-level detail
- Claiming "we use TLS 1.3" without inventory of certificate algorithms

## Qtangl for DIB contractors

Qtangl maps findings to CMMC-relevant controls, exports signed compliance packs, and Monitor tier tracks drift between cycles. This is an inventory aid — not a formal CMMC attestation.

See the full CMMC pillar guide at `/q-day/frameworks/cmmc` and the government solutions playbook at `/solutions/government`.
