---
title: "After PBS Infinite Series: period-finding and the quantum threat to PKI"
description: "PBS Infinite Series goes deeper on Shor's number theory — here's what security engineers should take away."
keyword: "Shor's algorithm period finding"
journeyStage: assess
hubLink: "/q-day/what-is-q-day"
hubLabel: "What is Q-Day? guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "PBS Infinite Series walks through the mathematics behind Shor's algorithm — period-finding and the quantum Fourier transform — without assuming a quantum physics background."
sourceIds: [video-pbs-shor, video-minutephysics-shor, postquantum-shor-article, nist-pqc-overview]
videoId: "wUwZZaI5u0c"
videoTitle: "Hacking at Quantum Speed with Shor's Algorithm"
---

## What the video gets right

The core insight: factoring \(N = p \times q\) reduces to finding the period \(r\) of \(a^x \mod N\). Classical computers struggle with this; a quantum computer uses superposition and the quantum Fourier transform to extract the period efficiently.

That is why [RSA and elliptic-curve cryptography](https://postquantum.com/post-quantum/shors-algorithm-a-quantum-threat/) — both built on hard number-theoretic problems — fall to Shor's. Pair this video with [minutephysics' Shor's explainer](/blog/video-companion-shors-algorithm-minutephysics) for a two-part foundation.

[NIST's overview](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography) explains why lattice-based replacements (ML-KEM, ML-DSA) resist known quantum attacks.

## What it does not cover

Period-finding is elegant mathematics; your audit committee wants asset lists. Engineers need to know **where** RSA and ECDH appear: TLS handshakes, code signing, email (S/MIME), VPN, and JWKS endpoints for OIDC tokens.

## This quarter

1. Complete both Shor explainers (minutephysics + PBS) and confirm you can explain the threat without slides.
2. Extend inventory beyond web TLS to JWKS, STARTTLS, and SSH host keys.
3. Export a CBOM and crosswalk to [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) migration phases.
