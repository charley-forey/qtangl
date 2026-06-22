---
title: "Peter Shor in his own words: implications for your PKI"
description: "Physics World's interview with Peter Shor — what the algorithm's creator says about factoring and future quantum computers."
keyword: "Peter Shor algorithm"
journeyStage: assess
hubLink: "/q-day/what-is-q-day"
hubLabel: "What is Q-Day? guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "Peter Shor describes how quantum computers use interference to find periods — the breakthrough that threatens RSA. Hearing it from the inventor reframes urgency for PKI owners."
sourceIds: [video-physics-world-shor, nist-pqc-overview, fips-203, nist-ir-8547]
videoId: "hOlOY7NyMfs"
videoTitle: "What is Shor's factoring algorithm?"
---

## What the video gets right

Shor explains the quantum factoring algorithm as turning a factoring problem into period-finding, then using a quantum computer as a "computational interferometer" to read off the period. Classical factoring takes exponential time; Shor's runs in polynomial time on an ideal quantum machine.

That asymmetry is why [ML-KEM (FIPS 203)](https://csrc.nist.gov/publications/detail/fips/203/final) replaces ECDH for key exchange and why [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) sets deprecation timelines for RSA and elliptic-curve algorithms.

## What it does not cover

Shor's algorithm requires millions of logical qubits with error correction to break RSA-2048 in practice — but HNDL does not wait for that milestone. Ciphertext captured today remains at risk for the confidentiality lifetime of the data.

See the [NIST PQC overview](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) for the harvest-now-decrypt-later threat model.

## This quarter

1. Brief your PKI team using this video plus the [ML-KEM framework guide](/q-day/frameworks/ml-kem).
2. Identify code-signing and document-signing certificates on RSA or ECDSA.
3. Schedule hybrid TLS pilots using ML-KEM alongside classical algorithms during transition.
