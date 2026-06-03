---
title: "Remediation backlog prioritization by deadline tier"
description: "Prioritize PQC fixes by NSM-10, CNSA 2.0, and data shelf-life — not gut feel."
keyword: "PQC remediation prioritization"
journeyStage: convert
hubLink: "/convert"
hubLabel: "Convert tier overview"
ctaPrimary: "/convert"
datePublished: "2026-06-08"
eyebrow: "Convert"
intro: "Migration planning fails when backlog items lack owners, effort estimates, and deadline-tier ordering. Convert ties remediation to framework clocks and re-scan proof."
sourceIds: [nsm-10, nist-ir-8547, gqi-q-day-summary]
---

## Prioritize by three axes

1. **Deadline tier** — NSM-10 (2035), CNSA 2.0 (2030–2033), NIST IR 8547 (2030), CMMC (2026–2030)
2. **Data shelf-life** — HNDL exposure for long-lived records
3. **Blast radius** — external TLS, code signing, VPN concentrators first

## ECC may break before RSA

Recent research suggests ECC-256 — widely used in TLS and VPNs — may fall on an earlier timeline than RSA-2048 for offline attacks. Tag both algorithm families in your inventory; do not assume RSA migration always comes first.

## Convert workflow

1. Import prioritized backlog from Assess or Monitor scan.
2. Assign owners, target dates, and dependency ordering.
3. Apply fixes in your environment.
4. Run verification scan and attach proof to each item.
5. Export board pack with live `workflowStatus`.

## What auditors see

Signed reports remain verifiable at `/verify`. Convert merges Postgres remediation status into auditor JSON exports — evidence the fix stayed fixed.
