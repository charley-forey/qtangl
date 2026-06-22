---
title: "HNDL collection vectors: breach, backups, and TLS capture"
description: "Deep dive on how ciphertext is harvested today — and what to prioritize in threat models and inventory."
keyword: "harvest now decrypt later vectors"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Technical"
intro: "Harvest-now-decrypt-later does not require nation-state quantum computers — it requires storage and patience. These collection vectors appear in every mid-market threat model."
sourceIds: [video-jeremy-allison-hndl, unit42-exfil-timeline, palo-alto-q-day, postquantum-hndl-article, cisa-pqc-initiative]
videoId: "u4mVljNQnBw"
videoTitle: "Why Your Encrypted Data Is Already Being Stolen"
---

## Collection vectors

| Vector | What is captured | Why it matters post-Q-Day |
|--------|------------------|---------------------------|
| **Network interception** | TLS handshakes + ciphertext | ECDH/RSA key exchange recoverable |
| **Breach exfiltration** | Database backups, archives | Bulk encrypted blobs stored offline |
| **Cloud object storage** | S3/GCS buckets with encrypted objects | Long retention, shared keys |
| **Email archives** | S/MIME, PGP, TLS-wrapped SMTP | Legal hold = decades of shelf life |
| **Legal/compliance hold** | eDiscovery exports | High-value, immobile datasets |

[Palo Alto on Q-Day](https://www.paloaltonetworks.com/cyberpedia/what-is-q-day) and [Unit 42 IR data](https://www.paloaltonetworks.com/resources/research/unit-42-incident-response-report) show exfiltration often completes faster than incident response — copying ciphertext is cheap.

[PostQuantum.com](https://postquantum.com/quantum-security-reference/what-is-harvest-now-decrypt-later/) frames HNDL as present-day risk. [CISA](https://www.cisa.gov/topics/risk-management/quantum) recommends migration planning now.

Jeremy Allison's embedded talk covers practitioner migration complexity — FIPS validation, embedded systems, and library coordination.

## Prioritization framework

1. Tag data classes by confidentiality lifetime (X in Mosca's inequality).
2. Map which vectors can reach each class.
3. Migrate highest X × exposure vectors first — often finance, health, and IP archives.

Related: [how encrypted data is harvested](/blog/how-encrypted-data-is-harvested).

## This quarter

1. Add HNDL collection vectors to your enterprise threat model.
2. Extend scanning beyond web TLS to email, backups, and JWKS.
3. Quantify Mosca exposure for top three data classes.
