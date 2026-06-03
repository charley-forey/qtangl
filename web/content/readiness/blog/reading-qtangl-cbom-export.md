---
title: "Reading a Qtangl CBOM export: field-by-field guide"
description: "Walk through a sample CycloneDX Crypto Bill of Materials — algorithms, assets, and GRC integration."
keyword: "CycloneDX CBOM export"
journeyStage: assess
hubLink: "/q-day/cbom"
hubLabel: "CycloneDX CBOM guide"
ctaPrimary: "/samples/sample-cbom-bank-tls-inventory.json"
datePublished: "2026-06-05"
eyebrow: "Technical"
intro: "A Crypto Bill of Materials (CBOM) lists algorithms, keys, and certificates in machine-readable form — the inventory artifact GRC tools expect."
sourceIds: [fips-203, nist-pqc-overview]
---

## What a CBOM contains

Qtangl scans export CycloneDX CBOM JSON mapping TLS endpoints, algorithms, key sizes, and quantum-vulnerability classifications to your remediation backlog. Each component typically includes:

- **Asset identifier** — hostname, port, service type
- **Algorithm family** — RSA, ECDSA, ML-KEM hybrid, etc.
- **Key size and curve** — e.g. RSA-2048, P-256
- **Vulnerability classification** — quantum-vulnerable, transitional, post-quantum
- **Framework crosswalk** — NSM-10, CNSA 2.0, NIST IR 8547 tier tags

## Download the sample first

Before running your own scan, download the ungated sample at `/samples/sample-cbom-bank-tls-inventory.json`. Compare fields to your ServiceNow, Archer, or custom CMDB schema — integration beats another spreadsheet column.

## From CBOM to backlog

Import CBOM into your GRC toolchain, assign owners to top findings by deadline tier and data shelf-life, and attach re-scan proof after remediation. Signed reports remain verifiable at `/verify` — auditors check signatures independently.

## Next step

Run the live scanner at `/assess` or start with the free mini-assessment at `/assess/mini` for a fixture baseline with top-five findings.
