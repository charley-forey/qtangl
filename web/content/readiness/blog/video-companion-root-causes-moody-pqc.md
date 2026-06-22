---
title: "After Root Causes + Dustin Moody: on-ramp signatures and backup algorithms"
description: "Dustin Moody on NIST PQC contests, Falcon, HQC, and why standardization continues after FIPS 203–205."
keyword: "NIST PQC on-ramp signatures"
journeyStage: assess
hubLink: "/q-day/frameworks/ml-kem"
hubLabel: "ML-KEM migration guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "Root Causes episode 613 features Dustin Moody on the state of NIST PQC contests — including backup KEMs, on-ramp digital signatures, and evaluation criteria beyond security proofs."
sourceIds: [video-root-causes-moody-pqc, video-dustin-moody-nist, nist-pqc-overview, fips-204, fips-205]
videoId: "-_QiWSTud7I"
videoTitle: "How to Build Your 12-Month Post-Quantum Strategy With NIST's Dustin Moody"
---

## What the episode covers

Moody explains why NIST continues evaluating algorithms after releasing [FIPS 204 (ML-DSA)](https://csrc.nist.gov/publications/detail/fips/204/final) and [FIPS 205 (SLH-DSA)](https://csrc.nist.gov/publications/detail/fips/205/final):

- **Algorithm diversity** — ML-DSA and Falcon both rely on structured lattices; backup families reduce correlated risk.
- **HQC** — non-lattice KEM backup advancing toward standardization.
- **On-ramp signatures** — candidates with different mathematical foundations (multivariate, hash-based, MPC-in-the-head).

Listen to the full [Root Causes 613 episode](https://www.sectigo.com/root-causes/root-causes-613-status-of-the-nist-pqc-contests) for selection criteria: security, performance, and implementation characteristics.

The embedded interview with Moody (PQShield) covers complementary migration strategy guidance. See [NIST's PQC project page](https://csrc.nist.gov/projects/post-quantum-cryptography) for official updates.

## What it does not cover

Contest updates inform strategy; they do not replace inventory. You cannot prioritize Falcon vs ML-DSA deployment until you know which systems consume which certificate chains.

## This quarter

1. Read Root Causes 613 and note on-ramp candidates relevant to your PKI constraints (signature size, verification speed).
2. Inventory signature algorithms separately from key exchange — authentication migration is harder.
3. Plan crypto-agility so algorithm swaps do not require forklift infrastructure changes.
