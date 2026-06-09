---
title: "Crypto discovery methods compared"
description: "Agentless scan vs host agents vs code scan vs KMS — why NIST says combine 2–3 methods and how Qtangl fits."
keyword: "crypto discovery methods"
journeyStage: assess
hubLink: "/compare"
hubLabel: "Vendor comparison hub"
ctaPrimary: "/assess"
datePublished: "2026-06-09"
eyebrow: "Education"
intro: "No single discovery method inventories your full cryptographic estate. Here is the structural divide every PQC vendor is anchored to — and why Qtangl leads with agentless external plus verifiable evidence."
sourceIds: [nist-ir-8547, nist-pqc-overview]
---

## Five discovery methods

| Method | What it finds | Blind spots |
|--------|---------------|-------------|
| **Agentless external** | TLS, JWKS, SSH, email, CT logs | Internal hosts, code, dormant keys |
| **Host / endpoint agents** | Keystores, memory, filesystem crypto | Legacy/OT without agents |
| **Source / binary scan** | Algorithms in repos and builds | Runtime-loaded crypto |
| **Key / KMS** | Keys in cloud KMS, Vault, HSM | Wire-exposed protocol posture |
| **Certificate / CLM** | Managed certs and issuance | JWKS, SSH, non-cert crypto |

NIST NCCoE and industry guidance: **combine 2–3 methods** for a complete picture.

## How vendors anchor

- **Qtangl, Qinsight, ExeQuantum, QuSecure R3, Palo Alto** — agentless or network-telemetry first
- **SandboxAQ, Keyfactor** — host-agent depth
- **IBM Quantum Safe** — code-first
- **Fortanix** — KMS-centric
- **DigiCert, AppViewX, CyberArk** — CLM-centric

## Qtangl's position

We are the **fastest external baseline** — minutes to inventory without agent rollout. We do **not** claim full-estate coverage. We are the **neutral evidence layer** that signs merged CBOMs from any source.

See the [discovery method heatmap](/compare) and [full comparison hub](/compare).
