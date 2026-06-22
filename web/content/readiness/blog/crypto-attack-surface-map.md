---
title: "Where cryptography hides: an attack surface map for PQC migration"
description: "TLS is the tip of the iceberg — JWKS, SSH, email, firmware, and tokens all carry quantum-vulnerable algorithms."
keyword: "cryptographic attack surface"
journeyStage: assess
hubLink: "/q-day/cbom"
hubLabel: "CBOM guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Education"
intro: "Teams that inventory only public HTTPS miss most of the long-tail crypto their auditors care about. This map shows where quantum-vulnerable algorithms hide."
sourceIds: [nist-ir-8547, nist-pqc-overview, palo-alto-q-day, nccoe-migration-pqc, video-veritasium-quantum-power]
videoId: "-UrdExQW0cs"
videoTitle: "What Makes Quantum Computers SO Powerful?"
---

## Attack surface layers

```text
Internet-facing          Internal / partner           Embedded & supply chain
─────────────────        ─────────────────────        ─────────────────────────
HTTPS / API TLS          mTLS between services        Firmware signing (RSA)
CDN cert chains          LDAPS / database TLS         Secure boot keys
Email STARTTLS           VPN (IPsec, WireGuard)       IoT device certs
JWKS / OIDC keys         SSH host keys                Container image signatures
```

[NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) expects organizations to discover crypto across the full estate. The [NCCoE migration project](https://www.nccoe.nist.gov/applied-cryptography/migration-to-pqc) publishes discovery guidance.

## Common blind spots

- **OAuth/OIDC JWKS** endpoints serving ECDSA keys for token signing
- **SMTP STARTTLS** on notification and claims systems
- **Backup encryption** using RSA-wrapped symmetric keys
- **Third-party SaaS** where you control policy but not implementation

[NIST's PQC overview](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) and [Palo Alto's Q-Day guide](https://www.paloaltonetworks.com/cyberpedia/what-is-q-day) emphasize breadth over depth on a single domain.

## Inventory approach

1. External TLS baseline (fast, high signal).
2. Expand to JWKS, SSH, and email from asset lists.
3. Merge into CycloneDX CBOM with provenance tags.
4. Re-scan on change cadence — see [crypto drift blog](/blog/crypto-drift-one-scan-not-enough).

## This quarter

1. Map your estate against the layers above; mark coverage gaps.
2. Run external scan + manual JWKS/SSH checklist.
3. Export CBOM and assign owners per finding category.
