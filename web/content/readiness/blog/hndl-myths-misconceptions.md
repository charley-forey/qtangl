---
title: "HNDL myths: AES, TLS 1.3, and \"we'll rotate in 2035\""
description: "Common harvest-now-decrypt-later misconceptions — and honest answers for skeptical security teams."
keyword: "harvest now decrypt later myths"
journeyStage: assess
hubLink: "/q-day/hndl"
hubLabel: "Harvest now, decrypt later guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-04"
eyebrow: "Education"
intro: "Skeptics often conflate HNDL with broken encryption or quantum hype. These myths block the inventory work that actually reduces exposure."
sourceIds: [nist-pqc-overview, mosca-inequality, nist-ir-8547]
---

## Key terms

HNDL, CRQC, forward secrecy, Mosca inequality — see the [HNDL hub](/q-day/hndl).

## Myth 1: "Our encryption is broken today"

**Reality:** RSA, ECDSA, and ECDH still protect data in transit and at rest **right now**. HNDL is a **temporal** risk — ciphertext copied today may become readable after Q-Day while your migration is still in progress.

## Myth 2: "AES-256 is the problem"

**Reality:** Symmetric encryption is not the primary HNDL target. Adversaries attack **public-key layers** — RSA key exchange, ECDH handshakes, ECIES-wrapped archives — that protect the symmetric keys.

## Myth 3: "TLS 1.3 makes HNDL irrelevant"

**Reality:** Forward secrecy limits passive decryption, but **stored handshakes** remain quantum-vulnerable. Long-retention backups and breach exfiltration bypass TLS entirely.

## Myth 4: "We'll rotate keys in 2035"

**Reality:** Rotation does not un-copy ciphertext already exfiltrated. Mosca inequality (X + Y > Z) applies to **when data was captured**, not when you plan to rotate.

## Myth 5: "Quantum is decades away"

**Reality:** Industry timelines accelerated — Google and Cloudflare target 2029 for post-quantum readiness. HNDL means adversaries **start copying now** regardless of your timeline.

## What actually helps

- Cryptographic inventory with Mosca HNDL scoring
- Phased hybrid TLS migration with re-scan proof
- CBOM export for audit cycles

[Run a free mini-assessment](/assess/mini) to quantify your exposure — inventory aid, not formal audit.
