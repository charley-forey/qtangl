---
title: "After Alfred Menezes: ML-KEM and ML-DSA in plain language"
description: "Alfred Menezes' Kyber and Dilithium course — lattice KEM and signatures standardized as FIPS 203 and 204."
keyword: "ML-KEM ML-DSA explained"
journeyStage: assess
hubLink: "/q-day/frameworks/ml-kem"
hubLabel: "ML-KEM migration guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "Alfred Menezes' Cryptography 101 course is the most accessible technical introduction to the lattice schemes NIST standardized as ML-KEM and ML-DSA."
sourceIds: [video-menezes-kyber-dilithium, cryptography101-kyber-dilithium, fips-203, fips-204, video-pq-algorithms]
videoId: "9NKm84vKALc"
videoTitle: "Short course on Kyber (ML-KEM) and Dilithium (ML-DSA) by Alfred Menezes"
---

## What the course covers

Menezes walks through [Kyber (ML-KEM)](https://csrc.nist.gov/publications/detail/fips/203/final) and [Dilithium (ML-DSA)](https://csrc.nist.gov/publications/detail/fips/204/final) from toy versions to full schemes, including optimizations that make lattice crypto practical at TLS scale.

The full [Cryptography 101 course page](https://cryptography101.ca/kyber-dilithium/) includes slides, lecture notes, and additional videos on the Number-Theoretic Transform (NTT).

For a shorter overview, see our companion to the [NIST PQC algorithms video](/blog/video-companion-pq-algorithms-nist).

## What it does not cover

Understanding algorithms does not deploy them. Production paths run through OpenSSL 3 + oqs-provider, vendor HSMs, or cloud KMS integrations — with hybrid TLS as the transition pattern.

## This quarter

1. Complete Menezes V1–V2 lectures; skim FIPS 203 section headers.
2. Pilot ML-KEM-768 hybrid key exchange in a lab environment.
3. Tag inventory findings by KEM vs signature migration priority.
