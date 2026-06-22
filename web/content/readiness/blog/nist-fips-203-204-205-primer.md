---
title: "FIPS 203, 204, and 205 in plain language"
description: "ML-KEM, ML-DSA, and SLH-DSA — what NIST standardized and what each replaces in your stack."
keyword: "FIPS 203 204 205 explained"
journeyStage: assess
hubLink: "/q-day/frameworks/ml-kem"
hubLabel: "ML-KEM migration guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Education"
intro: "NIST released three post-quantum standards in August 2024. Here is what each does, where it deploys, and how they fit together."
sourceIds: [fips-203, fips-204, fips-205, nist-pqc-overview, nist-ir-8547, video-pq-algorithms]
videoId: "3lCLvfv-XoY"
videoTitle: "Q-Day Is Coming: 5 Quantum-Safe Algorithms Explained"
---

## The three standards

| Standard | Algorithm | Replaces | Typical use |
|----------|-----------|----------|-------------|
| **[FIPS 203](https://csrc.nist.gov/publications/detail/fips/203/final)** | ML-KEM (Kyber) | RSA/ECDH key exchange | TLS hybrid KEM, VPN, messaging |
| **[FIPS 204](https://csrc.nist.gov/publications/detail/fips/204/final)** | ML-DSA (Dilithium) | RSA/ECDSA signatures | Code signing, document signing, certs |
| **[FIPS 205](https://csrc.nist.gov/publications/detail/fips/205/final)** | SLH-DSA (SPHINCS+) | RSA/ECDSA signatures | Long-term trust anchors, firmware |

[NIST's overview](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) explains the harvest-now-decrypt-later threat driving adoption. [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) sets transition timelines.

## Deployment notes

- **Start with ML-KEM** for confidentiality (HNDL mitigation) via hybrid TLS — classical + PQC key exchange combined.
- **ML-DSA signatures** are larger and slower than ECDSA — plan certificate chain and CDN impacts.
- **SLH-DSA** offers hash-based backup signatures when lattice assumptions are a concern.

Watch the embedded algorithms overview, then dive deeper with [Menezes' Kyber/Dilithium course](/blog/video-companion-kyber-dilithium-menezes).

## This quarter

1. Download FIPS 203–205 PDFs from [NIST CSRC](https://csrc.nist.gov/projects/post-quantum-cryptography).
2. Tag inventory: KEM vs signature vs symmetric findings separately.
3. Pilot hybrid ML-KEM-768 per [ML-KEM framework guide](/q-day/frameworks/ml-kem).
