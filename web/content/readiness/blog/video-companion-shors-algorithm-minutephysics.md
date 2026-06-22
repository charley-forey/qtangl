---
title: "After minutephysics on Shor's: what CISOs must know about RSA and ECC"
description: "Original takeaways from minutephysics on Shor's algorithm — and how to map the threat to your PKI inventory."
keyword: "Shor's algorithm explained"
journeyStage: assess
hubLink: "/q-day/what-is-q-day"
hubLabel: "What is Q-Day? guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "minutephysics explains Shor's algorithm without requiring a physics degree. The gap for security leaders is translating period-finding into a concrete inventory of quantum-vulnerable algorithms."
sourceIds: [video-minutephysics-shor, postquantum-shor-article, nist-pqc-overview, pennylane-period-finding]
videoId: "lvTqbM5Dq4Q"
videoTitle: "How Quantum Computers Break Encryption | Shor's Algorithm Explained"
---

## What the video gets right

[Shor's algorithm](https://postquantum.com/post-quantum/shors-algorithm-a-quantum-threat/) turns factoring large numbers — the hard problem behind RSA — into finding the period of a modular function. A cryptographically relevant quantum computer (CRQC) running Shor's breaks **public-key** crypto: RSA, Diffie-Hellman, and elliptic-curve variants (ECDH, ECDSA).

The video correctly notes that symmetric crypto like AES is not destroyed overnight; [Grover's algorithm](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) weakens it, which is why NIST recommends larger key sizes — but the urgent migration target is PKI and key exchange.

For background on period-finding, see the [PennyLane period-finding demo](https://pennylane.ai/demos/tutorial_period_finding).

## What it does not cover

Explainers rarely answer operational questions: which certificates still use RSA-2048, which SaaS dependencies embed legacy algorithms, and who owns remediation. [NIST's PQC overview](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) describes the solution — standardized ML-KEM and ML-DSA — but inventory comes first.

Qtangl Assess tags quantum-vulnerable algorithms on external TLS and exports a CycloneDX CBOM — an inventory aid, not a formal attestation.

## This quarter

1. Watch the embedded video, then skim [NIST's post-quantum cryptography explainer](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography).
2. Run a baseline scan on external TLS — list RSA, ECDSA, and ECDH dependencies.
3. Tag findings by data shelf-life tier for Mosca HNDL scoring on the [HNDL hub](/q-day/hndl).
