---
title: "PCI-DSS 4.0 cryptographic agility guide"
description: "PCI-DSS 4.0 inventory and crypto agility requirements for payment environments."
keyword: "PCI-DSS 4.0 inventory"
journeyStage: assess
hubLink: "/solutions/banking"
hubLabel: "Banking solutions"
ctaPrimary: "/assess?scenario=bank-tls-inventory"
datePublished: "2026-06-03"
eyebrow: "Payments"
intro: "PCI-DSS 4.0 emphasizes crypto agility — knowing what algorithms protect cardholder data environments and planning migration before QSAs ask."
sourceIds: [nist-ir-8547, fips-203]
---

## Executive summary

PCI-DSS version 4.0 strengthens requirements around cryptographic key management, inventory, and agility. Regional banks and payment processors must document cryptographic implementations protecting cardholder data — and demonstrate ability to migrate algorithms as standards evolve.

## What QSAs probe

- TLS configurations on payment application boundaries
- Key management for encryption of stored cardholder data
- Use of deprecated algorithms (SSL, early TLS, weak ciphers)
- Readiness to adopt industry-standard replacements — including post-quantum algorithms on NIST timeline

## Inventory scope for banks

- External TLS for customer-facing banking APIs
- JWKS endpoints for OAuth and Open Banking integrations
- Email STARTTLS for statements and notifications
- Third-party payment gateway dependencies

## Qtangl mapping

TLS + JWKS + STARTTLS inventory, PCI-relevant control mapping in compliance pack, signed report for QSA review via `/verify`. Monitor tier tracks drift between annual assessments.

## Migration path

1. Baseline inventory with algorithm tags
2. Prioritize external TLS and API signing keys
3. Pilot hybrid ML-KEM on non-production payment APIs
4. Re-scan and attach proof before QSA interview
