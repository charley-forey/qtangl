---
title: "QKD vs PQC: what security teams confuse"
description: "Quantum key distribution and post-quantum cryptography solve different problems — when each applies and why PQC is the TLS migration path."
keyword: "QKD vs post-quantum cryptography"
journeyStage: all
hubLink: "/q-day/what-is-q-day"
hubLabel: "What is Q-Day? guide"
ctaPrimary: "/assess/mini"
datePublished: "2026-06-21"
eyebrow: "Education"
intro: "Quantum key distribution (QKD) and post-quantum cryptography (PQC) both appear in quantum security conversations — but they are not interchangeable solutions for enterprise TLS migration."
sourceIds: [nist-pqc-overview, cisa-pqc-initiative, cisa-quantum-readiness-factsheet, nccoe-migration-pqc, nist-pqc-videos]
videoId: "CJqJCpSxadE"
videoTitle: "Q-Day Explained: The Quantum Threat to Encryption"
---

## Side-by-side comparison

| | **Post-quantum cryptography (PQC)** | **Quantum key distribution (QKD)** |
|---|-------------------------------------|-------------------------------------|
| **Mechanism** | New classical math (lattices, hashes) | Quantum physics (photon states) |
| **Deploys on** | Existing TLS, PKI, software stacks | Dedicated fiber/satellite links |
| **NIST status** | FIPS 203–205 finalized | Outside NIST PQC standardization |
| **Enterprise TLS path** | Primary migration route | Niche / specialized links |

[NIST's PQC program](https://www.nist.gov/pqc) standardizes algorithms software vendors integrate into OpenSSL, browsers, and HSMs. [CISA guidance](https://www.cisa.gov/topics/risk-management/quantum) focuses on PQC migration for broad cyber infrastructure.

QKD detects eavesdropping on optical channels — valuable for specific high-assurance links — but does not replace PKI inventory and ML-KEM deployment across your SaaS estate.

## What to tell leadership

- **PQC migration is the 2024–2035 program** aligned to [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final) and [CISA's factsheet](https://www.cisa.gov/resources-tools/resources/quantum-readiness-migration-post-quantum-cryptography).
- **QKD may complement** specialized links; it is not a substitute for finding RSA certificates on your CDN.
- The [NCCoE migration project](https://www.nccoe.nist.gov/applied-cryptography/migration-to-pqc) demonstrates software-based PQC tooling enterprises can adopt today.

## This quarter

1. Clarify terminology in your risk register: PQC = algorithm migration; QKD = physical key exchange.
2. Inventory quantum-vulnerable **software** crypto regardless of QKD pilots.
3. Watch [NIST featured videos](https://www.nist.gov/pqc) for official PQC explainers.
