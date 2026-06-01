# 23 — Glossary & References

Shared vocabulary for the transformation — PQC terms, product terms, acronyms, and external standards references. Keep terminology consistent across docs, website, sales, and reports.

---

## Product & journey terms

| Term | Definition |
|------|------------|
| **Readiness** | Composite score + band reflecting PQC migration progress for a scope |
| **Exposure** | Count/severity of quantum-vulnerable cryptographic assets |
| **Drift** | Change in cryptographic posture between scans (new/removed/degraded assets) |
| **Evidence** | Signed report + verify link + CBOM that auditors can rely on |
| **Assess** | Tier 1: one-session baseline (scan → report → CBOM) |
| **Monitor** | Tier 2: scheduled re-scans + drift + alerts (recurring) |
| **Convert** | Tier 3: managed remediation + verification (sticky, high-value) |
| **Evidence layer** | Cross-cutting signing/verify/audit capability |
| **Crypto-agility** | Ability to swap cryptographic algorithms without breaking systems |
| **Readiness Index** | Future anonymized industry benchmark data product ([21](./21-data-and-threat-intelligence.md)) |
| **System of record** | The authoritative store of migration state + proof — what Qtangl is |

---

## PQC & cryptography terms

| Term | Definition |
|------|------------|
| **PQC** | Post-Quantum Cryptography — algorithms secure against quantum attack |
| **Q-Day** | The point a cryptographically relevant quantum computer can break current crypto |
| **CRQC** | Cryptographically Relevant Quantum Computer |
| **HNDL** | Harvest Now, Decrypt Later — adversaries store ciphertext today to decrypt post-Q-Day |
| **Mosca inequality** | X + Y > Z: if data shelf-life (X) + migration time (Y) exceeds time to Q-Day (Z), you're already exposed |
| **CBOM** | Cryptography Bill of Materials (CycloneDX) — inventory of crypto assets |
| **ML-KEM** | Module-Lattice Key-Encapsulation Mechanism (FIPS 203; formerly Kyber) |
| **ML-DSA** | Module-Lattice Digital Signature Algorithm (FIPS 204; formerly Dilithium) |
| **SLH-DSA** | Stateless Hash-Based Digital Signature Algorithm (FIPS 205; SPHINCS+) |
| **Hybrid KEX** | Key exchange combining classical + PQC (e.g. X25519MLKEM768) |
| **Shor's algorithm** | Quantum algorithm breaking RSA/ECC |
| **Grover's algorithm** | Quantum search; weakens symmetric crypto (mitigated by larger keys) |
| **JWKS** | JSON Web Key Set — signing keys for tokens/OIDC |
| **STARTTLS** | Opportunistic TLS upgrade for SMTP/IMAP |
| **CT** | Certificate Transparency — logs used to enumerate subdomains/certs |
| **SSRF** | Server-Side Request Forgery — scanner abuse risk we guard against |

---

## Standards & frameworks

| Ref | Name | Relevance | Link |
|-----|------|-----------|------|
| FIPS 203 | ML-KEM standard | KEM migration target | nist.gov |
| FIPS 204 | ML-DSA standard | Signature migration target | nist.gov |
| FIPS 205 | SLH-DSA standard | Hash-based signatures | nist.gov |
| NIST IR 8547 | Transition to PQC standards | Deadlines/guidance | nist.gov |
| SP 800-208 | Stateful hash signatures | Firmware/code signing | nist.gov |
| CNSA 2.0 | Commercial National Security Algorithm Suite | Gov timelines | nsa.gov |
| NSM-10 | National Security Memorandum on PQC | Federal mandate | whitehouse.gov |
| CMMC 2.0 | Cybersecurity Maturity Model Certification | Defense base crypto inventory | dod.gov |
| PCI-DSS 4.0 | Payment card crypto requirements | Banking/payments | pcisecuritystandards.org |
| HIPAA | Health data crypto controls | Healthcare (+ BAA) | hhs.gov |
| EU CRA | Cyber Resilience Act | EU product crypto | europa.eu |

Mappings implemented in [standards.py](../../backend/app/pqc/standards.py); metadata in [standards.json](../../demos/pqc_migration/data/standards.json).

---

## Business & SaaS terms

| Term | Definition |
|------|------------|
| **ACV** | Annual Contract Value |
| **ARR** | Annual Recurring Revenue |
| **CAC** | Customer Acquisition Cost |
| **LTV** | Lifetime Value |
| **NRR / GRR** | Net / Gross Revenue Retention |
| **TTFV** | Time To First Value |
| **ICP** | Ideal Customer Profile |
| **MoSCoW** | Must/Should/Could/Won't prioritization |
| **QBR** | Quarterly Business Review |
| **MSSP** | Managed Security Service Provider |
| **MSA / SOW / DPA / BAA** | Master Services Agreement / Statement of Work / Data Processing Agreement / Business Associate Agreement |
| **EAR** | Export Administration Regulations (crypto export control) |

---

## Internal vocabulary

| Term | Meaning |
|------|---------|
| **Track K** | The readiness transformation initiative (this folder) |
| **Optimization (secondary)** | Hybrid optimizer product, now expansion-only |
| **Fixture mode** | Deterministic demo using cached data; no live scan |
| **Live scan** | Authorized scan of real customer endpoints |
| **Dogfooding** | "Qtangl scans Qtangl" — self-applied product ([12](./12-platform-security-and-trust.md)) |
| **The wedge** | Assessment as the land motion into recurring Monitor |
| **Honesty gate** | No quantum-win claims without benchmark evidence |

---

## Canonical phrases

| Phrase | Use |
|--------|-----|
| "Assess. Monitor. Convert." | Primary tagline |
| "Readiness with evidence your auditors can verify." | Subhead |
| "Quantum is the threat, not the engine." | PQC honesty framing |
| "Inventory aid, not a formal audit." | Liability/honesty note |
| "Both sides of Q-Day" | Optimization expansion bundle (secondary, late-stage) |

---

## Cross-reference map

| Topic | Primary doc |
|-------|-------------|
| Why pivot | [00-transformation-thesis.md](./00-transformation-thesis.md) |
| Messaging | [01-positioning-and-brand.md](./01-positioning-and-brand.md) |
| Journey | [02-customer-journey.md](./02-customer-journey.md) |
| Architecture | [03-solution-architecture.md](./03-solution-architecture.md) |
| Website | [04-website-transformation.md](./04-website-transformation.md) |
| Content/SEO | [05-content-and-seo.md](./05-content-and-seo.md) |
| GTM/pricing | [06-gtm-and-pricing.md](./06-gtm-and-pricing.md) |
| Scaling | [07-scaling.md](./07-scaling.md) |
| Execution | [08-execution-plan.md](./08-execution-plan.md) |
| Epics | [09-epics-and-backlog.md](./09-epics-and-backlog.md) |
| Metrics/risks | [10-metrics-and-risks.md](./10-metrics-and-risks.md) |
| Competition | [11-competitive-intelligence.md](./11-competitive-intelligence.md) |
| Security/trust | [12-platform-security-and-trust.md](./12-platform-security-and-trust.md) |
| PRDs | [13-product-requirements.md](./13-product-requirements.md) |
| Customer success | [14-customer-success-and-retention.md](./14-customer-success-and-retention.md) |
| Partnerships | [15-partnerships-and-ecosystem.md](./15-partnerships-and-ecosystem.md) |
| Financial | [16-financial-model-and-fundraising.md](./16-financial-model-and-fundraising.md) |
| Legal | [17-legal-regulatory-and-compliance.md](./17-legal-regulatory-and-compliance.md) |
| Org/hiring | [18-organization-and-hiring.md](./18-organization-and-hiring.md) |
| Eng ops | [19-engineering-operating-model.md](./19-engineering-operating-model.md) |
| Brand/design | [20-brand-identity-and-design-system.md](./20-brand-identity-and-design-system.md) |
| Data/threat-intel | [21-data-and-threat-intelligence.md](./21-data-and-threat-intelligence.md) |
| Governance | [22-governance-and-operating-cadence.md](./22-governance-and-operating-cadence.md) |

---

*Maintain this glossary as terms evolve. New acronyms used in any doc should be added here.*
