# Vertical Playbook — Banking & Financial Services

Go-to-market playbook for regional banks, insurers, and payment processors. Scenario pack: `bank-tls-inventory`.

---

## Why this vertical

| Factor | Detail |
|--------|--------|
| Urgency | Board/regulator attention on quantum risk; PCI-DSS 4.0 crypto agility |
| Budget | $5–25M PQC program budgets at mid-size banks |
| Pain | No central crypto inventory across TLS, JWKS, SSH, email |
| Data sensitivity | Long shelf-life financial data → high HNDL exposure |

---

## Buyer map

| Role | Care about |
|------|------------|
| CISO | Board reporting, regulator posture, exposure |
| Compliance / risk | PCI-DSS 4.0, NIST CSF, exam readiness |
| VP Engineering | Migration execution across core banking + APIs |
| CRO / board | Systemic risk, contract/regulatory exposure |

---

## Frameworks & drivers

| Framework | Relevance |
|-----------|-----------|
| PCI-DSS 4.0 | Crypto agility + inventory expectations |
| NIST CSF | Risk governance |
| NIST IR 8547 / CNSA 2.0 | Migration timelines |
| FFIEC / regulator guidance | Exam expectations on emerging risk |
| NSM-10 (if gov-adjacent) | Federal alignment |

Scenario fixture: [scenarios/bank-tls-inventory.json](../../../demos/pqc_migration/data/scenarios/bank-tls-inventory.json) · pack frameworks: NSM-10, PCI-DSS 4.0, NIST CSF ([outreach/README.md](../../../demos/pqc_migration/outreach/README.md)).

---

## Discovery questions

- "How do you inventory cryptography across core banking, customer APIs, and email today?"
- "What does your PCI assessor expect for crypto agility?"
- "What's the data shelf-life of the most sensitive data you transmit?" (HNDL)
- "Who owns the PQC migration program?"

---

## Value framing

| Pain | Qtangl value |
|------|--------------|
| Spreadsheet inventory misses keys | Full scan: TLS, JWKS, SSH, email STARTTLS |
| HNDL on long-lived financial data | Mosca timeline quantifies exposure |
| PCI/exam evidence | Framework-mapped, signed reports + `/verify` |
| Ongoing posture | Monitor drift + cert-expiry alerts |

---

## Demo emphasis

1. `bank-tls-inventory` scenario scan
2. Mosca HNDL on financial data shelf-life
3. PCI-DSS 4.0 mapping in compliance pack
4. Drift demo (cert expiry, new endpoint)
5. Signed PDF → `/verify` for assessor

---

## Objections (vertical-specific)

| Objection | Response |
|-----------|----------|
| "Our assessor hasn't asked about quantum yet." | PCI-DSS 4.0 emphasizes crypto agility now; get ahead of the exam with evidence |
| "Core banking vendor handles crypto." | You still own inventory + evidence across APIs, email, and third parties |
| "Heavy change control." | Convert tier tracks phased rollout with rollback; we verify, you control timing |

---

## Proof & references

- Sample CBOM ([sample-cbom-bank-tls-inventory.json](../../../demos/pqc_migration/data/sample-cbom-bank-tls-inventory.json))
- ISAC credibility: FS-ISAC engagement ([15-partnerships-and-ecosystem.md](../15-partnerships-and-ecosystem.md))

---

## Related

- GTM: [06-gtm-and-pricing.md](../06-gtm-and-pricing.md)
- Battlecards: [../sales-enablement/battlecards.md](../sales-enablement/battlecards.md)
- Solutions page spec: [04-website-transformation.md](../04-website-transformation.md) (`/solutions/banking`)
