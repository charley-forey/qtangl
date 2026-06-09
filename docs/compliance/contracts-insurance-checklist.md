# Contracts & insurance checklist

**Gate:** Before first **$100K+** contract or regulated-data pilot (hospital PHI, gov CMMC).  
**Legal templates:** [docs/legal/](../legal/)

---

## 1. Contract templates (counsel review required)

| Template | Outline | Use case | Status |
|----------|---------|----------|--------|
| MSA | [MSA-outline.md](../legal/MSA-outline.md) | Enterprise Monitor / Convert / Enterprise tiers | [ ] Counsel approved |
| DPA | [DPA-outline.md](../legal/DPA-outline.md) | GDPR / UK GDPR customers | [ ] Counsel approved |
| MNDA | [MNDA-outline.md](../legal/MNDA-outline.md) | Pilot discovery, partnerships | [ ] Counsel approved |
| BAA | (draft before hospital PHI) | HIPAA-covered entity pilots | [ ] Not started |
| Pilot SOW | [roadmap/templates/pqc-pilot-sow.md](../../roadmap/optimization_OLD_FUTURE/templates/pqc-pilot-sow.md) | Paid PQC pilots | [ ] In use |
| Order Form | Attach to MSA | SKU, tier, term, fees | [ ] Template needed |

### Per-deal checklist

- [ ] Entity names and addresses verified
- [ ] Tier and scan limits match Order Form
- [ ] Evidence retention months specified
- [ ] Sub-processor exhibit references `/trust/subprocessors`
- [ ] Liability cap and indemnity reviewed for vertical risk
- [ ] Export control (EAR) classification noted if gov/defense ([K12-002](../../roadmap/quantum-readiness/09-epics-and-backlog.md))

---

## 2. Insurance

| Coverage | Minimum (guidance) | Broker quote | Bound |
|----------|-------------------|--------------|-------|
| **E&O / professional liability** | $1M per claim | | [ ] |
| **Cyber liability** | $1M per claim; includes breach response | | [ ] |
| **General liability** | $1M | | [ ] |
| **D&O** (if board formed) | $1M | | [ ] |

### Evidence for enterprise questionnaires

- [ ] Certificate of insurance (COI) PDF ready for customers
- [ ] Carrier AM Best rating documented
- [ ] Policy covers SaaS / technology E&O
- [ ] Cyber policy covers ransomware and regulatory fines where available

---

## 3. Corporate basics

- [ ] Delaware C-Corp (or equivalent) status confirmed
- [ ] Cap table and charter current in data room
- [ ] Trademark application filed ([K12-003](../../roadmap/quantum-readiness/09-epics-and-backlog.md))
- [ ] Standard signature authority for Order Forms

---

## 4. Partner & channel agreements

- [ ] MSSP rev-share SOW template ([partnerships.md](../../demos/pqc_migration/partnerships.md))
- [ ] Auditor referral terms (no fee for verify-only referrals)
- [ ] Marketplace listing agreements deferred until post-SOC2 ([15-partnerships](../../roadmap/quantum-readiness/15-partnerships-and-ecosystem.md))

---

## 5. Filing & storage

- [ ] Executed contracts stored: `[customer]/contracts/` (encrypted drive)
- [ ] CRM links to MSA version and Order Form effective date
- [ ] Renewal calendar 90/60/30 days ([14-customer-success](../../roadmap/quantum-readiness/14-customer-success-and-retention.md))

---

## 6. Sign-off

| Milestone | Owner | Date |
|-----------|-------|------|
| MSA + DPA counsel-approved | | |
| E&O + cyber bound | | |
| First enterprise Order Form signed | | |

---

*Checklist version: 2026-06-08 — Track F5 / K12*
