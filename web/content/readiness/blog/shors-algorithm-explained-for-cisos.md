---
title: "Shor's algorithm for CISOs (no math degree required)"
description: "Executive-friendly Shor's explainer — why RSA and ECC fall, what survives, and what to inventory first."
keyword: "Shor's algorithm CISO"
journeyStage: assess
hubLink: "/q-day/what-is-q-day"
hubLabel: "What is Q-Day? guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Education"
intro: "You do not need quantum physics to understand the business risk: Shor's algorithm breaks the public-key math your TLS, VPNs, and code signing depend on today."
sourceIds: [video-minutephysics-shor, postquantum-shor-article, nist-pqc-overview, ibm-shor-tutorial, pennylane-period-finding]
videoId: "lvTqbM5Dq4Q"
videoTitle: "How Quantum Computers Break Encryption | Shor's Algorithm Explained"
---

## The one-sentence version

A sufficiently large quantum computer running [Shor's algorithm](https://postquantum.com/post-quantum/shors-algorithm-a-quantum-threat/) can factor the large numbers and solve the discrete logarithm problems that make RSA, Diffie-Hellman, and elliptic-curve cryptography secure today.

## What breaks vs what mostly survives

| Category | Examples | Quantum impact |
|----------|----------|----------------|
| Public-key encryption & key exchange | RSA, ECDH | Broken by Shor's |
| Digital signatures | RSA-PSS, ECDSA | Broken by Shor's |
| Symmetric encryption | AES-256 | Weakened by Grover's — use larger keys |
| Hash functions | SHA-256, SHA-3 | Grover's reduces effective strength — generally manageable |

[NIST's PQC overview](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) focuses migration on public-key systems. See our [Grover's algorithm explainer](/blog/grovers-algorithm-and-aes) for symmetric crypto guidance.

## How Shor's works (conceptually)

1. Pick a random number related to the target composite \(N\).
2. Find the **period** of a modular exponentiation function — classically hard, quantum-friendly.
3. Use number theory to recover factors from the period.

The [IBM Quantum Shor's tutorial](https://quantum.cloud.ibm.com/docs/en/tutorials/shors-algorithm) shows code; [PennyLane's period-finding demo](https://pennylane.ai/demos/tutorial_period_finding) illustrates the core idea interactively.

## What CISOs should do

1. Watch the embedded minutephysics video and read [PostQuantum.com's Shor's article](https://postquantum.com/post-quantum/shors-algorithm-a-quantum-threat/).
2. Inventory quantum-vulnerable algorithms on external TLS and critical dependencies.
3. Begin hybrid PQC pilots aligned to [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final).

Quantum-vulnerable does not mean broken today — but harvest-now-decrypt-later means long-lived secrets need action now.
