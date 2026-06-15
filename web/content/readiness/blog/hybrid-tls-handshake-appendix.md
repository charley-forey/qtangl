---
title: "Hybrid TLS proof: what the handshake appendix means"
description: "Migration is not complete until you prove post-quantum algorithms work in production TLS — not just in a lab slide."
keyword: "hybrid TLS ML-KEM proof"
journeyStage: convert
hubLink: "/q-day/hybrid-tls"
hubLabel: "Hybrid TLS proof guide"
ctaPrimary: "/assess"
datePublished: "2026-06-08"
eyebrow: "Technical"
intro: "The Qtangl demo includes hybrid ML-KEM handshake traces — showing classical and post-quantum key exchange in a verifiable audit pack."
sourceIds: [fips-203, cloudflare-pq-roadmap]
---

## What the appendix contains

After a hybrid TLS handshake, Qtangl captures:

- Negotiated cipher suite including ML-KEM hybrid KEX
- Certificate chain algorithms
- Trace metadata for auditor review

This attaches to signed reports with verify links — auditors check signatures independently.

## Why proof matters

Assessors increasingly ask "show me hybrid TLS in production" — not "show me a roadmap slide." Handshake proof closes the loop between inventory (what you have) and migration (what you fixed).

## Pilot path

1. Inventory endpoints ready for hybrid rollout.
2. Enable hybrid TLS on non-production path first.
3. Run handshake proof scan and attach to remediation item.
4. Re-scan production after cutover.

See `/q-day/hybrid-tls` for the full explainer and `/docs/reference/pqc/handshake-prove` for API details.
