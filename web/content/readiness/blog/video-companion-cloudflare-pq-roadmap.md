---
title: "Cloudflare's 2029 PQ roadmap: what enterprises should copy"
description: "Cloudflare accelerated post-quantum targets to 2029 — encryption, authentication, and hybrid TLS lessons for your program."
keyword: "Cloudflare post-quantum roadmap"
journeyStage: assess
hubLink: "/q-day/deadlines"
hubLabel: "PQC deadlines guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "Cloudflare enabled post-quantum encryption for most customer traffic in 2022, then accelerated authentication migration to 2029. Their roadmap is a useful benchmark for enterprise programs."
sourceIds: [cloudflare-pq-roadmap, fips-203, nist-ir-8547, big-tech-q-day-ars]
videoId: "pbPoUE7MmQw"
videoTitle: "NIST PQC Standards Update: On-Ramp Signatures and Global Roadmaps | RWPQC 2026"
---

## What Cloudflare's roadmap teaches

[Cloudflare's post-quantum roadmap](https://blog.cloudflare.com/post-quantum-roadmap/) separates two migration tracks:

1. **Post-quantum encryption (KEM)** — mitigates HNDL on key exchange. Cloudflare deployed hybrid ML-KEM in TLS 1.3 for most proxied traffic.
2. **Post-quantum authentication (signatures)** — harder because certificate chains, CT logs, and client trust stores must move together.

Their 2029 target aligns with [industry timeline shifts](https://arstechnica.com/security/2026/04/while-some-big-tech-players-accelerate-pqc-readiness-others-stay-the-course/) and [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) federal guidance. [ML-KEM (FIPS 203)](https://csrc.nist.gov/publications/detail/fips/203/final) is the KEM standard Cloudflare and others deploy in hybrid mode.

The embedded RWPQC session covers global roadmaps including EU coordinated implementation — useful context for multinationals.

## What it does not cover

Cloudflare controls its edge stack; most enterprises depend on mixed vendors, legacy appliances, and third-party SaaS. Your inventory must include dependencies you do not operate directly.

## This quarter

1. Read [Cloudflare's PQC product documentation](https://developers.cloudflare.com/ssl/post-quantum-cryptography/).
2. Compare your TLS termination points against Cloudflare's milestone sequence (KEM first, signatures second).
3. Request PQ readiness statements from critical SaaS vendors.
