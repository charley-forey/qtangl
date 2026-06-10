# DHS SBIR — Proposal Outline

**Program:** https://www.dhs.gov/science-and-technology/sbir  
**Portal:** https://sbir.dhs.gov/sbir/public  
**Phase I:** up to $150K · 6 months

Use when annual solicitation opens. Adapt to **specific topic number** and requirements in the solicitation.

---

## Proposal metadata

| Field | Value |
|-------|-------|
| Solicitation | DHS [FY26.x] |
| Topic number | [e.g., DHS261-XXX — from solicitation] |
| Project title | Continuous Cryptographic Discovery and PQC Readiness Monitoring for Critical Infrastructure |
| Firm UEI | [SAM] |
| PI | [Name] |
| SBC Control ID | [SBIR.gov] |

---

## Cover sheet fields (portal entry)

| Field | Draft |
|-------|-------|
| Title | Continuous Cryptographic Discovery and PQC Readiness Monitoring for Critical Infrastructure |
| Abstract (≤250 words) | Critical infrastructure operators and DHS components cannot meet federal PQC migration mandates without automated cryptographic inventory. Manual assessments are incomplete for OT/IT converged environments. Qtangl proposes a Cryptographic Posture Management platform combining agentless external scanning, host sensor discovery, and CycloneDX CBOM generation to continuously identify quantum-vulnerable algorithms (RSA, ECDSA), score harvest-now-decrypt-later risk, and produce signed evidence for CISA-aligned reporting. Phase I will demonstrate feasibility on a representative critical infrastructure environment, producing prioritized migration roadmaps mapped to CISA's ACDI strategy and NIST IR 8547 tiers. |
| Keywords | post-quantum cryptography, cryptographic inventory, critical infrastructure, cybersecurity, OT security, supply chain, CBOM |

---

## Technical proposal structure (typical 15-page PDF)

*Confirm page limits in solicitation — DHS is strict about headers (topic + proposal number on every page).*

### 1. Problem statement

**Homeland security relevance:**

- CISA leads national PQC migration for critical infrastructure (energy, water, healthcare, transportation)
- CISA ACDI strategy requires automated cryptography discovery and inventory tools
- DHS components (CISA, TSA, Coast Guard, FEMA) operate mixed IT/OT with legacy cryptography
- EO 14306 accelerates PQC-capable procurement; operators need visibility before they can migrate
- Supply chain: third-party SaaS and embedded crypto in OT devices creates invisible exposure

**Current gap:** No affordable, continuous platform provides DHS stakeholders with CISA-aligned crypto inventory and drift monitoring.

### 2. Proposed innovation

Qtangl **Cryptographic Posture Management (CPM)**:

1. **Discover** — agentless + host + code/binary (multi-method per NIST NCCoE)
2. **Inventory** — CycloneDX CBOM standard artifact
3. **Assess** — Mosca HNDL scoring; NIST IR 8547 tier mapping
4. **Monitor** — continuous drift detection (not annual audit)
5. **Prove** — signed, verifiable evidence for compliance reporting

**Differentiation from prior art:**
- Not CLM (goes beyond certificates to algorithm classification)
- Not generic ASM (crypto-native)
- Not consulting (continuous SaaS at mid-market price)

### 3. Phase I research plan (6 months)

| Month | Activity | Deliverable |
|-------|----------|-------------|
| 1 | Requirements with DHS topic POC; lab/environment setup | Test plan |
| 2 | Agentless discovery on target environment | Initial inventory |
| 3 | Host sensor + code scan integration | Unified CBOM |
| 4 | Risk prioritization engine; CISA ACDI field mapping | Prioritized backlog |
| 5 | Monitor deployment; drift injection test | Alert demonstration |
| 6 | Final report; Phase II transition plan | Preliminary + final reports |

### 4. Anticipated results

| Result | Metric |
|--------|--------|
| Cryptographic inventory coverage | ≥[X] assets catalogued |
| Quantum-vulnerable findings classified | ≥95% accuracy on test corpus |
| CBOM export | Valid CycloneDX JSON |
| Drift detection latency | <24 hours |
| CISA ACDI characteristic mapping | Fields populated per strategy doc |

### 5. Related work

- NIST NCCoE Migration to PQC project (COI participant)
- CISA Quantum-Readiness factsheet alignment
- Qtangl pilot deployments [if any]

### 6. Key personnel

| Name | Role | Qualification |
|------|------|---------------|
| [PI] | Principal Investigator | [Security/crypto background] |
| [Eng] | Lead Engineer | [Discovery pipeline] |

### 7. Facilities and equipment

- Cloud-hosted SaaS (AWS US regions)
- Host sensor packages for Linux/Windows
- No special facilities required

### 8. Phase II vision

- Scale to production DHS component or critical infrastructure operator
- CDM integration path (per CISA ACDI strategy)
- Multi-tenant Monitor for sector ISACs
- $750K–$1M Phase II budget; 24 months

---

## DHS-specific topic angles

Map proposal emphasis to the topic you select:

| Topic theme | Emphasize |
|-------------|-----------|
| Cybersecurity (general) | ACDI alignment; FCEB-style inventory automation |
| Critical infrastructure | OT/IT convergence; SCADA-adjacent discovery |
| Supply chain risk | CBOM; third-party SaaS crypto dependencies |
| AI for cyber defense | ML-assisted classification; anomaly detection on crypto drift |
| IoT / OT security | Embedded crypto; appliance TLS; legacy protocols |

---

## Required uploads (verify per topic)

- [ ] Technical proposal PDF (topic + proposal number in header every page)
- [ ] SBA Company Registry PDF
- [ ] Cost proposal (portal fields + any uploaded forms)
- [ ] Supporting docs (NDA/GFI forms — only if topic requires)
- [ ] Letters of support (if allowed — integrator, design partner)

---

## DHS submission checklist

- [ ] Account validated on sbir.dhs.gov
- [ ] Topic number matches solicitation exactly
- [ ] Page limits respected
- [ ] Identical contact info across all sections
- [ ] Submitted before deadline (timezone: ET)
- [ ] Confirmation email received

**First-time applicants:** https://homelandsecurityphase0.dawnbreaker.com

---

## Post-award

| Phase | Amount | Duration |
|-------|--------|----------|
| Phase I | up to $150K | 6 months |
| Phase II | up to $1M | 24 months |
| Phase III | Non-SBIR funding | Derived from Phase I/II research |

---

*See [dhs/phase-i-submission-checklist](https://sbir.org/dhs/phase-i-submission-checklist/) for official requirements.*
