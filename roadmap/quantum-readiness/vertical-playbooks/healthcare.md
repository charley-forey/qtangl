# Vertical Playbook — Healthcare Payers & Providers

Go-to-market playbook for health insurers, payers, and large provider systems. Scenario pack: `healthcare-insurer-hndl`.

---

## Why this vertical

| Factor | Detail |
|--------|--------|
| Urgency | Extremely long data shelf-life (lifetime health records) → highest HNDL exposure |
| Regulation | HIPAA crypto controls; EU CRA for med-tech |
| Pain | Sprawling crypto across portals, APIs, EDI, email; no inventory |
| Sensitivity | PHI confidentiality obligations |

---

## Buyer map

| Role | Care about |
|------|------------|
| CISO | HIPAA posture, breach risk, board reporting |
| Privacy / compliance officer | HIPAA, audit evidence |
| VP Engineering | Migration across portals, integrations, EDI |
| CMO/CMIO (influence) | Patient trust, data protection |

---

## Frameworks & drivers

| Framework | Relevance |
|-----------|-----------|
| HIPAA Security Rule | Encryption/crypto controls |
| NIST IR 8547 | PQC transition guidance |
| EU CRA | Connected med-tech (if applicable) |
| HITRUST (adjacent) | Common assurance buyers hold |

Scenario fixture: [scenarios/healthcare-insurer-hndl.json](../../../demos/pqc_migration/data/scenarios/healthcare-insurer-hndl.json) · pack frameworks: HIPAA, NIST IR 8547, EU CRA.

---

## HNDL is the headline here

Health records have **decades** of shelf-life. Mosca inequality (X+Y > Z) almost always holds → data encrypted today is exposed to harvest-now-decrypt-later. This is the most visceral urgency argument of any vertical.

---

## Discovery questions

- "How long must you protect patient data?" (drives HNDL math)
- "Where does PHI traverse TLS — portals, APIs, EDI, email?"
- "How do you evidence crypto controls for HIPAA audits today?"
- "Any EU footprint (CRA) for connected devices?"

---

## Value framing

| Pain | Qtangl value |
|------|--------------|
| Long-lived PHI + HNDL | Mosca timeline makes exposure undeniable |
| HIPAA crypto evidence | Framework-mapped, signed reports |
| Sprawling endpoints | Full scan + cloud inventory import |
| Audit cycles | Monitor drift + reusable evidence |

---

## Important data boundary

**PQC scans are TLS/crypto inventory only — no PHI is processed.** This keeps PQC engagements out of BAA scope. (BAA applies only to the separate optimization/hospital workloads that touch PHI — [17-legal-regulatory-and-compliance.md](../17-legal-regulatory-and-compliance.md).) State this clearly to reduce procurement friction.

---

## Demo emphasis

1. `healthcare-insurer-hndl` scenario scan
2. HNDL/Mosca on decades-long data shelf-life
3. HIPAA control mapping
4. Drift + cert-expiry alerts
5. Signed evidence for audit; "no PHI in scan" reassurance

---

## Objections (vertical-specific)

| Objection | Response |
|-----------|----------|
| "Do you touch PHI?" | No — PQC scan is crypto inventory only; no PHI processed. No BAA needed for readiness. |
| "We're focused on ransomware, not quantum." | HNDL is a confidentiality time-bomb for lifetime records; complements, not competes with, current priorities. |
| "Our EHR vendor manages security." | You still own inventory + evidence across portals, APIs, EDI, and email. |

---

## Channel

- H-ISAC engagement for credibility ([15-partnerships-and-ecosystem.md](../15-partnerships-and-ecosystem.md))
- Healthcare-focused MSSPs for Convert delivery

---

## Related

- Journey/personas: [02-customer-journey.md](../02-customer-journey.md)
- Legal/BAA boundary: [17-legal-regulatory-and-compliance.md](../17-legal-regulatory-and-compliance.md)
- Solutions page spec: [04-website-transformation.md](../04-website-transformation.md) (`/solutions/healthcare`)
