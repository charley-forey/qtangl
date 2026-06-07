# 17 — Legal, Regulatory & Compliance

Contracts, IP, export controls, insurance, corporate basics, and the regulatory landscape that shapes how we sell a cryptography product. **Not legal advice** — a roadmap of what to put in front of counsel.

---

## Why this matters for a crypto product

Selling cryptographic assessment touches areas most SaaS startups ignore:

- **Export controls** — cryptography is regulated (US EAR Category 5 Part 2); even a scanner that handles crypto needs review.
- **Liability framing** — we must not be construed as providing a formal security attestation or guaranteeing breach prevention.
- **Regulated buyers** — banks, gov contractors, healthcare bring DPAs, BAAs, and procurement rigor.

Engage qualified counsel early; this doc structures the asks.

---

## Contract stack

| Document | Purpose | When needed | Status |
|----------|---------|-------------|--------|
| **MSA** (Master Services Agreement) | Master terms for all engagements | Before first paid deal | Needed |
| **SOW** (Assessment) | Scope a 90-day assessment | Per assessment | Have template ([pqc-pilot-sow.md](../optimization_OLD_FUTURE/templates/pqc-pilot-sow.md)) |
| **Order form / subscription** | Monitor/Convert/Enterprise terms | Per subscription | Needed |
| **DPA** (Data Processing Agreement) | GDPR/CCPA processing terms | Before EU/CA data | Needed |
| **BAA** (Business Associate Agreement) | HIPAA (optimization PHI only) | Before PHI | Needed |
| **Order: partner/reseller agreement** | MSSP rev-share, deal reg | Before channel | Needed ([15-partnerships-and-ecosystem.md](./15-partnerships-and-ecosystem.md)) |
| **MNDA** | Mutual NDA for evaluations | Pre-eval | Needed |
| **Terms of Service + Privacy Policy** | Self-serve / website | Before self-serve signup | Needed (Track H) |

### Key MSA clauses to get right

| Clause | Position |
|--------|----------|
| Limitation of liability | Cap at fees paid (e.g. 12 months); carve-outs per negotiation |
| Disclaimer | "Inventory aid, not formal audit/attestation; no guarantee against breach" — mirror [report.py honesty_notes](../../backend/app/pqc/report.py) |
| Scanning authorization | Customer warrants authority to authorize scans of listed targets |
| Data handling | Retention, deletion, sub-processors ([12-platform-security-and-trust.md](./12-platform-security-and-trust.md)) |
| IP ownership | Customer owns their data; Qtangl owns platform + aggregate/anonymized insights |
| Breach notification | Timelines aligned to DPA + regulation |
| Indemnification | Mutual, scoped |

---

## Scanning authorization & "authorized use"

Active scanning has legal sensitivity (anti-hacking statutes like US CFAA). Controls:

| Control | Implementation |
|---------|----------------|
| Explicit target authorization | Customer lists/approves domains in SOW + in-product toggle |
| Warranty of authority | MSA clause: customer has right to authorize |
| SSRF + scope guards | [safety.py](../../backend/app/pqc/safety.py) prevents out-of-scope targets |
| Audit log | Record who authorized which scan when |
| Live-scan gate | `QTANGL_PQC_ENABLE_LIVE_SCAN` + per-tenant authorization |

**Rule:** No live scan without recorded authorization. Fixture/demo mode needs none.

---

## Export controls (cryptography)

Cryptography is export-controlled; a US-based crypto tooling vendor should assess:

| Item | Consideration |
|------|---------------|
| Classification | Likely EAR Category 5 Part 2; software that uses/handles crypto |
| Self-classification / CCATS | Determine ECCN; consider self-classification report to BIS |
| Open-source exception | Publicly available crypto (e.g. OQS) has carve-outs |
| Sanctioned destinations | Screen customers; no sales to embargoed jurisdictions |
| Cloud distribution | Marketplace listings inherit export obligations |

**Action:** Engage export-control counsel before international sales or marketplace listing. Document classification in data room.

---

## Intellectual property

| Asset | Strategy |
|-------|----------|
| Readiness scoring + Mosca implementation | Trade secret; document internally |
| Repair-window method (optimization) | Provisional patent candidate (per [10-track-F](../optimization_OLD_FUTURE/10-track-F-business-ops.md) F3) |
| Brand "Qtangl", logos, "Assess. Monitor. Convert." | Trademark search + filing |
| CBOM profile `qtangl-cbom-v1` | Open spec for adoption; brand the profile |
| Code | Proprietary backend; consider MIT SDK ([09-track-E](../optimization_OLD_FUTURE/09-track-E-gtm.md)) |
| Contributions to OQS | Contributor license compliance |

- All employees/contractors sign IP assignment + confidentiality (PIIA).
- Open-source license compliance review (liboqs, qiskit, deps) — SBOM for our own code.

---

## Corporate basics

| Item | Status | Action |
|------|--------|--------|
| Delaware C-Corp | Confirm | Incorporate if not done; standard for venture |
| Cap table | Maintain | Use Carta/Pulley; clean for diligence |
| Founder vesting + 83(b) | Confirm | Standard 4-yr/1-yr cliff |
| Board + consents | Maintain | Document decisions |
| EIN, bank, accounting | Confirm | Bookkeeping from day one |
| Stock option plan | Before first hire equity | 409A valuation |

---

## Insurance

| Policy | Why | When |
|--------|-----|------|
| General liability | Baseline | Early |
| **E&O / Tech E&O** | Professional services + product errors | Before first $100K contract |
| **Cyber liability** | We hold security data; breach exposure | Before regulated pilots |
| D&O | Protect directors; investor expectation | At/after seed |
| Employment practices | With first hires | At hiring |

Enterprise customers often require minimum coverage limits — confirm before signing.

---

## Regulatory landscape we map to (what we help customers satisfy)

| Framework | Region | Relevance |
|-----------|--------|-----------|
| NIST FIPS 203/204/205 | US/global | The PQC standards we map remediation to |
| NIST IR 8547 | US | Transition guidance; deadline references |
| NSM-10 | US federal | Migration mandate |
| CNSA 2.0 | US national security | Algorithm suite + timelines |
| CMMC 2.0 | US defense base | Crypto inventory for contractors |
| PCI-DSS 4.0 | Global (payments) | Crypto agility/inventory expectations |
| HIPAA | US healthcare | Crypto controls (+ BAA for PHI) |
| EU CRA | EU | Product crypto requirements |
| GDPR / CCPA | EU / CA | Our data processing (DPA) |

**Distinction to maintain everywhere:** What Qtangl *is certified for* (SOC 2 — our posture) vs what Qtangl *helps customers satisfy* (their crypto compliance). Never blur these ([12-platform-security-and-trust.md](./12-platform-security-and-trust.md)).

---

## Compliance gate (before regulated pilot)

- [ ] MSA + SOW executed
- [ ] DPA signed (if EU/CA data)
- [ ] BAA signed (only if PHI — optimization)
- [ ] Scanning authorization recorded
- [ ] Cyber + E&O insurance active
- [ ] Sub-processor list disclosed
- [ ] Security questionnaire returned

---

## Acceptance criteria (Track K legal workstream)

- [ ] MSA, order form, DPA, MNDA templates counsel-reviewed
- [ ] Export-control classification documented
- [ ] Trademark filed for brand + tagline
- [ ] ToS + Privacy Policy published before self-serve
- [ ] IP assignments signed by all contributors
- [ ] Insurance bound before first enterprise contract

---

## Related docs

- Security/trust: [12-platform-security-and-trust.md](./12-platform-security-and-trust.md)
- Legal basics (original): [10-track-F-business-ops.md](../optimization_OLD_FUTURE/10-track-F-business-ops.md)
- Data retention: [data-retention-policy.md](../optimization_OLD_FUTURE/security/data-retention-policy.md)
- **Evidence log retention (K16):** The append-only `evidence_log` table stores SHA-256 content hashes and signing metadata only — no scan targets, PEMs, or roster fields. It is **exempt from tenant deletion requests** and retained indefinitely as an integrity artifact. Customer-facing DPA addendum: "Qtangl may retain cryptographic fingerprints of signed reports to support third-party verification."

---

## Tier-4 credibility (non-eng)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| PKI Consortium PQCCM vendor listing | Founder/GTM | `not-started` | Submit at pqc-tools.org when log MVP ships |
| NIST NCCoE Migration-to-PQC participation | Founder | `not-started` | Express interest; contribute verify spec + CBOM samples |
- Pilot SOW: [pqc-pilot-sow.md](../optimization_OLD_FUTURE/templates/pqc-pilot-sow.md)
