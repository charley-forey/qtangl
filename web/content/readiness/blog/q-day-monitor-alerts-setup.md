---
title: "Setting up Q-Day Monitor alerts"
description: "Configure re-scan cadence, drift alerts, and readiness score trends for operational crypto hygiene."
keyword: "Q-Day Monitor alerts"
journeyStage: monitor
hubLink: "/monitor"
hubLabel: "Monitor tier overview"
ctaPrimary: "/access"
datePublished: "2026-06-07"
eyebrow: "How-to"
intro: "Monitor turns a one-time assessment into a system of record — if you configure cadence and alerts to match how your estate actually changes."
sourceIds: [nist-ir-8547]
---

## Step 1: Establish baseline

Complete an Assess-tier baseline scan first. Monitor diffs against this baseline — without a signed baseline, drift alerts lack context.

## Step 2: Set scan cadence

| Estate type | Recommended cadence |
|-------------|---------------------|
| FedRAMP-path SaaS | Monthly |
| Regional bank / insurer | Quarterly |
| Stable gov contractor | Quarterly + ad-hoc after changes |

## Step 3: Configure alert thresholds

Alert when:

- New quantum-vulnerable endpoints appear
- Readiness score drops more than one band
- Critical findings remain open past deadline tier dates

## Step 4: Assign owners

Each finding needs an owner before Convert tier backlog prioritization. Monitor exports merge remediation status into board packs.

## Upsell from Assess

Every Assess delivery should pitch Monitor before the board readout — one scan satisfies this quarter's slide; drift catches next quarter's regression.
