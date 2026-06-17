# 16 — Financial Model & Fundraising

Readiness-specific unit economics, SaaS metrics (CAC/LTV/payback/NRR), scenario modeling, burn/runway, and the fundraising narrative + data room. Extends [17-financial-model.md](../optimization_OLD_FUTURE/17-financial-model.md) with the readiness-first lens.

---

## Company identifiers

| Field | Value |
|-------|-------|
| Name | Qtangl |
| Stock ticker | **QTGL** |
| Website | https://qtangl.com |

Canonical source: [`siteMetadata.ticker`](../../web/lib/copy/product.ts).

---

## Revenue model (readiness-first)

| Product | Model | ACV range | Margin |
|---------|-------|-----------|--------|
| Q-Day Assessment | One-time | $25K–$50K | ~98% |
| Q-Day Monitor | Annual subscription | $75K–$150K | ~97% |
| Q-Day Convert | Annual add-on | +$50K–$100K | ~90% (services-touched) |
| Q-Day Enterprise | Annual + services | $150K–$250K | ~92% |
| Optimize (expansion) | Pilot → annual | $50K–$250K | ~93% |

**Revenue mix goal (18 mo):** ≥80% recurring (Monitor + Convert + Enterprise); Assessment is a wedge, not the engine.

---

## Unit economics

### Assessment (land)

| Line | Amount |
|------|--------|
| Price (mid) | $35,000 |
| Live scan compute | $50 |
| Engineer review (4h @ $150) | $600 |
| Report generation | $20 |
| **COGS** | **~$670** |
| **Gross margin** | **~98%** |

### Monitor (recurring core)

| Line | Amount |
|------|--------|
| Price (mid) | $100,000/yr |
| Scheduled scans (52 × $5) | $260 |
| Storage | $120/yr |
| Support (2h/mo @ $100) | $2,400/yr |
| **COGS** | **~$2,780/yr** |
| **Gross margin** | **~97%** |

### Convert (expansion, services-touched)

| Line | Amount |
|------|--------|
| Price (add-on) | $75,000/yr |
| Program mgmt (CS time) | ~$5,000/yr |
| Partner orchestration | variable (partner bills labor) |
| **Gross margin** | **~90%** |

---

## SaaS metrics framework

| Metric | Definition | Target |
|--------|------------|--------|
| **CAC** | Fully-loaded sales+marketing / new customers | < $25K (founder-led); < $40K (with AE) |
| **ACV** | Avg annual contract value | $100K (Monitor mid) |
| **LTV** | ACV × gross margin × avg lifetime (yrs) | > $300K |
| **LTV:CAC** | Ratio | > 3:1; target 5:1 |
| **CAC payback** | Months to recover CAC | < 12 months |
| **Gross margin** | (Rev − COGS) / Rev | > 95% (Monitor) |
| **NRR** | Net revenue retention | > 110% |
| **GRR** | Gross revenue retention | > 90% |
| **Magic number** | Net new ARR / prior-Q S&M | > 0.75 |
| **Burn multiple** | Net burn / net new ARR | < 1.5 (early), < 1.0 (scaling) |

### LTV illustration (Monitor)

```
LTV = $100,000 ACV × 0.97 margin × 4 yr avg life ≈ $388,000
At CAC $30K -> LTV:CAC ≈ 13:1 (favorable; supports sales investment)
```

Conservatively model 3-year life and higher CAC until validated.

---

## Cohort & ARR build-up

### Assess → Monitor conversion (the critical lever)

| Conversion rate | ARR impact (per 10 assessments) |
|-----------------|---------------------------------|
| 25% | 2–3 Monitor ≈ $250K |
| 50% (target) | 5 Monitor ≈ $500K |
| 75% | 7–8 Monitor ≈ $750K |

This single ratio dominates the model — hence the mandatory drift-demo-at-readout play ([02-customer-journey.md](./02-customer-journey.md)) and KA-004 in [10-metrics-and-risks.md](./10-metrics-and-risks.md).

### Base-case ARR (aligned to financial model)

| Quarter | Assessments | Monitor (cum) | Convert | ARR end |
|---------|-------------|---------------|---------|---------|
| Q3 2026 | 2 | 1 | 0 | $100K |
| Q4 2026 | 3 | 2 | 0 | $200K |
| Q1 2027 | 3 | 3 | 1 | $350K |
| Q2 2027 | 4 | 4 | 2 | $500K |
| Q3 2027 | 4 | 6 | 3 | $750K |
| Q4 2027 | 5 | 8 | 4 | $1.0M |

---

## Scenario modeling

| Scenario | Assumptions | ARR @ 18 mo | Action |
|----------|-------------|-------------|--------|
| **Base** | 50% assess→Monitor; $100K ACV | $1.0M | Plan of record |
| **Bear** | 25% conversion; $70K ACV; longer cycles | $400K–$500K | Extend runway; tighten ICP; Monitor Lite |
| **Bull** | 65% conversion; partner channel live; $120K ACV | $1.5M–$2M | Accelerate hiring; raise larger Series A |

Sensitivity: a 20% Monitor price change holds margin >95% but shifts customer count needed ~25% (per financial model).

---

## Burn & runway

| Stage | Monthly burn | Notes |
|-------|--------------|-------|
| Now (founder + contractors) | $18K–$30K | Pre-second hire |
| Post-seed (2 FTE + AE) | ~$165K | 18-mo plan |

### Seed scenario ($3M)

| Metric | Value |
|--------|-------|
| Raise | $3,000,000 |
| Avg burn (18 mo) | $165,000/mo |
| Runway | ~18 months |
| Target ARR @ month 18 | $1M |
| Series A multiple | 10–15× ARR |

### Use of funds

| Category | % | Amount |
|----------|---|--------|
| Engineering (2 FTE) | 45% | $1.35M |
| GTM (AE + founder sales + content) | 25% | $750K |
| Security/compliance (SOC2, fractional) | 10% | $300K |
| Cloud / infra | 5% | $150K |
| Legal, ops, buffer | 15% | $450K |

---

## "PQC funds the platform" allocation

| Source | Allocation |
|--------|------------|
| PQC gross profit (97%) | 60% → readiness product + platform eng |
| PQC gross profit | 25% → GTM + content + sales |
| PQC gross profit | 15% → ops + security/compliance |

**Rule:** No optimization-only headcount until ≥$200K PQC ARR committed (unchanged).

---

## Fundraising narrative (readiness-first)

### Story arc

1. **Problem** — Every regulated org must inventory and migrate quantum-vulnerable crypto before 2027–2035; spreadsheets and consulting don't scale or stay current.
2. **Why now** — NIST standards finalized; NSM-10/CMMC mandates; HNDL means the clock already started.
3. **Insight** — The recurring value is the *system of record + evidence*, not the one-time scan.
4. **Solution** — Qtangl: Assess → Monitor → Convert with signed, verifiable evidence at mid-market price.
5. **Moat** — Speed + signed verify + drift + compliance crosswalk; honesty/trust; optimization optionality.
6. **Traction** — Pilots, Monitor conversions, self-scan dogfooding, content inbound.
7. **Market** — $5–15B PQC TAM; mid-market SAM underserved by incumbents.
8. **Model** — 97% margin recurring; >110% NRR; partner-leveraged Convert.
9. **Ask** — Seed for 18-mo runway to $1M ARR + SOC 2.

### Milestone-gated raise

| Milestone | ARR | Proof | Raise |
|-----------|-----|-------|-------|
| Pre-seed | $0 | Demo + 1 LOI + dogfood scan | $250K–$500K |
| Seed | $100K–$250K | 1–2 Monitor + repositioned site | $2–4M |
| Series A | $1M+ | SOC2 Type I + 2 case studies + NRR>110% | $8–15M |

### Deck outline (14 slides)

1. Title + tagline ("Assess. Monitor. Convert.")
2. Problem (Q-Day + HNDL + deadlines)
3. Why now (standards + mandates timeline)
4. Solution (journey diagram)
5. Product demo (scan → CBOM → verify)
6. The recurring insight (Monitor/Evidence is the product)
7. Traction (pilots, conversions, dogfooding)
8. Market (TAM/SAM/SOM)
9. Business model + unit economics
10. Competition + whitespace ([11-competitive-intelligence.md](./11-competitive-intelligence.md))
11. GTM + partners
12. Team + advisors
13. Roadmap ([08-execution-plan.md](./08-execution-plan.md))
14. Ask + use of funds

---

## Data room checklist

| Category | Artifacts |
|----------|-----------|
| Corporate | Cap table, incorporation, board consents ([17-legal-regulatory-and-compliance.md](./17-legal-regulatory-and-compliance.md)) |
| Financial | Model, actuals, burn/runway, bank statements |
| Metrics | ARR, pipeline, cohort, CAC/LTV, NRR |
| Product | Roadmap, PRDs, architecture ([03-solution-architecture.md](./03-solution-architecture.md)) |
| Customers | Signed SOWs, LOIs, case studies, references |
| Security | SOC2 status, pen test summary, trust center ([12-platform-security-and-trust.md](./12-platform-security-and-trust.md)) |
| Legal | MSA/DPA/BAA templates, IP assignments, patents |
| Team | Bios, org chart, hiring plan ([18-organization-and-hiring.md](./18-organization-and-hiring.md)) |

---

## Financial KPIs (monthly review)

| KPI | Source |
|-----|--------|
| ARR / new ARR / churned ARR | Billing |
| CAC / payback | Finance + CRM |
| NRR / GRR | Billing + CS |
| Burn / runway | Finance |
| Pipeline coverage (3× target) | CRM |
| Gross margin | Finance |

---

## Non-dilutive federal funding (parallel path)

SBIR/STTR and federal contracts can fund product validation without dilution — often strengthening the venture narrative.

| Vehicle | Phase I target | Phase II target |
|---------|----------------|-----------------|
| NSF SBIR | ~$275K | ~$1M+ |
| AFWERX Open Topic | $75K | up to $1.25M |
| DHS SBIR | up to $150K | up to $1M |
| STRATFI/TACFI (post-Phase II) | — | $3M–$15M |

**Full playbook:** [24-federal-funding-and-grants.md](./24-federal-funding-and-grants.md) · [federal-funding/](./federal-funding/README.md)

Non-dilutive awards can extend runway and de-risk seed milestones (e.g., federal pilot = traction proof for Series A).

---

## Related docs

- Federal funding playbook: [24-federal-funding-and-grants.md](./24-federal-funding-and-grants.md)
- Original financial model: [17-financial-model.md](../optimization_OLD_FUTURE/17-financial-model.md)
- Pricing/packaging: [06-gtm-and-pricing.md](./06-gtm-and-pricing.md)
- Metrics: [10-metrics-and-risks.md](./10-metrics-and-risks.md)
- Org/hiring: [18-organization-and-hiring.md](./18-organization-and-hiring.md)
