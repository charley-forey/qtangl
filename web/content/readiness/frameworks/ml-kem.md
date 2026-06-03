---
title: "FIPS 203 ML-KEM migration guide"
description: "FIPS 203 ML-KEM hybrid TLS migration with handshake proof and production rollout playbook."
keyword: "ML-KEM ML-DSA migration"
journeyStage: convert
hubLink: "/q-day/hybrid-tls"
hubLabel: "Hybrid TLS proof"
ctaPrimary: "/demo/pqc"
datePublished: "2026-06-03"
eyebrow: "FIPS 203-205"
intro: "FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) are available now — hybrid TLS is the near-term deployment path for most enterprises."
sourceIds: [fips-203, fips-204, fips-205, nist-pqc-overview]
---

## The three standards

| FIPS | Algorithm | Primary use |
|------|-----------|-------------|
| 203 | ML-KEM | Key encapsulation (TLS) |
| 204 | ML-DSA | Digital signatures |
| 205 | SLH-DSA | Hash-based signatures |

## Hybrid TLS first

Most production migrations combine classical ECDHE with ML-KEM (e.g. X25519MLKEM768) for backward compatibility. Google and Cloudflare deploy hybrid KEX at scale — inventory must identify which endpoints are still RSA/ECDSA-only.

## Handshake proof

Qtangl demo captures hybrid handshake traces attachable to signed reports. Auditors verify signatures at `/verify` — migration evidence, not lab-only claims.

## Rollout playbook

1. Inventory endpoints by algorithm and client compatibility requirements
2. Pilot on internal services with controlled client base
3. Expand to external APIs with monitoring for handshake failures
4. Re-scan after each wave; attach proof to Convert backlog items

## SLH-DSA and firmware

FIPS 205 supports code signing and firmware where stateful hash signatures (SP 800-208) apply — tag signing infrastructure separately from TLS in your CBOM.
