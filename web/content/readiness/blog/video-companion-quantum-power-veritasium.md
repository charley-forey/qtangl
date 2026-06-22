---
title: "After Veritasium: from Shor's threat to NIST PQC standards"
description: "Veritasium connects quantum computing power, harvest-now-decrypt-later, and NIST's PQC competition — with migration steps for security teams."
keyword: "post-quantum cryptography NIST"
journeyStage: assess
hubLink: "/q-day/deadlines"
hubLabel: "PQC deadlines guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "Veritasium's explainer lands the full arc: Shor breaks RSA, adversaries store ciphertext today, and NIST spent eight years standardizing quantum-resistant replacements."
sourceIds: [video-veritasium-quantum-power, nist-pqc-overview, nsm-10, google-2029-ars]
videoId: "-UrdExQW0cs"
videoTitle: "What Makes Quantum Computers SO Powerful?"
---

## What the video gets right

The video connects three ideas that belong in every board briefing:

- **Shor's algorithm** breaks the math behind RSA and ECC — not by brute force, but by exploiting quantum parallelism.
- **Harvest now, decrypt later (HNDL)** means adversaries copy encrypted traffic today and decrypt it after a CRQC exists. Storage is cheap; breaking crypto today is not required.
- **NIST's PQC project** selected algorithms now standardized as [FIPS 203 (ML-KEM)](https://csrc.nist.gov/publications/detail/fips/203/final), [FIPS 204 (ML-DSA)](https://csrc.nist.gov/publications/detail/fips/204/final), and [FIPS 205 (SLH-DSA)](https://csrc.nist.gov/publications/detail/fips/205/final).

Industry timelines accelerated: [Google's 2029 readiness target](https://arstechnica.com/security/2026/03/google-bumps-up-q-day-estimate-to-2029-far-sooner-than-previously-thought/) signals that migration planning cannot wait for headlines.

## What it does not cover

Federal policy adds teeth: [NSM-10](https://www.whitehouse.gov/briefing-room/statements-releases/2022/05/04/national-security-memorandum-on-promoting-united-states-leadership-in-quantum-computing-while-mitigating-risks-to-vulnerable-cryptographic-systems/) requires US agencies to migrate away from quantum-vulnerable algorithms. Private-sector contractors inherit similar expectations through supply-chain clauses.

Qtangl maps findings to NSM-10 and [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) deadline tiers with signed scan artifacts.

## This quarter

1. Map your longest-lived data classes (health, finance, IP) against migration runway using the [Mosca calculator](/q-day/mosca-inequality).
2. Inventory external TLS for RSA and ECDSA — not a one-time spreadsheet.
3. Read [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) deprecation tiers and assign owners per tier.
