---
title: "HNDL for security engineers: handshakes, archives, and evidence"
description: "Technical HNDL primer — what to store in threat models, which TLS records matter, and migration evidence auditors expect."
keyword: "TLS harvest now decrypt later"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-04"
eyebrow: "Technical"
intro: "Engineers need specifics: which protocol artifacts are harvested, what hybrid TLS changes, and what evidence to attach after remediation."
sourceIds: [nist-pqc-overview, fips-203, nist-ir-8547, video-jeremy-allison-hndl]
videoId: "u4mVljNQnBw"
videoTitle: "Why Your Encrypted Data Is Already Being Stolen"
---

## Key terms

ECDH, forward secrecy, key encapsulation, ML-KEM, STARTTLS — see tooltips on the [HNDL hub](/q-day/hndl).

## Threat model for engineers

| Asset | Harvested artifact | Post-Q-Day attack |
|-------|-------------------|-------------------|
| TLS 1.2/1.3 (ECDHE) | Full handshake + ciphertext | Solve ECDLP → derive session keys |
| RSA-wrapped backups | Encrypted blob + envelope | Factor RSA / break ECIES |
| Email (S/MIME, PGP) | Archived messages | Break public-key layer |
| Code signing | Certificate + signed artifacts | Forge signatures |

## Inventory scope beyond web TLS

Your external scan should include:

- JWKS endpoints (OAuth/OIDC signing keys)
- SSH host keys and certificate-based auth
- SMTP STARTTLS for notification and claims systems
- Uploaded PEM bundles and K8s TLS secrets

## Hybrid TLS migration path

1. Pilot **X25519MLKEM768** or equivalent hybrid KEX on non-production
2. Capture handshake proof appendix for auditor review
3. Re-scan to verify PQC-ready classification
4. Expand to production edge after rollback testing

See [ML-KEM framework guide](/q-day/frameworks/ml-kem) and [hybrid TLS blog](/blog/hybrid-tls-handshake-appendix).

## Evidence chain

Auditors want machine-readable inventory (CycloneDX CBOM), signed PDF with `/verify` link, and drift diffs between scans — not slide decks.

[Run inventory](/assess/mini) · [Read CBOM field guide](/blog/reading-qtangl-cbom-export)
