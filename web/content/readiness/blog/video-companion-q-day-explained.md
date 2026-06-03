---
title: "After Q-Day Explained: what mid-market CISOs should do this quarter"
description: "Original takeaways from a popular Q-Day video — CRQC timelines, HNDL exposure, and your first inventory steps."
keyword: "what is Q-Day"
journeyStage: assess
hubLink: "/q-day/what-is-q-day"
hubLabel: "What is Q-Day? guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-04"
eyebrow: "Video companion"
intro: "Popular explainers get the threat right — quantum computers will eventually break RSA and ECC. The gap for most enterprises is turning that awareness into an inventory program with evidence auditors can check."
sourceIds: [nist-pqc-overview, palo-alto-q-day, video-q-day-explained]
videoId: "CJqJCpSxadE"
videoTitle: "Q-Day Explained: The Quantum Threat to Encryption"
---

## The core claim in plain language

Q-Day is not a calendar date on anyone's wall. It is the capability milestone when a cryptographically relevant quantum computer can break the public-key cryptography your TLS, VPNs, and code signing depend on today. Most expert estimates still place that milestone in the 2030s — but harvest-now-decrypt-later means adversaries can copy ciphertext now and decrypt it later.

## What the video gets right

- **Shor's algorithm** breaks RSA and ECC — symmetric crypto like AES needs larger keys (Grover), but public-key infrastructure is the urgent migration target.
- **HNDL is real today** — storage is cheap; breaking crypto today is not required to threaten long-lived secrets.
- **PQC standards exist** — NIST finalized ML-KEM, ML-DSA, and SLH-DSA in 2024; migration can start now.

## What it does not cover (where Qtangl fits)

Explainers rarely answer operational questions: which endpoints still use RSA-2048, which third-party SaaS dependencies embed legacy crypto, and who owns remediation. A one-time spreadsheet exercise decays within weeks.

Qtangl Assess produces a prioritized backlog with algorithm tags, framework crosswalks, and signed scan artifacts your board can reference — an inventory aid, not a formal attestation.

## 90-day action checklist

1. Run a baseline cryptographic inventory on external TLS and critical dependencies.
2. Export a CycloneDX CBOM and map findings to NSM-10, CNSA 2.0, or NIST IR 8547 tiers.
3. Quantify HNDL exposure for your longest-lived data classes using Mosca's inequality.
4. Schedule re-scans aligned to your change cadence — one scan satisfies this quarter's slide, not next year's audit.
