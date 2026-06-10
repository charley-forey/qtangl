---
title: "We scan ourselves: Qtangl dogfood and public verify"
description: "How Qtangl runs live PQC self-scans in CI and publishes signed reports anyone can verify."
keyword: "Qtangl dogfood self-scan"
date: "2026-06-10"
hubSlug: "verify-spec"
hubLabel: "Verify spec"
---

We sell cryptographic posture management to security teams. That only works if we hold ourselves to the same standard — signed inventory, drift monitoring, and a **public verify link** auditors can check without a sales call.

## What we built

- **Daily live scans** of `qtangl.com`, `www.qtangl.com`, and `api.qtangl.com` in GitHub Actions (when production dogfood credentials are configured).
- **`GET /pqc/dogfood/latest`** — public endpoint returning the latest self-scan ID, readiness band, scan date, and embedded signature verification.
- **Freshness monitor** — `dogfood-freshness.yml` fails if the latest scan is missing, invalid, or older than eight days.
- **Trust center widget** — [/trust](https://www.qtangl.com/trust) loads live data from the API (no manual Vercel env for scan IDs).

## How to verify

1. Open [/trust](https://www.qtangl.com/trust) and note the latest scan ID.
2. Visit [/verify?scanId=…](https://www.qtangl.com/verify) or call `GET /pqc/verify/{scanId}` on the API.
3. Confirm `verification.valid: true` and transparency log inclusion when enabled.

## Honest status

Until Railway live-scan env and `QTANGL_DOGFOOD_API_KEY` are configured in production CI, the trust widget shows interim copy — we do not claim daily live domain scans until the pipeline is green. Fixture regression (BM-006) continues weekly for signing and transparency smoke tests.

## For federal and enterprise reviewers

Include the live verify URL in diligence packs alongside the [security overview](/downloads/qtangl-security-overview.md) and [federal one-pager template](/roadmap/quantum-readiness/federal-funding/templates/federal-one-pager.md). Qtangl helps customers with CISA ACDI-style inventory — we do not claim certification on your behalf.

**Run your own assessment:** [/assess](https://www.qtangl.com/assess)
