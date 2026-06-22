---
title: "Grover's algorithm and AES: why symmetric crypto mostly survives"
description: "Grover's algorithm weakens AES — but unlike Shor's, the fix is larger keys, not new algorithm families."
keyword: "Grover's algorithm AES"
journeyStage: assess
hubLink: "/q-day/what-is-q-day"
hubLabel: "What is Q-Day? guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Education"
intro: "Boards often ask whether quantum computers break all encryption. Grover's algorithm affects symmetric crypto — but the mitigation path is different from the RSA/ECC crisis."
sourceIds: [video-veritasium-quantum-power, nist-pqc-overview, fips-203, postquantum-shor-article]
videoId: "-UrdExQW0cs"
videoTitle: "What Makes Quantum Computers SO Powerful?"
---

## Grover vs Shor

| Algorithm | Targets | Impact | Mitigation |
|-----------|---------|--------|------------|
| **Shor's** | RSA, DH, ECC | Exponential speedup on factoring/ discrete log | New PQC algorithms (ML-KEM, ML-DSA) |
| **Grover's** | Symmetric keys, hash preimage | Quadratic speedup (effective key halved) | Double key sizes (AES-128 → AES-256) |

[NIST's PQC overview](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) treats public-key migration as the urgent program; symmetric upgrades follow established key-length guidance.

## Practical guidance

- Prefer **AES-256** for data at rest and TLS bulk encryption where policy allows.
- Ensure key derivation and wrapping use quantum-safe **public-key** layers — AES alone does not fix RSA-protected key exchange.
- Do not defer PKI migration because AES still works; [Shor's breaks the envelopes](https://postquantum.com/post-quantum/shors-algorithm-a-quantum-threat/) protecting AES keys in most protocols.

[ML-KEM (FIPS 203)](https://csrc.nist.gov/publications/detail/fips/203/final) addresses key exchange; AES handles bulk encryption after keys are established.

## This quarter

1. Audit systems still on AES-128 for long-retention data.
2. Prioritize RSA/ECC replacement in TLS and key wrapping before symmetric key upgrades.
3. Document algorithm inventory including both public-key and symmetric suites.
