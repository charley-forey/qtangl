---
title: "PQC migration phases: discover, prioritize, hybrid, verify"
description: "A phased migration model aligned to NIST IR 8547, CNSA 2.0, and NSM-10 — with evidence at each gate."
keyword: "PQC migration phases"
journeyStage: assess
hubLink: "/q-day/deadlines"
hubLabel: "PQC deadlines guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Education"
intro: "Post-quantum migration is a program, not a project. These four phases align to federal guidance and mid-market execution reality."
sourceIds: [nist-ir-8547, nsm-10, nsa-cnsa-2, video-dustin-moody-nist, cisa-quantum-readiness-factsheet]
videoId: "-_QiWSTud7I"
videoTitle: "How to Build Your 12-Month Post-Quantum Strategy With NIST's Dustin Moody"
---

## Phase 1 — Discover

- Automated cryptographic inventory across TLS, certs, keys, libraries
- CycloneDX CBOM export with algorithm tags
- Mosca HNDL scoring by data class

References: [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final), [CISA factsheet](https://www.cisa.gov/resources-tools/resources/quantum-readiness-migration-post-quantum-cryptography)

## Phase 2 — Prioritize

- Map findings to [NSM-10](https://www.whitehouse.gov/briefing-room/statements-releases/2022/05/04/national-security-memorandum-on-promoting-united-states-leadership-in-quantum-computing-while-mitigating-risks-to-vulnerable-cryptographic-systems/) and [CNSA 2.0](https://www.nsa.gov/Press-Room/News-Highlights/Article/Article/3588999/) tiers
- Sort by data shelf-life × exposure vector
- Assign owners and deadline tier per asset

Dustin Moody's embedded interview stresses that large organizations need multi-year runway — start Phase 1 now.

## Phase 3 — Hybrid deploy

- ML-KEM hybrid TLS on highest-priority endpoints
- Pilot signature migration on non-critical chains first
- Coordinate vendor upgrades (LB, CDN, HSM, SaaS)

See [hybrid TLS migration guide](/blog/hybrid-tls-migration-guide).

## Phase 4 — Verify

- Re-scan after remediation; diff drift
- Signed reports + public verify links
- Attach evidence to GRC workflows — inventory aid, not formal attestation

## This quarter

Complete Phase 1 with external baseline + CBOM export. Schedule Phase 2 prioritization workshop with legal retention inputs.
