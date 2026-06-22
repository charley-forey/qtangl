---
title: "After RWPQC 2026: FIPS status, Falcon, HQC, and the 2035 timeline"
description: "NIST's RWPQC 2026 session covers FIPS 203–205, on-ramp signatures, and global migration roadmaps — key takeaways for practitioners."
keyword: "FIPS 203 ML-KEM migration"
journeyStage: assess
hubLink: "/q-day/frameworks/ml-kem"
hubLabel: "ML-KEM migration guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "RWPQC 2026 Session 5 features Dustin Moody and international partners on PQC standardization progress — including non-lattice backup algorithms and signature on-ramp rounds."
sourceIds: [video-rwpqc-nist-2026, fips-203, fips-204, fips-205, nist-ir-8547]
videoId: "pbPoUE7MmQw"
videoTitle: "NIST PQC Standards Update: On-Ramp Signatures and Global Roadmaps | RWPQC 2026"
---

## What the video gets right

The session confirms the foundation for most deployments:

- **[FIPS 203 (ML-KEM)](https://csrc.nist.gov/publications/detail/fips/203/final)** — key encapsulation (formerly Kyber)
- **[FIPS 204 (ML-DSA)](https://csrc.nist.gov/publications/detail/fips/204/final)** — lattice signatures (formerly Dilithium)
- **[FIPS 205 (SLH-DSA)](https://csrc.nist.gov/publications/detail/fips/205/final)** — hash-based signatures (SPHINCS+)

Upcoming work includes **HQC** (non-lattice KEM backup), **Falcon (FN-DSA)**, and the **on-ramp signature** competition for algorithm diversity. [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) distinguishes deprecation (2030) from disallowance (2035).

## What it does not cover

Standards are necessary but not sufficient — you still need inventory, prioritization, and proof of remediation. Hybrid TLS (classical + PQC) is the near-term deployment pattern while authentication migration catches up.

## This quarter

1. Read the FIPS 203–205 executive summaries on [NIST CSRC](https://csrc.nist.gov/projects/post-quantum-cryptography).
2. Map current TLS cipher suites and certificate algorithms against ML-KEM hybrid targets.
3. Track on-ramp signature candidates if your PKI depends heavily on short-lived ECDSA chains.
