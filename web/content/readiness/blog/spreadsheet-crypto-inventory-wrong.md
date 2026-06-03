---
title: "Why your spreadsheet crypto inventory is wrong"
description: "Manual TLS inventories miss drift, JWKS, STARTTLS, and re-scan verification — why teams upgrade to continuous inventory."
keyword: "PQC inventory spreadsheet"
journeyStage: assess
hubLink: "/q-day/vs-spreadsheet"
hubLabel: "Why spreadsheets fail"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-05"
eyebrow: "Sales enablement"
intro: "Spreadsheets feel fast — until the microservice that shipped last Tuesday with an outdated OpenSSL pin is missing from your audit pack."
sourceIds: [palo-alto-q-day, nist-pqc-overview]
---

## Spreadsheets are a snapshot

A manual TLS inventory captures what you knew on audit day. Crypto is dynamic: certificate rotations, cipher downgrades, new SaaS dependencies, and partner API changes appear between cycles. Spreadsheets miss:

- **JWKS endpoints** for OIDC and API signing keys
- **Email STARTTLS** configurations on SMTP and IMAP
- **Shadow IT APIs** not in your CMDB
- **Third-party dependencies** whose cipher suites you do not control

## What auditors actually want

Assessors increasingly ask for machine-readable evidence — CycloneDX CBOM exports, signed scan reports with independent verify links, and drift diffs between assessment cycles. A static spreadsheet cannot prove what changed since last quarter.

## What continuous inventory gives you

Qtangl Monitor schedules re-scans, diffs each baseline against the prior scan, and alerts on new quantum-vulnerable findings. That is how you move from annual panic to operational crypto hygiene — an inventory aid, not a formal attestation.

## Replace the spreadsheet this quarter

1. Run a live baseline scan on your external TLS footprint.
2. Export CBOM JSON into your GRC toolchain.
3. Schedule re-scans aligned to your release cadence.
