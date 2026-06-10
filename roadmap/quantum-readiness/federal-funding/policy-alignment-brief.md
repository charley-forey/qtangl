# Policy Alignment Brief — For Federal Proposals

Use this document to cite authoritative government sources in SBIR proposals, federal one-pagers, and integrator decks. Every claim below maps to a Qtangl capability.

**Positioning rule:** Qtangl solves **cryptographic visibility and migration planning** — the problem federal policy explicitly names. We do not sell quantum algorithms.

---

## The policy problem (quote-ready)

### NSM-10 (National Security Memorandum 10, May 2022)

Federal agencies must:
- Inventory cryptographic systems
- Identify quantum-vulnerable assets
- Develop PQC migration plans
- Prioritize migration of most sensitive systems

**Qtangl mapping:** Assess (inventory) → Monitor (continuous) → Convert (migration workflow) → Evidence (prove progress)

### NIST IR 8547 — Transition to Post-Quantum Cryptography Standards

- Primary federal target: **complete PQC migration by 2035**
- Organizations must identify systems using quantum-vulnerable public-key cryptography
- Migration timelines vary by use case; long-confidentiality data requires earlier action
- URL: https://csrc.nist.gov/pubs/ir/8547/ipd

**Qtangl mapping:** Mosca HNDL scoring prioritizes by confidentiality lifetime; readiness score tracks migration progress

### OMB M-23-02 — Migrating to Post-Quantum Cryptography

- Executive departments must report cryptographic systems using quantum-vulnerable algorithms
- Annual inventory submission to ONCD and CISA
- CISA tasked with strategy for **automated tooling** to assess agency progress

**Qtangl mapping:** Monitor tier + CBOM export + framework-mapped reports = inventory automation

### CISA ACDI Strategy (Automated Cryptography Discovery and Inventory)

**Primary goal:** Enable assessment of agency PQC transition progress using **ACDI tools**.

ACDI tools should:
- Create inventory of information systems with CRQC-vulnerable cryptography
- Automate collection of cryptographic characteristics for annual inventory
- Integrate with CDM Program dashboards (future)

**Qtangl mapping:** This is the single strongest policy alignment. Qtangl is an ACDI-class platform:
- Agentless external discovery (TLS, JWKS, SSH, email)
- Host sensor (cert stores, listeners)
- Code/binary CBOM (supply chain)
- CycloneDX CBOM standard artifact
- Continuous Monitor (not point-in-time)

URL: https://www.cisa.gov/resources-tools/resources/strategy-migrating-automated-post-quantum-cryptography-discovery-and-inventory-tools

### CISA / NSA / NIST Quantum-Readiness Factsheet (August 2023)

Recommends organizations:
1. Establish a Quantum-Readiness Roadmap
2. Prepare a **useful cryptographic inventory**
3. Assess supply chain reliance on quantum-vulnerable cryptography
4. Engage technology vendors on PQC roadmaps

**Qtangl mapping:** Full CPM workflow; vendor crypto dependency mapping in CBOM

URL: https://www.cisa.gov/resources-tools/resources/quantum-readiness-migration-post-quantum-cryptography

### NIST NCCoE SP 1800-38B — Cryptographic Discovery

Focuses on **Step 2: Prepare a Cryptographic Inventory** in the PQC migration framework.

Automated tools should identify:
- Algorithms in hardware, software modules, libraries, embedded code
- Key establishment and management processes
- Algorithms protecting data at rest, in transit, and in use

**Qtangl mapping:** Full-stack discovery (external + host + code + binary) aligns with NCCoE multi-method approach

Draft: https://www.nccoe.nist.gov/sites/default/files/2023-12/pqc-migration-nist-sp-1800-38b-preliminary-draft.pdf

### CNSA 2.0 (NSA, September 2022)

Mandates quantum-resistant algorithms for National Security Systems:
- ML-KEM-1024 for key establishment (by 2030)
- ML-DSA-87 or SLH-DSA for software/firmware signing (by 2025)
- AES-256, SHA-384/512 for symmetric

**Qtangl mapping:** Framework crosswalk in reports; remediation guidance for signing algorithms (FIPS 205); CNSA 2.0 deadline tiers in readiness score

URL: https://www.nsa.gov/Cybersecurity/Post-Quantum-Cybersecurity-Resources/

### CISA PQC Product Categories (EO 14306, June 2025)

CISA publishes categories where PQC-capable products are widely available. Agencies should procure PQC-capable products in those categories.

**Qtangl mapping:** Qtangl is not a crypto product vendor — we are the **assessment layer** that tells agencies which categories and assets still use legacy algorithms and tracks migration to PQC-capable replacements.

URL: https://www.cisa.gov/resources-tools/resources/product-categories-technologies-use-post-quantum-cryptography-standards

---

## Capability ↔ policy matrix (for proposals)

| Qtangl capability | Policy driver | Agency owner |
|-------------------|---------------|--------------|
| Agentless TLS/JWKS/SSH scan | CISA ACDI; NIST SP 1800-38B | CISA, all FCEB |
| CycloneDX CBOM export | Supply chain EO; NIST SSDF | CISA, NIST |
| Host sensor fleet | FCEB inventory depth; CMMC evidence | DoD, DIB |
| Code/binary crypto scan | Software supply chain security | DHS, CISA |
| Mosca HNDL scoring | NSM-10; NIST IR 8547 | All federal |
| NSM-10 / CNSA 2.0 / CMMC crosswalk | NSM-10; CNSA 2.0; CMMC 2.0 | DoD, DIB |
| Signed evidence + verify | Audit-grade migration proof | All |
| Continuous Monitor + drift | M-23-02 annual inventory; crypto-agility | CISA, ONCD |
| Executive readiness dashboard | Board/CISO reporting mandates | All |

---

## Proposal language snippets

### Problem statement

> Federal agencies and critical infrastructure operators cannot meet NSM-10 and OMB M-23-02 inventory requirements using manual spreadsheets and annual consulting engagements. CISA's ACDI strategy explicitly calls for automated cryptography discovery and inventory tools. No single discovery method is complete — organizations need continuous, multi-method visibility with audit-grade evidence.

### Technical innovation

> Qtangl delivers Cryptographic Posture Management (CPM): an AI-assisted platform that combines agentless external scanning, host sensor fleet discovery, and source/binary CBOM generation to produce a unified cryptographic inventory. The system assigns quantum-risk scores using Mosca's inequality, maps findings to NSM-10/CNSA 2.0/NIST IR 8547 tiers, and produces signed, publicly verifiable evidence of migration progress — addressing the exact gap NIST NCCoE identifies in SP 1800-38B.

### Broader impact

> Successful deployment gives federal agencies and critical infrastructure operators a scalable path to the 2035 PQC migration target without proportional headcount growth. The platform aligns with CISA's ACDI tooling strategy and NIST's migration framework, reducing national risk from harvest-now-decrypt-later (HNDL) attacks against long-lived sensitive data.

### Commercial potential

> Every regulated enterprise (500–10,000 employees) faces the same inventory mandate. Qtangl's mid-market pricing and self-serve Assess wedge create a commercial market parallel to federal adoption — SBIR Phase I proves feasibility; Phase II scales through integrators and Monitor subscriptions.

---

## What NOT to claim

| Avoid | Say instead |
|-------|-------------|
| "We implement ML-KEM / ML-DSA" | "We discover where legacy algorithms are used and track migration to PQC-capable replacements" |
| "FedRAMP authorized" | "FedRAMP-relevant evidence inputs" ([17-legal-regulatory-and-compliance.md](../17-legal-regulatory-and-compliance.md)) |
| "CMMC certified" | "CMMC-ready crypto inventory evidence" |
| "Full estate coverage from external scan" | "Fast external baseline + layered host/code depth" |
| "Quantum computing platform" | "Cryptographic visibility and quantum readiness" |

---

## References (copy to proposal bibliographies)

1. NIST IR 8547 (ipd). Transition to Post-Quantum Cryptography Standards. https://csrc.nist.gov/pubs/ir/8547/ipd
2. CISA. Strategy for Migrating to Automated PQC Discovery and Inventory Tools. 2024. https://www.cisa.gov/sites/default/files/2024-09/Strategy-for-Migrating-to-Automated-PQC-Discovery-and-Inventory-Tools.pdf
3. CISA, NSA, NIST. Quantum-Readiness: Migration to Post-Quantum Cryptography. 2023.
4. NIST NCCoE. Migration to PQC — SP 1800-38B Preliminary Draft (Cryptographic Discovery). 2023.
5. NSA. Commercial National Security Algorithm Suite 2.0. 2022.
6. OMB M-23-02. Migrating to Post-Quantum Cryptography. 2022.
7. NIST FIPS 203, 204, 205, 206. Post-Quantum Cryptography Standards. 2024.

---

*Use with [templates/federal-one-pager.md](./templates/federal-one-pager.md) and proposal outlines.*
