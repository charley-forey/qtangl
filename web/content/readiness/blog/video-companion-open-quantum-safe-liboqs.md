---
title: "Hands-on with Open Quantum Safe: your first ML-KEM keypair"
description: "Open Quantum Safe liboqs and IBM's quantum-safe OpenSSL tutorial — prototype PQC before production vendor support."
keyword: "liboqs ML-KEM tutorial"
journeyStage: assess
hubLink: "/learn/topics/post-quantum-crypto-libraries"
hubLabel: "PQC libraries guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Video companion"
intro: "Open Quantum Safe provides reference implementations of NIST PQC algorithms. liboqs is for prototyping — production deployments should use vendor-supported, validated stacks."
sourceIds: [open-quantum-safe, ibm-quantum-safe-openssl, fips-203, video-pq-algorithms, video-menezes-kyber-dilithium]
videoId: "9NKm84vKALc"
videoTitle: "Short course on Kyber (ML-KEM) and Dilithium (ML-DSA) by Alfred Menezes"
---

## What OQS provides

The [Open Quantum Safe project](https://openquantumsafe.org/) ships:

- **liboqs** — C library with ML-KEM, ML-DSA, and experimental algorithms
- **oqs-provider** — OpenSSL 3 integration for hybrid TLS
- **oqs-demos** — Docker images for curl, nginx, and Apache with PQC enabled

IBM's [quantum-safe OpenSSL tutorial](https://developer.ibm.com/tutorials/awb-quantum-safe-openssl) walks through enabling PQC in TLS handshakes. Test interoperability at [test.openquantumsafe.org](https://test.openquantumsafe.org/).

Understand the algorithms first via [Menezes' ML-KEM course](https://cryptography101.ca/kyber-dilithium/) and [FIPS 203](https://csrc.nist.gov/publications/detail/fips/203/final).

**Important:** OQS labels itself for prototyping. Production systems should use FIPS-validated vendor implementations.

## What it does not cover

Lab success does not prove enterprise readiness. You still need estate-wide inventory, change management, and signed evidence after remediation.

## This quarter

1. Run liboqs `test_kem` locally or via Docker oqs-demos.
2. Complete IBM's OpenSSL tutorial in an isolated lab.
3. Map lab learnings to production vendor roadmaps (cloud LB, CDN, HSM).
