---
title: "NIST IR 8547 transition guide"
description: "NIST guidance for transitioning to post-quantum cryptography standards by 2030."
keyword: "NIST IR 8547 PQC transition"
journeyStage: assess
hubLink: "/q-day/deadlines"
hubLabel: "Compliance deadlines"
ctaPrimary: "/assess"
datePublished: "2026-06-03"
eyebrow: "NIST transition"
intro: "NIST IR 8547 is the de facto North American roadmap for deprecating quantum-vulnerable algorithms — referenced by federal, healthcare, and financial frameworks."
sourceIds: [nist-ir-8547, nist-pqc-overview]
---

## Executive summary

NIST Interagency Report 8547 provides transition guidance for migrating from quantum-vulnerable cryptography to FIPS 203/204/205. Most organizations target **2030** for substantial transition progress — aligned with CNSA 2.0 tiers and industry planning signals including Google and Cloudflare's 2029 internal targets.

## Transition categories

NIST organizes migration into categories by algorithm type and usage context — key establishment, digital signatures, hash functions. Your inventory must tag findings into these categories for prioritization.

## Deprecation timeline awareness

Plan for deprecation of RSA, ECDSA, and finite-field DH in favor of ML-KEM and ML-DSA. ECC may require attention on accelerated timelines per recent research — do not assume RSA always migrates first.

## Evidence for regulated orgs

- Algorithm-level inventory mapped to IR 8547 categories
- CBOM for GRC integration
- Signed reports with verify links
- Monitor drift between assessment cycles

## Qtangl mapping

Scan exports include NIST IR 8547 crosswalk in compliance pack. Readiness score incorporates deadline pressure from IR 8547 tiers.
