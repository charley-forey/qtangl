---
title: "After Jeremy Allison on HNDL: what your security team should do now"
description: "Practitioner insights on harvest-now-decrypt-later — and how to quantify exposure before Q-Day headlines."
keyword: "harvest now decrypt later"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-04"
eyebrow: "Video companion"
intro: "Jeremy Allison's conversation on post-quantum cryptography lands a point most board decks skip: adversaries are collecting encrypted data now because storage is cheap and migration takes years."
sourceIds: [nist-pqc-overview, palo-alto-q-day, video-jeremy-allison-hndl]
videoId: "u4mVljNQnBw"
videoTitle: "Why Your Encrypted Data Is Already Being Stolen"
---

## What practitioners emphasize

Open-source maintainers and platform engineers face a brutal reality: FIPS validation is expensive, embedded systems are everywhere, and post-quantum algorithms require coordinated library, certificate, and load-balancer updates. The video correctly frames HNDL as a **today** problem for data with long confidentiality requirements.

## What boards miss

Boards ask whether quantum computers will break encryption tomorrow. The harder question is whether ciphertext captured today will still be confidential when your migration finishes. Michele Mosca's inequality — **X + Y > Z** — turns that into a planning formula:

- **X** = years data must stay secret
- **Y** = years to migrate
- **Z** = years until quantum breaks your algorithms

When X + Y exceeds Z, you have HNDL exposure now — even while today's crypto still works.

## Where Qtangl aligns

Every Qtangl assessment includes Mosca HNDL scoring mapped to your data retention horizon and migration runway. You get a prioritized backlog, CycloneDX CBOM export, and signed verify links — evidence for audit conversations, not a attestation claim.

## This quarter

1. Inventory quantum-vulnerable algorithms on external TLS — not a spreadsheet snapshot.
2. Tag findings by data shelf-life tier (healthcare, finance, and gov records often exceed 20 years).
3. Pilot hybrid TLS on a non-production path and attach re-scan proof after remediation.
