# Federal One-Pager — Template

Export to PDF for agency intros, NIST COI, integrator partners, and SBIR supporting material.

**Design:** Single page, scannable, minimal jargon. Use Qtangl brand fonts/colors when exporting.

---

## [HEADER]

**Qtangl** · Cryptographic Posture Management (CPM)  
**Tagline:** Assess. Monitor. Convert.  
**URL:** https://qtangl.com/assess  
**Contact:** Charley · charley@qtangl.com · [phone TBD]  
**UEI:** [pending SAM registration] · **CAGE:** [pending SAM registration]

---

## The problem (2–3 sentences)

Federal agencies and critical infrastructure operators must migrate from quantum-vulnerable cryptography (RSA, ECDSA) to post-quantum standards by **2035** (NSM-10, NIST IR 8547). CISA's **Automated Cryptography Discovery and Inventory (ACDI)** strategy requires tooling to find and catalog every use of legacy algorithms — yet most organizations still rely on spreadsheets and one-time consulting engagements that are outdated within weeks.

---

## Our solution (2–3 sentences)

**Qtangl** is an AI-assisted **Cryptographic Posture Management (CPM)** platform that continuously discovers cryptographic assets across external services, hosts, and software supply chains — producing a **CycloneDX Cryptographic Bill of Materials (CBOM)**, quantum-risk scores, migration roadmaps, and **signed, publicly verifiable evidence** of remediation progress.

---

## Capabilities at a glance

| Capability | What it does |
|------------|--------------|
| **Discover** | Agentless TLS/JWKS/SSH scan + host sensor fleet + code/binary CBOM |
| **Assess** | Mosca HNDL scoring; NSM-10 / CNSA 2.0 / NIST IR 8547 crosswalk |
| **Monitor** | Scheduled re-scans; drift alerts; SIEM webhook integration |
| **Prove** | Post-quantum signed reports; public `/verify` link for auditors |

---

## Policy alignment

| Standard / initiative | Qtangl support |
|-----------------------|----------------|
| NSM-10 | Crypto inventory + migration planning |
| NIST IR 8547 | Risk-tier prioritization; 2035 roadmap |
| CISA ACDI strategy | Automated discovery + inventory tooling |
| CNSA 2.0 | Algorithm deadline mapping + remediation guidance |
| CMMC 2.0 | Crypto evidence for DIB assessments |
| OMB M-23-02 | Annual inventory automation |

---

## Why Qtangl (differentiation)

| vs. | Qtangl advantage |
|-----|------------------|
| Big 4 consulting | Continuous, not point-in-time; fraction of cost |
| CLM vendors | Quantum-vulnerability class, not just cert inventory |
| Enterprise PQC suites ($500K+) | Mid-market speed; baseline in minutes |
| OSS scanners | Workflow, monitoring, signed evidence |

---

## Traction / status

| Item | Status |
|------|--------|
| Product | Pilot — live Assess, CBOM, Monitor beta |
| Discovery | Agentless + host sensor + code/binary |
| Evidence | Signed reports + public verify · https://www.qtangl.com/verify |
| Self-scan proof | Live dogfood: `GET https://api.qtangl.com/pqc/dogfood/latest` → public verify link |
| NIST engagement | PQC Community of Interest member [when joined] |
| Pilots | [Customer / design partner if any] |

---

## Engagement models

| Model | Description |
|-------|-------------|
| **Q-Day Assessment** | One-time cryptographic posture scan + executive report |
| **Monitor subscription** | Continuous discovery, drift detection, audit evidence |
| **SBIR / pilot** | 3–6 month feasibility or prototype contract |
| **Integrator OEM** | Evidence layer paired with host/code discovery vendors |

---

## Phase I SBIR fit (optional footer for grant packages)

Qtangl proposes a 3–6 month feasibility study to deploy cryptographic discovery and PQC readiness monitoring on [agency/network] infrastructure, delivering CBOM inventory, prioritized migration roadmap, and continuous drift detection — directly supporting CISA ACDI and NIST NCCoE migration workstreams.

---

## Call to action

**Schedule a 15-minute Q-Day scan demo:** [calendar link]  
**Technical contact:** [PI name, email]  
**Downloads:** Crypto Agility Checklist · Executive Briefing — https://qtangl.com

---

## Export checklist

- [ ] Fits on one page (PDF)
- [ ] No "FedRAMP authorized" or "CMMC certified" claims
- [ ] UEI/CAGE included if SAM active
- [ ] Contact info current
- [ ] Reviewed against [policy-alignment-brief.md](../policy-alignment-brief.md)

---

*Source collateral: [q-day-executive-briefing.md](../../../../web/public/downloads/q-day-executive-briefing.md) · [crypto-agility-checklist.md](../../../../web/public/downloads/crypto-agility-checklist.md)*
