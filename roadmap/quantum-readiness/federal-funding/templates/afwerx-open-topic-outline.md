# AFWERX Open Topic — Proposal Outline

**Program:** https://afwerx.com/divisions/sbir-sttr/open-topic/  
**Submit via:** https://www.dodsbirsttr.mil/submissions/login (DSIP)  
**Phase I:** $75K (SBIR) / $110K (STTR) · 3 months

Use this outline when an Open Topic BAA is open. Adapt page limits and volumes to the specific BAA instructions.

---

## Proposal metadata

| Field | Value |
|-------|-------|
| Program | AFWERX Open Topic |
| Component | Department of the Air Force (DAF) |
| Phase | Phase I |
| Proposed title | Autonomous Cryptographic Asset Discovery and PQC Readiness Monitoring for Defense Networks |
| Topic number | [From DSIP when open] |
| Firm UEI | [SAM] |
| PI | [Name] |
| Corporate Official | [Name — must certify in DSIP] |

---

## Volume 1 — Technical proposal

### 1.1 Identification and significance of the problem

**Defense context:**

- DoD networks contain quantum-vulnerable cryptography (RSA, ECDSA) embedded in TLS endpoints, code-signing pipelines, PKI, VPNs, and legacy operational systems
- NSM-10 and CNSA 2.0 mandate migration timelines; DAF must inventory and prioritize without full visibility
- Manual crypto inventories are incomplete, expensive, and stale within weeks of completion
- Harvest-now-decrypt-later (HNDL) threat: adversaries capture encrypted traffic today for future decryption

**Gap:** No continuous, multi-method discovery platform provides DAF with prioritized PQC readiness scores and audit-grade evidence at deployment speed.

### 1.2 Proposed solution

**Qtangl Cryptographic Posture Management (CPM) platform:**

| Component | Capability |
|-----------|------------|
| Agentless scanner | TLS/JWKS/SSH/email STARTTLS discovery — minutes to baseline |
| Host sensor | mTLS-enrolled fleet; cert store + listener inventory |
| Code/binary CBOM | CryptoScan/CryptoDeps; CycloneDX export |
| Risk engine | Mosca HNDL scoring; CNSA 2.0 / NSM-10 tier mapping |
| Monitor | Scheduled re-scans; drift diff; SIEM webhook alerts |
| Evidence | Signed reports; public verify link |

**Phase I focus (3 months, $75K):**

1. Deploy agentless discovery against representative DAF network segment (or lab environment)
2. Produce cryptographic inventory + CBOM for ≥100 endpoints
3. Deliver prioritized PQC readiness report with CNSA 2.0 crosswalk
4. Demonstrate continuous monitor drift detection on one critical service
5. Document Phase II scaling plan with identified DAF end user

### 1.3 Related work / differentiation

| Alternative | Limitation | Qtangl advantage |
|-------------|------------|------------------|
| Manual assessment | Point-in-time; no monitoring | Continuous CPM |
| CLM tools | Cert inventory only | Quantum-vuln classification |
| ASM scanners | General vulns, not crypto-specific | Crypto-native discovery |
| Enterprise PQC suites | $500K+; slow | Mid-market speed + price |

### 1.4 Technical approach

**Month 1:** Environment onboarding; agentless scan; initial CBOM  
**Month 2:** Host sensor pilot (if authorized); risk prioritization; CNSA 2.0 mapping  
**Month 3:** Monitor deployment; drift demo; Phase II plan + final report

**R&D risk:** Discovery completeness across classified-adjacent boundaries — mitigated by layered methods per NIST NCCoE guidance.

### 1.5 Expected results

| Deliverable | Format |
|-------------|--------|
| Preliminary report (Month 2) | PDF + CBOM JSON |
| Final report (Month 3) | PDF + signed evidence |
| Working prototype | SaaS deployment or on-prem option |
| Phase II transition plan | Customer Memorandum candidate identified |

### 1.6 DAF customer and transition

**Target end users:**
- [AF Cyber Squadron / SCO / Program Office — identify before Phase II]
- [Air Force Materiel Command IT modernization office]

**Phase II path ($1.25M):**
- Scale to enterprise DAF segment
- Integrate with existing SIEM/GRC
- Continuous compliance reporting for PQC migration program office

**Phase III / commercialization:**
- Monitor SaaS subscription
- Fed integrator channel (AWS GovCloud, defense IT contractors)

---

## Volume 2 — Cost proposal

| Item | Phase I (3 months) |
|------|-------------------|
| PI labor (1 mo equiv) | $[ ] |
| Engineering labor | $[ ] |
| Cloud/infra | $[ ] |
| TABA (if allowed) | $[ ] |
| **Total** | ≤ $75,000 |

---

## Volume 3 — Company commercialization

### Market

- DAF + broader DoD PQC migration (every service faces same inventory gap)
- Defense Industrial Base (CMMC crypto evidence)
- Commercial critical infrastructure (dual-use)

### Revenue model

- Assess → Monitor → Convert tiered SaaS
- Monitor ACV: $75K–$150K
- 97% gross margin on Monitor tier

### Competition

See [11-competitive-intelligence.md](../../11-competitive-intelligence.md)

### Investment / partnerships

- [Any angel/pre-seed]
- NIST NCCoE PQC COI participation
- [Integrator LOIs]

---

## DSIP submission checklist

- [ ] SAM registration Active
- [ ] SBA Company Registry PDF current
- [ ] Firm registered in DSIP
- [ ] Corporate Official designated
- [ ] All volumes complete in DSIP
- [ ] CO certification completed (not just "In Progress")
- [ ] Submitted **before** topic close date (early submission recommended)
- [ ] Topic Q&A reviewed during pre-release period

---

## Phase II preparation (start during Phase I)

- [ ] Identify DAF end user willing to sign **Customer Memorandum**
- [ ] Document technical merit from Phase I results
- [ ] Direct to Phase II (D2P2) option if prototype ready + CM in hand

**STRATFI/TACFI (later):** https://afwerx.com/divisions/sbir-sttr/stratfi-tacfi/ — requires Phase II; government submits.

---

*See [policy-alignment-brief.md](../policy-alignment-brief.md) for citation language.*
