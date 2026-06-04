---
title: "How encrypted data is harvested (without breaking crypto today)"
description: "Practitioner guide to HNDL collection vectors — breach exfiltration, backups, cloud misconfiguration, and bulk capture."
keyword: "how is encrypted data stolen"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-04"
eyebrow: "Education"
intro: "Harvest-now-decrypt-later does not require breaking RSA today. Adversaries copy ciphertext through paths your security team already tracks — breaches, backups, and archives."
sourceIds: [nist-pqc-overview, palo-alto-q-day, unit42-exfil-timeline, video-jeremy-allison-hndl]
videoId: "u4mVljNQnBw"
videoTitle: "Why Your Encrypted Data Is Already Being Stolen"
---

## Key terms

HNDL, ciphertext, CRQC, forward secrecy, ECDH — see definitions on the [HNDL hub](/q-day/hndl).

## What harvesting means

Harvesting is **copying and storing** encrypted data — not decrypting it in real time. Storage is cheap; migration takes years. Nation-state and criminal actors treat ciphertext as a long-term asset.

## The five collection paths

| Vector | What gets copied | Why it matters for HNDL |
|--------|------------------|-------------------------|
| Breach exfiltration | DB dumps, file shares, backup appliances | Fastest path in enterprise incidents |
| Backups & archives | Tape, S3 snapshots, email archives | Long retention = long Mosca X |
| Cloud misconfiguration | Public snapshots, open prefixes | No crypto break required |
| Bulk transit capture | TLS handshakes + ciphertext | Future ECDH break unlocks sessions |
| Insider / supply chain | M&A rooms, subcontractor copies | Decades-long legal holds |

## TLS nuance for practitioners

Modern TLS 1.3 with forward secrecy means passive wire capture of application data alone is not enough. Adversaries store **handshake records** (ECDH public keys, certificate chains) plus encrypted payloads. A future CRQC breaks the discrete-log problem in the handshake — then derives session keys.

## What to do this quarter

1. Inventory external TLS, JWKS, SSH, and STARTTLS — [free mini-assessment](/assess/mini)
2. Tag assets by data shelf-life tier
3. Quantify Mosca exposure on longest-retained data classes
4. Export CycloneDX CBOM for GRC integration

**Honest scope:** Inventory aid, not formal audit. Quantum-vulnerable ≠ broken today.

## Related guides

- [HNDL hub](/q-day/hndl) — canonical primer with interactive tools
- [Mosca inequality for CISOs](/blog/mosca-inequality-for-cisos)
- [HNDL for security engineers](/blog/hndl-for-security-engineers)
