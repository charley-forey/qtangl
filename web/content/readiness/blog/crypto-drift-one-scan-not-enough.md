---
title: "Crypto drift: why one scan is not enough"
description: "A baseline scan satisfies this quarter's board slide — it does not catch the deployment that shipped last Tuesday."
keyword: "crypto drift monitoring"
journeyStage: monitor
hubLink: "/monitor"
hubLabel: "Q-Day Monitor tier"
ctaPrimary: "/monitor"
datePublished: "2026-06-07"
eyebrow: "Monitor"
intro: "Crypto posture is dynamic. One assessment is a baseline — not a system of record."
sourceIds: [nist-pqc-overview, cloudflare-pq-roadmap]
---

## What drift looks like

Between audit cycles, teams ship new microservices, rotate certificates, onboard SaaS vendors, and occasionally roll back hybrid TLS experiments. Each change can introduce or resolve quantum-vulnerable exposure. Without scheduled re-scans, you discover drift at the worst time — during an assessor interview.

## Monitor tier capabilities

Qtangl Monitor diffs each scan against the prior baseline:

- **New findings** — endpoints or algorithms that appeared since last scan
- **Resolved items** — fixes verified with re-scan proof
- **Readiness score trends** — board-trackable metric over time
- **Scheduled alerts** — notify owners when drift exceeds thresholds

## When to re-scan

Align scan cadence to your change velocity: monthly for fast-moving SaaS, quarterly for stable estates, ad-hoc after major certificate or load-balancer changes.

## Honest scope

Monitor tracks external TLS and configured scan scope — not every embedded system in your supply chain. Use Assess for baseline breadth, Monitor for ongoing hygiene.
