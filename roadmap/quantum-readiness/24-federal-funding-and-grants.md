# 24 — Federal Funding, Grants & Contracts

Non-dilutive funding playbook for Qtangl's **Cryptographic Posture Management (CPM)** platform. Use this to win SBIR/STTR awards, federal pilots, and direct contracts — validating the product while funding Assess → Monitor → Convert development.

**Resource hub:** [federal-funding/](./federal-funding/README.md) (checklists, templates, link directory)

---

## Executive summary

### The opportunity

NIST has finalized PQC standards (FIPS 203/204/205/206). Federal agencies and critical infrastructure operators must now:

1. **Discover** where cryptography exists (RSA, ECC, legacy TLS, signing keys)
2. **Inventory** assets with automated tooling (CBOM / cryptographic bill of materials)
3. **Assess** quantum risk and prioritize migration
4. **Monitor** drift continuously — not annual spreadsheet audits
5. **Prove** progress with evidence agencies and auditors can verify

NIST, CISA, and NSA have publicly identified **cryptographic inventory and visibility** as foundational blockers. Qtangl directly addresses this gap.

### Strategic positioning (critical)

| Do NOT lead with | DO lead with |
|------------------|--------------|
| Post-quantum cryptography platform | AI-powered **cryptographic visibility** and **quantum readiness** platform |
| Quantum computing | Cybersecurity modernization, supply chain security, critical infrastructure protection |
| Algorithm research | Discovery, inventory, risk scoring, migration roadmaps, continuous monitoring |

**Category claim:** Cryptographic Posture Management — the "CrowdStrike for cryptographic visibility and PQC readiness."

### Funding thesis

| Tier | Vehicle | Probability | Typical award | Timeline |
|------|---------|-------------|---------------|----------|
| **1** | NSF / AFWERX / DHS / DOE SBIR | Highest | $75K–$2M+ | 3–18 months |
| **2** | NIST NCCoE PQC Community | High (credibility) | $0 (relationships) | Immediate |
| **3** | Direct federal contracts / GSA HACS | Medium (needs traction) | $500K–$20M+ | 12–36 months |
| **4** | State SBIR matching | Medium (after federal win) | 25–50% match | After Phase I |

### Revenue + validation flywheel

```
NSF Pitch → Phase I ($75K–$250K)
    → NIST COI credibility
    → AFWERX / DHS Phase I
    → Federal pilot (integrator or agency)
    → Phase II ($750K–$2M)
    → STRATFI/TACFI or direct contract ($3M–$15M+)
```

Non-dilutive SBIR funds **product validation** (discovery depth, evidence layer, federal compliance mappings) while de-risking venture fundraising ([16-financial-model-and-fundraising.md](./16-financial-model-and-fundraising.md)).

---

## Qtangl capability map (for proposals)

Align proposal language to shipped and planned capabilities ([03-solution-architecture.md](./03-solution-architecture.md), [qtangl-full-stack-cpm-2026 blog](../../../web/content/readiness/blog/qtangl-full-stack-cpm-2026.md)):

| Capability | Proposal language | Policy alignment |
|------------|-------------------|------------------|
| Agentless external scan | TLS/JWKS/SSH/email STARTTLS discovery | CISA ACDI; NIST SP 1800-38B |
| Host sensor fleet | Cert stores, listeners, signed offline bundles | FCEB inventory requirements |
| Code + binary CBOM | CryptoScan/CryptoDeps, CycloneDX CBOM | Software supply chain security |
| Mosca HNDL scoring | Quantum risk prioritization | NSM-10; NIST IR 8547 |
| Framework crosswalk | NSM-10, CNSA 2.0, CMMC, NIST IR 8547 | Federal compliance reporting |
| Signed evidence | PQ-signed reports, public verify | Audit-grade migration proof |
| Continuous Monitor | Drift detection, SIEM webhooks | Crypto-agility programs |

**Honest scope:** Position agentless scan as fastest baseline; layer host/code/binary for depth ([11-competitive-intelligence.md](./11-competitive-intelligence.md)). Never claim full-estate coverage from external scan alone.

---

### Public identity (federal credibility)

Federal reviewers land on the website before reading proposals. Primary surfaces must lead with **Cryptographic Posture Management (CPM)** — not Quantum Planning API or optimization demos.

| Surface | Required message |
|---------|------------------|
| Homepage hero | CPM eyebrow · Assess. Monitor. Convert. · `/assess` CTA |
| Nav subtitle | Cryptographic Posture → `/platform` |
| Site metadata | Cryptographic visibility · CBOM · signed evidence |
| About | CPM category claim |
| `/demo`, `/technology`, `/labs` | Quarantined as expansion; readiness cross-link |

Copy modules: [readiness-home.ts](../../../web/lib/copy/readiness-home.ts) · [product.ts](../../../web/lib/copy/product.ts) `readinessMetadata` · [home.ts](../../../web/lib/copy/home.ts) (optimization-only).

---

## Prerequisite registrations

Complete before any award. Detailed steps: [federal-funding/registration-guide.md](./federal-funding/registration-guide.md).

| # | Registration | Required for | SAM needed? | Time |
|---|--------------|--------------|-------------|------|
| 1 | Login.gov | SAM, DSIP, Grants.gov | — | 15 min |
| 2 | SAM.gov entity registration (UEI) | All awards | — | 7–15 business days |
| 3 | SBA Company Registry | All SBIR/STTR | UEI recommended | ~10 min |
| 4 | Grants.gov | NSF full proposal, DOE | Yes | 1–2 weeks |
| 5 | Research.gov | NSF full proposal | Yes | 1 week |
| 6 | DSIP | AFWERX / all DoD SBIR | Yes | 1–2 days |
| 7 | PAMS | DOE SBIR | Yes | 1–2 days |
| 8 | DHS SBIR portal account | DHS SBIR | Yes | 1 day |

**Free help:** [APEX Accelerators](https://www.apexaccelerators.us) — walk through SAM registration and first SBIR proposal.

**SBIR timing (2026):** Programs reauthorized through **September 30, 2031**. Agencies are resuming solicitations on staggered schedules after the 2025 lapse. NSF and DoD are among the first; DHS expected **May–June 2026**.

---

## Tier 1 — SBIR/STTR programs

### 1. NSF SBIR — best first application

**Why first:** Startup-friendly; Project Pitch does not require SAM; funds AI, discovery, graph analysis, cybersecurity.

| Phase | Amount | Duration |
|-------|--------|----------|
| Phase I | ~$275K (varies by track) | 12 months |
| Phase II | ~$1M+ | 24 months |

**Process:**

1. **Project Pitch** (rolling, mandatory gatekeeper) — https://seedfund.nsf.gov/project-pitch/
   - Response in ~1–2 months
   - One pitch at a time per company
   - SAM **not** required
2. **Program Director call** (optional but recommended after pitch invite)
3. **Full Phase I proposal** (if invited) via Research.gov — solicitation NSF 26-510
   - Deadlines: **July 27, 2026** · **November 4, 2026** · March cycle
4. **Decision** ~6 months after full proposal

**Eligibility highlights:**

- U.S. for-profit, ≤500 employees
- ≥50% U.S. citizen/permanent resident ownership
- PI employed ≥20 hrs/week at company; ≥173 hrs per 6 months on project
- All funded work performed in U.S.

**Template:** [federal-funding/templates/nsf-project-pitch.md](./federal-funding/templates/nsf-project-pitch.md)

---

### 2. AFWERX Open Topic — fastest DoD entry

**Why:** "Front door" for commercial tech to Air Force/Space Force; broad Open Topic accepts dual-use cybersecurity solutions.

| Phase | Amount | Duration |
|-------|--------|----------|
| Phase I | $75K (SBIR) / $110K (STTR) | 3 months |
| Phase II | up to $1.25M | up to 21 months |
| Direct to Phase II | up to $1.25M | Skip Phase I if end-user CM signed |

**Process:**

1. Register SAM + SBA Company Registry
2. Register in **DSIP**: https://www.dodsbirsttr.mil/submissions/login
3. Monitor AFWERX for Open Topic BAA release (out-of-cycle)
4. Submit proposal in DSIP when topic opens
5. For Phase II: secure **Customer Memorandum** from DAF end user

**Target areas:** Quantum readiness, cybersecurity, zero trust, critical infrastructure, AI-driven cyber defense.

**Template:** [federal-funding/templates/afwerx-open-topic-outline.md](./federal-funding/templates/afwerx-open-topic-outline.md)

**Follow-on — STRATFI/TACFI ($3M–$15M+):**

- Requires active or recently completed Phase II
- Submitted by **government partner**, not startup
- https://afwerx.com/divisions/sbir-sttr/stratfi-tacfi/

---

### 3. DHS SBIR — CISA / critical infrastructure fit

**Why:** DHS funds cybersecurity, critical infrastructure, OT security, supply chain risk — direct alignment with Qtangl Monitor + discovery for utilities, healthcare, transportation.

| Phase | Amount | Duration |
|-------|--------|----------|
| Phase I | up to $150K | 6 months |
| Phase II | up to $1M | 24 months |

**Process:**

1. Create account: https://sbir.dhs.gov/sbir/public
2. Sign up for SBIR mailing list on portal
3. Wait for annual solicitation (~1 per year; next expected **May–June 2026**)
4. Select cybersecurity / OT / critical infrastructure topic
5. Submit via DHS portal (strict formatting — see checklist)

**First-time applicants:** DHS Phase 0 mentoring — https://homelandsecurityphase0.dawnbreaker.com

**Template:** [federal-funding/templates/dhs-sbir-outline.md](./federal-funding/templates/dhs-sbir-outline.md)

**Target components:** CISA, TSA, FEMA, Coast Guard, CBP — topics vary by solicitation.

---

### 4. DOE SBIR — energy grid / OT / national labs

**Why:** Funds cybersecurity for energy infrastructure, utilities, operational technology.

| Phase | Amount | Notes |
|-------|--------|-------|
| Phase I | varies by topic | LOI required in PAMS before Grants.gov app |
| Phase II | varies | 16 CISA CPG cybersecurity self-assessment required |

**Process:**

1. Register PAMS: https://pamspublic.science.energy.gov
2. Register Grants.gov + SAM
3. Submit **Letter of Intent** in PAMS when FOA opens
4. Submit full application via Grants.gov
5. Monitor FY 2026 schedule: https://science.osti.gov/sbir/Funding-Opportunities/FY-2026

**Pitch angle:** PQC readiness and cryptographic inventory for energy OT/ICS and grid operators.

---

### SBIR search & monitoring

- **All agencies:** https://www.sbir.gov/sbirsearch/topic/current
- **DoD topics:** https://www.defensesbirsttr.mil/SBIR-STTR/Opportunities/
- **Weekly ritual:** Search keywords `cryptography`, `post-quantum`, `inventory`, `zero trust`, `supply chain`, `OT security`

---

## Tier 2 — NIST NCCoE partnerships

Often more valuable than a $75K grant for federal win rates.

### Migration to Post-Quantum Cryptography project

| Action | URL |
|--------|-----|
| Read project scope | https://www.nccoe.nist.gov/applied-cryptography/migration-to-pqc |
| Join Community of Interest | Webform at bottom of COI page |
| Email alternative | applied-crypto-pqc@nist.gov |

### Why this matters

- NIST SP **1800-38B** focuses on **automated cryptographic discovery tools** and building inventories — Qtangl's core Assess capability
- Industry participants influence reference architectures cited in federal RFPs
- Strengthens every SBIR application ("aligned with NIST NCCoE migration workstreams")
- Access to migration tooling discussions before they become procurement requirements

### Engagement playbook

1. Join COI (Week 1)
2. Review SP 1800-38B draft; map Qtangl capabilities to each discovery method
3. Comment on public drafts when periods open
4. Offer to demonstrate discovery workflow (agentless + host + code) in COI forums
5. Reference participation in all federal proposals

**Policy brief for proposals:** [federal-funding/policy-alignment-brief.md](./federal-funding/policy-alignment-brief.md)

---

## Tier 3 — Direct federal contracts

Where recurring revenue lives after SBIR Phase I/II.

### Target agencies & needs

| Agency | Need | Qtangl fit |
|--------|------|------------|
| **CISA** | FCEB crypto inventory; ACDI tooling; critical infrastructure visibility | Assess + Monitor + CBOM |
| **NSA** | CNSA 2.0 migration; NSS crypto modernization | Framework crosswalk + evidence |
| **DoD** | Enterprise crypto inventory; continuous compliance | Host sensor + Monitor |
| **VA** | Legacy system crypto discovery; migration planning | Large legacy estate = discovery wedge |
| **DHS components** | OT + IT crypto visibility | Full-stack CPM |
| **FAA / DOT** | PQC integration market research → pilots | RFIs now; contracts follow |

### Contract discovery

1. **SAM.gov Contract Opportunities** — saved searches: `post-quantum`, `cryptographic inventory`, `crypto agility`, `ACDI`, `PQC`
2. **RFIs** — respond even without product maturity; shapes requirements (e.g., FAA PQC RFI)
3. **GSA Schedule task orders** — agencies buy through HACS SIN 54151HACS
4. **Prime integrators** — partner with Fed IT contractors who hold existing vehicles

### GSA Highly Adaptive Cybersecurity Services (HACS)

**SIN 54151HACS** — standard vehicle for cybersecurity assessment services.

| Subgroup | Qtangl relevance |
|----------|------------------|
| Risk and Vulnerability Assessments | High — crypto risk assessment |
| High Value Asset Assessments | High — crown-jewel crypto mapping |
| Penetration Testing | Low — not core |
| Incident Response | Low — not core |

**Path:** Obtain GSA MAS Schedule → add HACS SIN → pass oral technical evaluation.

- Program: https://www.gsa.gov/technology/it-contract-vehicles-and-purchasing-programs/multiple-award-schedule-it/highly-adaptive-cybersecurity-services
- Longer timeline (6–12 months) but unlocks recurring task orders

### CISA procurement signal

CISA **Product Categories for PQC-Capable Technologies** (EO 14306) directs agencies to procure PQC-capable products in listed categories. Qtangl is not a crypto algorithm vendor — position as **assessment and inventory tooling** that enables compliance with those procurement mandates.

- https://www.cisa.gov/resources-tools/resources/product-categories-technologies-use-post-quantum-cryptography-standards

---

## Tier 4 — State & regional matching

After federal SBIR Phase I/II award:

1. Search `"[state] SBIR matching grant"`
2. Ask local **APEX Accelerator**
3. Check state innovation / economic development offices
4. University tech transfer offices often maintain match program lists

Typical: **25–50% match** on federal SBIR award amount.

---

## MVP / prototype requirements for funding

Grant reviewers expect more than slides. Minimum viable demo for Phase I:

| Deliverable | Status target | Notes |
|-------------|---------------|-------|
| Agentless scan (live TLS/JWKS) | `pilot` | Fastest demo path — minutes to inventory |
| CBOM export (CycloneDX) | `pilot` | Standard artifact agencies expect |
| Readiness score + Mosca | `pilot` | Risk prioritization |
| Executive dashboard | `pilot` | Board/CISO reporting |
| Architecture diagram | Required | Map to NIST SP 1800-38B discovery methods |
| Federal one-pager | Required | [template](./federal-funding/templates/federal-one-pager.md) |

**Stretch for Phase II credibility:** Host sensor pilot, signed evidence verify link, NSM-10/CNSA 2.0 crosswalk report.

---

## Proposal collateral checklist

| Artifact | Location / action |
|----------|-------------------|
| Federal one-pager | [template](./federal-funding/templates/federal-one-pager.md) |
| Architecture diagram | Create: discovery methods × Qtangl components |
| Executive briefing | [web/public/downloads/q-day-executive-briefing.md](../../web/public/downloads/q-day-executive-briefing.md) |
| Crypto agility checklist | [web/public/downloads/crypto-agility-checklist.md](../../web/public/downloads/crypto-agility-checklist.md) |
| Demo video (5 min) | Record Assess → CBOM → verify flow |
| SOC2 status letter | [12-platform-security-and-trust.md](./12-platform-security-and-trust.md) |
| Competitive positioning | [11-competitive-intelligence.md](./11-competitive-intelligence.md) |
| Gov vertical playbook | [vertical-playbooks/government-defense.md](./vertical-playbooks/government-defense.md) |

---

## 30 / 60 / 90-day roadmap

Full week-by-week detail: [federal-funding/roadmap-30-60-90.md](./federal-funding/roadmap-30-60-90.md)

### Days 1–30

| Week | Actions |
|------|---------|
| 1 | SAM registration · SBA Company Registry · Join NIST PQC COI · APEX Accelerator intro |
| 2 | NSF account · Submit Project Pitch · DSIP registration · DHS portal account |
| 3 | Draft federal one-pager · Architecture diagram · Record demo video |
| 4 | NSF PD outreach (if pitch submitted) · Monitor AFWERX/DHS solicitations · Build discovery prototype gaps |

### Days 31–60

| Actions |
|---------|
| NSF full proposal prep (if invited) |
| AFWERX Open Topic proposal draft |
| DHS topic research (prior-year cybersecurity topics) |
| DOE PAMS + Grants.gov registration |
| Respond to any federal RFIs |

### Days 61–90

| Actions |
|---------|
| Submit NSF full proposal (deadline-dependent) |
| Submit AFWERX when BAA opens |
| Submit DHS when solicitation opens |
| Pilot outreach to federal integrators |
| State match program research |

---

## Funding targets & milestones

| Milestone | Target | Success criteria |
|-----------|--------|------------------|
| **M1** Registrations complete | Week 2–3 | SAM active, SBA ID, DSIP account |
| **M2** NSF Pitch submitted | Week 2 | Confirmation email |
| **M3** NIST COI member | Week 1 | Welcome / list confirmation |
| **M4** First award (Phase I) | Month 4–8 | $75K–$300K obligated |
| **M5** Federal pilot | Month 6–12 | LOA or paid pilot with agency/integrator |
| **M6** Phase II | Month 10–18 | $750K–$2M |
| **M7** STRATFI or contract | Month 18–24 | $3M+ pipeline |

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| SAM registration delays | Start Day 1; use APEX Accelerator |
| SBIR pitch rejected | Iterate pitch; try AFWERX Open Topic in parallel |
| No federal past performance | NIST COI + Phase I + integrator subcontract |
| Competing with primes (IBM, Keyfactor) | Position as fast baseline + evidence layer, not rip-and-replace |
| Export control / ITAR questions | [17-legal-regulatory-and-compliance.md](./17-legal-regulatory-and-compliance.md) |
| "SBIR mill" scrutiny (2027+ caps) | Focus on 1–2 high-fit agencies; quality over volume |

---

## Operating cadence

| Frequency | Action |
|-----------|--------|
| **Weekly** | Check SBIR.gov + SAM opportunities; update [checklist](./federal-funding/checklist-and-tracker.md) |
| **Monthly** | Review funding pipeline in leadership sync |
| **Quarterly** | Refresh federal one-pager + demo; assess GSA HACS path |

---

## Related documents

| Doc | Link |
|-----|------|
| Resource hub | [federal-funding/README.md](./federal-funding/README.md) |
| Checklist & tracker | [federal-funding/checklist-and-tracker.md](./federal-funding/checklist-and-tracker.md) |
| Registration guide | [federal-funding/registration-guide.md](./federal-funding/registration-guide.md) |
| Link directory | [federal-funding/link-directory.md](./federal-funding/link-directory.md) |
| Policy alignment | [federal-funding/policy-alignment-brief.md](./federal-funding/policy-alignment-brief.md) |
| Financial model | [16-financial-model-and-fundraising.md](./16-financial-model-and-fundraising.md) |
| Gov vertical GTM | [vertical-playbooks/government-defense.md](./vertical-playbooks/government-defense.md) |

---

*Last updated: 2026-06-10*
