---
title: "Harvest-now-decrypt-later: what boards miss"
description: "What boards miss about harvest-now-decrypt-later — Mosca inequality, HNDL exposure, and why quantum-vulnerable crypto needs inventory now."
keyword: "harvest now decrypt later boards"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-03"
eyebrow: "Post-quantum readiness"
intro: "Boards ask whether quantum computers will break encryption tomorrow. The harder question is whether ciphertext captured today will still be confidential when migration finishes — and most enterprises cannot answer it yet."
sourceIds: [nist-pqc-overview, palo-alto-q-day, nsm-10, video-jeremy-allison-hndl]
---

## The risk starts before Q-Day

Harvest-now-decrypt-later (HNDL) is not science fiction. Adversaries capture TLS sessions, backups, and archives today knowing that a future cryptographically relevant quantum computer (CRQC) may decrypt them later. Storage is cheap; migration is not.

Quantum-vulnerable does not mean broken today. Your RSA and ECDSA still protect data in transit and at rest right now. The exposure is temporal: if data must stay confidential for decades, ciphertext harvested before you finish migrating may become readable.

## Who is most exposed

Healthcare payers, regional banks, and government contractors hold records with 20–50 year shelf lives. Trade secrets, M&A diligence, and classified-adjacent research archives face the same Mosca clock.

Unit 42 and other incident-response data show exfiltration timelines compressing — the fastest quartile of intrusions reached data theft in 72 minutes in 2025. Harvesting does not require breaking crypto today; it requires copying ciphertext.

## Mosca inequality in plain language

Michele Mosca's inequality — X + Y > Z — turns abstract quantum risk into a planning question. X is how long your data must stay secret. Y is how long migration takes. Z is when quantum computers break your algorithms.

When X + Y exceeds Z, encrypted data captured today may be readable before you finish migrating. That is HNDL exposure — and it is why inventory and migration runway matter now, not after Q-Day headlines.

## What to do this quarter

First, inventory quantum-vulnerable crypto on external TLS and critical dependencies — not a spreadsheet snapshot, but a repeatable scan with algorithm tags and framework crosswalks.

Second, quantify HNDL exposure for your longest-lived data classes. Third, map findings to the deadlines your auditors already track (NSM-10, CNSA 2.0, NIST IR 8547). Qtangl Assess produces a prioritized backlog with signed artifacts suitable for audit evidence — an inventory aid, not a formal attestation.
