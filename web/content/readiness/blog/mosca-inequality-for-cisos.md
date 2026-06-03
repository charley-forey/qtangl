---
title: "Mosca inequality explained for CISOs"
description: "Turn Mosca's X + Y > Z into a board-ready planning question for harvest-now-decrypt-later exposure."
keyword: "Mosca inequality"
journeyStage: assess
hubLink: "/q-day/mosca-inequality"
hubLabel: "Mosca inequality guide"
ctaPrimary: "/q-day/mosca-inequality"
datePublished: "2026-06-05"
eyebrow: "Education"
intro: "Boards do not need quantum physics — they need a inequality that turns abstract risk into a migration deadline."
sourceIds: [nist-pqc-overview, palo-alto-q-day]
---

## The formula

**X + Y > Z**

- **X** = data shelf-life in years (how long secrets must stay confidential)
- **Y** = migration runway in years (how long your PQC program will take)
- **Z** = years until cryptographically relevant quantum computers

When the sum of X and Y exceeds Z, encrypted data captured today may be readable before you finish migrating. That is harvest-now-decrypt-later exposure — and it can exist while today's crypto still works.

## Examples by industry

| Industry | Typical X | Typical Y | Risk if Z is ~10–15 years |
|----------|-----------|-----------|---------------------------|
| Healthcare payers | 30–50 years | 5–10 years | High — records outlive migration |
| Regional banks | 15–25 years | 5–8 years | Medium–high |
| SaaS with short-lived tokens | 1–3 years | 3–5 years | Lower for transit; watch archives |

## Use the calculator

The Q-Day hub includes an interactive Mosca calculator at `/q-day/mosca-inequality`. Plug in your data retention policy and estimated migration timeline — then compare to your inventory findings.

## What to tell the board

"We are not claiming encryption is broken today. We are claiming our migration runway plus data shelf-life may exceed the quantum timeline — so inventory and phased migration with evidence starts now."
