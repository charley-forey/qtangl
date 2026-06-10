# NSF Project Pitch — Draft Template

**Submit at:** https://seedfund.nsf.gov/project-pitch/  
**Rules:** One pitch at a time; ~1–2 month response; SAM not required for pitch  
**Solicitation (full proposal):** NSF 26-510

Fill in bracketed sections. Keep each section concise — this is a gatekeeper, not the full proposal.

---

## Company information

| Field | Value |
|-------|-------|
| Company legal name | [Qtangl, Inc. / LLC] |
| UEI | [from SAM — optional at pitch stage] |
| PI name | [Name] |
| PI email | [email] |
| PI title | [e.g., CTO & Co-Founder] |
| Company URL | https://qtangl.com |

---

## Section 1 — Technical innovation

**Prompt:** What is the proposed innovation? How is it significantly better than existing solutions?

### Draft

The United States faces a mandated transition to post-quantum cryptography (PQC) by 2035 (NSM-10, NIST IR 8547). Federal agencies and critical infrastructure operators must inventory every use of quantum-vulnerable algorithms (RSA, ECDSA, finite-field DH) across software, hardware, cloud services, and operational technology. CISA's Automated Cryptography Discovery and Inventory (ACDI) strategy explicitly requires tooling to automate this inventory — yet most organizations still rely on manual spreadsheets and expensive consulting engagements that produce point-in-time snapshots.

**[Company name] Qtangl** proposes an AI-assisted **Cryptographic Posture Management (CPM)** platform that continuously discovers cryptographic assets through multiple complementary methods — agentless external scanning (TLS, JWKS, SSH, email STARTTLS), host sensor fleet enrollment (certificate stores, listeners), and source/binary analysis producing **CycloneDX Cryptographic Bill of Materials (CBOM)**. Unlike certificate lifecycle management (CLM) tools that inventory certs without quantum-vulnerability classification, or general attack surface management (ASM) tools that miss crypto-specific risk, Qtangl combines:

1. **Multi-method discovery** aligned with NIST NCCoE SP 1800-38B (no single method is complete)
2. **Quantum-risk scoring** using Mosca's inequality and harvest-now-decrypt-later (HNDL) analysis
3. **Framework crosswalk** to NSM-10, CNSA 2.0, NIST IR 8547, and CMMC evidence requirements
4. **Signed, publicly verifiable evidence** of migration progress — a tamper-evident audit trail

The technical innovation is the **unification of discovery, risk prioritization, and verifiable evidence** in a continuous monitoring platform — not a one-time scan — at a price point accessible to mid-market organizations underserved by incumbents (SandboxAQ, IBM, Keyfactor).

---

## Section 2 — Technical objectives and challenges

**Prompt:** What are the R&D objectives? What technical risks will be addressed?

### Objectives (Phase I)

| # | Objective | Success metric |
|---|-----------|----------------|
| O1 | Extend automated discovery to classify quantum-vulnerable algorithms across external, host, and code surfaces | ≥95% precision on benchmark corpus |
| O2 | Build unified CBOM aggregation pipeline (CycloneDX) from heterogeneous discovery sources | Valid CBOM export from 3+ source types |
| O3 | Develop AI-assisted risk prioritization engine mapping findings to NIST IR 8547 migration tiers | Prioritized backlog correlates with manual expert review |
| O4 | Implement continuous drift detection between scan intervals with signed evidence diff | Detect injected RSA cert within 24h |
| O5 | Validate platform against NIST NCCoE SP 1800-38B functional test scenarios | Pass ≥80% of applicable test cases |

### Technical challenges / risks

| Challenge | Mitigation |
|-----------|------------|
| Discovery completeness (no single method sees full estate) | Layer agentless + host + code per NIST guidance; honest coverage reporting |
| False positives in algorithm classification | Hybrid rules + ML classifier trained on labeled TLS/code corpus |
| Scale (10K+ endpoints) | Distributed scan workers; incremental CBOM diff |
| Evidence integrity | Post-quantum signing + transparency log anchoring |
| OT/appliance blind spots | Partner integration APIs; manual CBOM ingestion |

---

## Section 3 — Market opportunity

**Prompt:** Who is the customer? What is the commercial potential?

### Target customers

| Segment | Pain | Buyer |
|---------|------|-------|
| Federal civilian agencies (FCEB) | M-23-02 annual crypto inventory; ACDI tooling | CISO, ISSO |
| Defense industrial base | CMMC 2.0 crypto evidence; CNSA 2.0 timelines | CISO, compliance officer |
| Critical infrastructure (energy, healthcare, finance) | CISA PQC initiative; board mandates | CISO, VP Engineering |
| Mid-market regulated enterprise (500–10K employees) | 2030–2035 deadlines; HNDL risk | CISO, compliance |

### Market size

- PQC readiness TAM: $5–15B (2026–2035 migration cycle)
- SAM: mid-market organizations underserved by $500K+ incumbent engagements
- Federal SBIR → Phase II → integrator channel → Monitor SaaS ($75K–$150K ACV)

### Commercialization path

1. **Assess** (one-time, $25K–$50K) — wedge entry via Q-Day scan
2. **Monitor** (annual, $75K–$150K) — recurring evidence + drift
3. **Convert** (add-on, $50K–$100K) — migration workflow
4. Federal integrator partnerships for Phase III scale

### Competition

| Competitor | Gap Qtangl fills |
|------------|------------------|
| SandboxAQ / IBM | Enterprise price; slow deployment |
| CLM vendors (DigiCert, Venafi) | Cert inventory without quantum-risk class |
| OSS scanners (CryptoScan) | No workflow, evidence, or monitoring |
| Big 4 consulting | Not continuous; not scalable |

---

## Section 4 — Company and team

**Prompt:** Why is this team well-suited? What relevant experience exists?

### Company

| Field | Detail |
|-------|--------|
| Founded | [Year] |
| Location | [City, State, USA] |
| Employees | [N] |
| Entity type | [C-Corp / LLC] |
| Website | https://qtangl.com |
| Product status | Pilot — live Assess scan, CBOM, Mosca scoring, Monitor beta |

### Team

**[PI Name] — Principal Investigator**
- [Relevant background: security engineering, cryptography, distributed systems]
- [Prior startups, government work, or research]
- Employed [≥20] hrs/week at Qtangl

**[Name] — [Role, e.g., CEO]**
- [Commercialization, federal sales, or domain expertise]

**[Name] — [Role, e.g., Engineering]**
- [Discovery pipeline, cloud infrastructure]

### Advisors / partners (if any)

- [ ] NIST NCCoE PQC Community of Interest member
- [ ] [Federal integrator / design partner LOI]

### Prior funding

| Source | Amount | Year |
|--------|--------|------|
| [Self-funded / pre-seed / none] | | |

---

## Pre-submission checklist

- [ ] Positioning uses "cryptographic visibility" not "quantum computing"
- [ ] Cites CISA ACDI and NIST SP 1800-38B alignment
- [ ] Technical risk is genuine (not pure integration)
- [ ] PI meets NSF employment requirements
- [ ] No classified or export-controlled technical detail without review
- [ ] Proofread all four sections
- [ ] Submit at https://seedfund.nsf.gov/project-pitch/

---

## If invited — full proposal next steps

1. Activate SAM + Research.gov + SBA Company Registry
2. Download NSF 26-510 solicitation
3. Prepare 15-page Project Description
4. Submit by deadline: July 27, Nov 4 2026, or March cycle
5. See [registration-guide.md](../registration-guide.md)

---

*Policy citations: [policy-alignment-brief.md](../policy-alignment-brief.md)*
