# Pilot Playbook Template

Checklist for demo → pilot → production conversion. Copy per customer/vertical.

---

## Pilot header

| Field | Value |
|-------|-------|
| **Customer** | |
| **Vertical** | PQC / Hospital / Airline / EV Fleet |
| **Stage** | Demo / Pilot / Production |
| **Start date** | |
| **End date** | |
| **ACV** | |
| **Owner (Qtangl)** | |
| **Owner (Customer)** | |

---

## Pre-pilot gate (Track G)

- [ ] G1 secrets hygiene complete
- [ ] G2 threat model reviewed for this vertical
- [ ] DPA / BAA signed (if PHI or regulated data)
- [ ] Dedicated tenant API key issued (not demo key)
- [ ] Data classification documented (public / confidential / PHI)
- [ ] Retention period agreed (default: scan 1yr, uploads 24h)

---

## PQC pilot checklist

### Week 0 — Kickoff

- [ ] Domain(s) or PEM bundle received
- [ ] Live scan authorized (`QTANGL_PQC_ENABLE_LIVE_SCAN` + customer approval)
- [ ] Baseline scan completed
- [ ] CBOM + PDF delivered to customer
- [ ] Handshake proof demo completed
- [ ] Remediation backlog reviewed with customer

### Week 2 — Mid-pilot

- [ ] Customer assigned owners to ≥3 backlog items
- [ ] ≥1 net-new critical finding confirmed (success metric)
- [ ] Optional: uploaded internal cert bundle scanned

### Week 4–8 — Close

- [ ] Re-scan or diff review scheduled
- [ ] Pilot retrospective survey sent
- [ ] Production SOW drafted (Monitor tier)
- [ ] Case study permission requested

### Pilot success criteria

- [ ] Live scan on customer domain completed
- [ ] ≥1 critical finding customer didn't know about
- [ ] Customer assigns remediation owner to ≥3 items
- [ ] Willing to provide quote within 90 days

---

## Hospital pilot checklist

### Week 0 — Kickoff

- [ ] Roster format agreed (CSV template or integration)
- [ ] De-identified roster OR BAA signed for PHI
- [ ] 3 call-out scenarios identified with customer
- [ ] Nurse manager trained on demo UI / API

### Week 2–8 — Active pilot

- [ ] ≥10 real call-out solves completed
- [ ] Audit packs downloaded for ≥3 swaps
- [ ] Scoreboard reviewed with charge nurse
- [ ] OT/agency cost delta tracked (customer-reported)

### Pilot success criteria

- [ ] ≥10 real call-out solves in 60 days
- [ ] Audit pack rated ≥4/5 useful
- [ ] Measurable cost or time delta vs manual baseline

---

## Airline pilot checklist

- [ ] Crew + network data ingested (de-identified or contracted)
- [ ] ≥5 disruption scenarios exercised
- [ ] FAR 117 compliance proof reviewed by OCC lead
- [ ] Recovery cost delta vs manual documented

---

## EV fleet pilot checklist

- [ ] Fleet + stops + tariff uploaded
- [ ] ≥5 daily plans generated
- [ ] Peak kW and $/day savings vs naive documented
- [ ] Depot ops manager sign-off on feasibility

---

## Pilot → production conversion

| Step | Action | Owner | Due |
|------|--------|-------|-----|
| 1 | 30-day pre-expiry review call | Qtangl AE | |
| 2 | Production SOW + annual pricing | Qtangl | |
| 3 | Tenant upgrade (pilot → prod) | Eng | |
| 4 | SLA and support tier agreed | Both | |
| 5 | Case study / reference call scheduled | GTM | |

---

## Post-mortem (if pilot does not convert)

| Question | Answer |
|----------|--------|
| Why not convert? | |
| Product gap? | |
| Pricing? | |
| Re-engage date? | |

Update [assumptions-and-open-questions.md](../backlog/assumptions-and-open-questions.md) and [risk-register.md](../backlog/risk-register.md) if needed.

---

## Related docs

- [12-track-H-product-and-onboarding.md](../12-track-H-product-and-onboarding.md)
- [09-track-E-gtm.md](../09-track-E-gtm.md)
- [11-track-G-security-trust-compliance.md](../11-track-G-security-trust-compliance.md)
