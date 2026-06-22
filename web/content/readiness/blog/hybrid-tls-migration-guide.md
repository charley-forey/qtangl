---
title: "Hybrid TLS migration: X25519 + ML-KEM in practice"
description: "How hybrid post-quantum TLS works, why vendors deploy it first, and what evidence to attach after migration."
keyword: "hybrid post-quantum TLS"
journeyStage: convert
hubLink: "/q-day/hybrid-tls"
hubLabel: "Hybrid TLS guide"
ctaPrimary: "/assess"
datePublished: "2026-06-21"
eyebrow: "Technical"
intro: "Hybrid TLS combines classical and post-quantum key exchange so connections remain secure if either layer holds — the near-term deployment pattern for ML-KEM."
sourceIds: [fips-203, cloudflare-pq-roadmap, nist-ir-8547, open-quantum-safe, video-rwpqc-nist-2026]
videoId: "pbPoUE7MmQw"
videoTitle: "NIST PQC Standards Update: On-Ramp Signatures and Global Roadmaps | RWPQC 2026"
---

## Why hybrid first

Full cutover to PQC-only TLS risks interoperability failures with legacy clients. **Hybrid key exchange** (e.g., X25519 + ML-KEM-768) requires an attacker to break both layers.

[Cloudflare's roadmap](https://blog.cloudflare.com/post-quantum-roadmap/) deployed hybrid ML-KEM for most proxied traffic before tackling post-quantum authentication. [FIPS 203](https://csrc.nist.gov/publications/detail/fips/203/final) defines ML-KEM parameters enterprises should standardize on.

## Lab to production path

1. **Prototype** with [Open Quantum Safe](https://openquantumsafe.org/) oqs-provider and Docker demos.
2. **Test** against [test.openquantumsafe.org](https://test.openquantumsafe.org/) for cipher suite interoperability.
3. **Pilot** on non-production endpoints; capture handshake traces for audit evidence.
4. **Roll out** per [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) priority tiers.

The RWPQC session covers NIST guidance on hybrid implementations (SP 800-56C references).

## Evidence auditors expect

- Before/after algorithm tags from re-scans
- Handshake appendix showing ML-KEM negotiation
- CBOM export reflecting updated cipher policy

See also [hybrid TLS handshake appendix blog](/blog/hybrid-tls-handshake-appendix).

## This quarter

1. Enable hybrid KEM on one staging load balancer.
2. Verify client compatibility matrix (browser, API clients, IoT).
3. Document rollback procedure before production promotion.
