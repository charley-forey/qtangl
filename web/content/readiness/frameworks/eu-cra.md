---
title: "EU Cyber Resilience Act and post-quantum cryptography"
description: "EU CRA product security requirements and crypto agility expectations for software vendors serving European markets."
keyword: "EU CRA post-quantum"
journeyStage: assess
hubLink: "/platform"
hubLabel: "Qtangl platform"
ctaPrimary: "/assess"
datePublished: "2026-06-03"
eyebrow: "Enterprise"
intro: "The EU Cyber Resilience Act introduces security requirements for products with digital elements — including expectations around cryptographic agility as quantum threats mature."
sourceIds: [nist-pqc-overview, nist-ir-8547]
---

## Executive summary

The EU CRA establishes mandatory cybersecurity requirements for hardware and software products placed on the EU market. While CRA implementation continues through delegated acts, vendors should expect scrutiny of **cryptographic implementations**, update mechanisms, and vulnerability handling — all relevant to post-quantum migration planning.

## Crypto agility under CRA

CRA-aligned security programs emphasize:

- Documenting cryptographic dependencies in software bills of materials
- Ability to update cryptographic modules without full product replacement
- Vulnerability disclosure and patch cadence

Post-quantum migration is a crypto agility exercise — inventory first, phased deployment second.

## Overlap with NIST PQC standards

EU vendors serving global customers typically align to NIST FIPS 203/204/205 for TLS and code signing migration, supplemented by ENISA guidance. NIST IR 8547 provides transition timelines referenced in cross-border compliance programs.

## What to inventory

- TLS endpoints for EU customer-facing services
- Code signing for software updates (CRA-relevant)
- Embedded cryptographic libraries in product components
- Third-party SDK dependencies with static crypto pins

## Qtangl for product vendors

Export CycloneDX CBOM from scans, track readiness score over Monitor cadence, and attach handshake proof after hybrid TLS deployment. Supports CRA-aligned documentation — not CE marking or conformity assessment.

## Dual-market note

Organizations serving both U.S. federal and EU markets should map findings to NSM-10 / CMMC tiers and CRA documentation requirements in a single inventory program.
