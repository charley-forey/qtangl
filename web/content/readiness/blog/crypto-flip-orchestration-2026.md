---
title: "Crypto flip orchestration: prove the change in your CLM and KMS"
description: "Qtangl now orchestrates overlay, CLM, and KMS flips with dry-run, approval, and signed before/after evidence — without operating a PQ overlay appliance."
date: "2026-06-09"
tags: ["convert", "crypto-flip", "pqc"]
---

# Crypto flip orchestration

Post-quantum migration is not just discovery — teams need to **execute** changes in their own CLM, KMS, and infrastructure, then **prove** posture improved.

Qtangl Crypto Flip orchestrates:

- **Overlay** — hybrid TLS via Git/GitLab/ADO PRs, K8s patches, Terraform fragments
- **CLM** — Venafi, DigiCert, AppViewX certificate requests with polling
- **KMS** — AWS/Azure/GCP alias and key version migration (metadata only; no key export)

Every flip includes dry-run, prod approval gates, before/after drift snapshots, and `crypto.flip.completed` webhooks.

We orchestrate the flip in **your** systems. We prove it with evidence your auditor can verify.

[Compare vendors](/compare) · [Crypto flip guide](/docs/guides/crypto-flip)
