---
title: "Qtangl native discovery depth — host sensor + code/binary orchestration"
description: "How Qtangl closes discovery gaps with the Unified Sensor and OSS scanner pipeline while keeping verifiable evidence as the moat."
keyword: "native discovery depth"
journeyStage: assess
hubLink: "/compare"
hubLabel: "Vendor comparison hub"
ctaPrimary: "/assess"
datePublished: "2026-06-09"
eyebrow: "Discovery depth"
intro: "Qtangl now ships partial native host, code, and binary discovery into the same CBOM merge and signed evidence pipeline — with honest partial scoring until enterprise ship gates clear."
sourceIds: [nist-pqc-overview, nist-ir-8547]
---

Qtangl now ships **partial** native discovery depth per [ADR-009](https://www.qtangl.com/compare/qtangl):

- **Host / endpoint** — Qtangl Unified Sensor (cert stores, crypto libraries, TLS listeners) with fleet enrollment
- **Source code / binary** — CryptoScan, CryptoDeps, and CBOMkit-theia orchestration into the same CBOM merge and signed evidence pipeline

## Why partial, not "yes" yet

Enterprise ship gates G3/G5 require 500+ agent pilots, mTLS agent identity, bundled OSS engines in CI, and production registry connectors. We label capabilities **partial** on the [vendor comparison matrix](https://www.qtangl.com/compare) until those gates clear.

## What you can do today

1. Enable `discovery.hostSensor`, `discovery.codeScan`, and `discovery.binaryScan` per tenant (or `QTANGL_DISCOVERY_ENABLE_ALL=true` in dev)
2. Dashboard → **Integrations → Discovery depth** — hosts, code, images tabs with inventory counts
3. Assess wizard → **Discovery scope** — external baseline plus optional fleet/repos/images
4. GitHub Action `qtangl-scan` with `mode: code|binary|external`

## Evidence layer unchanged

Discovery depth expands inventory; the moat remains **signed, publicly verifiable evidence** — the Readiness Passport auditors can check offline.

See deployment guides: host sensor deploy, code scan CI, and the enterprise pilot playbook in product docs.
