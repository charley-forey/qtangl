---
title: "After the NIST PQC algorithms video: your ML-KEM migration checklist"
description: "ML-KEM, ML-DSA, and SLH-DSA in plain language — with hybrid TLS as the near-term path."
keyword: "ML-KEM migration"
journeyStage: assess
hubLink: "/q-day/frameworks/ml-kem"
hubLabel: "ML-KEM migration guide"
ctaPrimary: "/assess"
datePublished: "2026-06-04"
eyebrow: "Video companion"
intro: "NIST finalized three post-quantum standards in 2024. The near-term migration path for most teams is hybrid TLS — classical plus ML-KEM — not a big-bang algorithm swap."
sourceIds: [fips-203, fips-204, fips-205, video-pq-algorithms, cloudflare-pq-roadmap]
videoId: "3lCLvfv-XoY"
videoTitle: "Q-Day Is Coming: 5 Quantum-Safe Algorithms Explained"
---

## The three standards that matter first

| Standard | Algorithm | Use case |
|----------|-----------|----------|
| FIPS 203 | ML-KEM | Key encapsulation (TLS key exchange) |
| FIPS 204 | ML-DSA | Digital signatures |
| FIPS 205 | SLH-DSA | Hash-based signatures (backup path) |

Google and Cloudflare already deploy hybrid ML-KEM in production TLS. Your inventory must tag which endpoints still depend on RSA or ECDSA-only handshakes.

## What the video gets right

Lattice-based KEM is the primary defense against harvest-now-decrypt-later for data in transit. Hybrid modes combine classical and post-quantum key exchange so you can migrate incrementally without breaking legacy clients.

## What teams still need

An inventory that answers: which load balancers terminate TLS, which certificates rotate on what cadence, and which third-party APIs you cannot control. Qtangl exports CycloneDX CBOM JSON and hybrid handshake proof traces for migration evidence.

## Migration checklist

1. Baseline scan — tag RSA, ECDSA, and hybrid-capable endpoints.
2. Pilot hybrid TLS on internal or non-production paths first.
3. Re-scan after deployment and attach proof to remediation items.
4. Track readiness score trends in Monitor — crypto drifts between audit cycles.
