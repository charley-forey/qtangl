# PQC assessment pilot — statement of work (template)

Copy and customize per design partner. Aligns with Track B6 and pricing in [17-financial-model.md](../17-financial-model.md).

---

## Parties

| | |
|--|--|
| **Provider** | Qtangl, Inc. |
| **Customer** | `[Legal entity name]` |
| **Effective date** | `[YYYY-MM-DD]` |
| **Term** | 90 days (assessment) |

---

## Scope

Qtangl will deliver a **Q-Day readiness assessment** for Customer's in-scope cryptographic assets:

| Item | Detail |
|------|--------|
| **Scenario pack** | `[bank-tls-inventory \| gov-contractor-cmmc \| healthcare-insurer-hndl]` |
| **Targets** | `[domain(s) or PEM bundle upload]` |
| **Scan mode** | Fixture rehearsal + authorized live scan |
| **Deliverables** | PDF compliance report, CycloneDX CBOM, Mosca HNDL assessment, PQ TLS handshake proof appendix |

Out of scope: penetration testing, code review, HSM inventory, formal CMMC/HIPAA attestation.

---

## Deliverables & timeline

| Week | Milestone | Acceptance |
|------|-----------|------------|
| 0 | Kickoff + target authorization | Customer approves scan list |
| 1 | Baseline scan complete | CBOM + PDF delivered |
| 2 | Remediation workshop | Customer identifies ≥1 net-new critical item |
| 4 | Executive readout + case study opt-in | Quote for marketing (optional) |

---

## Customer responsibilities

- Designate technical and compliance contacts
- Provide domain authorization or PEM bundles
- Approve live scanning (`QTANGL_PQC_ENABLE_LIVE_SCAN` window)
- Review findings within 5 business days of delivery

---

## Fees

| Tier | Fee | Notes |
|------|-----|-------|
| **Assessment (this SOW)** | `$[25,000–50,000]` one-time | Single assessment |
| **Monitor (optional extension)** | `$[75,000–150,000]/yr` | Scheduled re-scans + diff alerts |

Payment: 50% on signature, 50% on delivery of final report.

---

## Data handling

- Scan artifacts retained **12 months** unless otherwise agreed
- Uploaded PEM bundles deleted within **24 hours** of processing
- No PHI in optimization demos; PQC scans are TLS/crypto inventory only
- See [roadmap/security/threat-model.md](../security/threat-model.md)

---

## Success criteria (pilot)

- [ ] Customer runs live or authorized scan on their domain
- [ ] Receives CBOM + PDF within one working session
- [ ] Identifies ≥1 critical remediation item not in prior inventory
- [ ] Customer willing to provide quote for case study within 90 days (optional)

---

## Signatures

**Qtangl, Inc.**

Name: _________________________  
Title: _________________________  
Date: _________________________

**Customer**

Name: _________________________  
Title: _________________________  
Date: _________________________
