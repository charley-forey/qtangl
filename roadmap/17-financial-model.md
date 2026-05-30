# 17 — Financial Model

Unit economics, COGS, pricing-to-margin analysis, burn, runway, and fundraising milestone mapping.

**Currency:** USD  
**Assumption date:** 2026-06-01

---

## Revenue model summary

| Product | Model | ACV range |
|---------|-------|-----------|
| PQC Assessment | One-time | $25K–$50K |
| PQC Monitor | Annual subscription | $75K–$150K |
| PQC Enterprise | Annual + services | $150K–$250K |
| Hospital Swap Pilot | 60-day pilot → annual | $50K pilot → $80K–$120K/yr |
| Airline OCC Pilot | 90-day pilot → annual | $100K pilot → $150K–$250K/yr |
| API Developer | Monthly | $500–$5K/mo ($6K–$60K/yr) |

---

## Unit economics — PQC

### PQC Assessment (one-time)

| Line item | Amount |
|-----------|--------|
| **Price** | $35,000 (mid) |
| Live scan compute | $50 |
| Engineer review (4 hrs @ $150) | $600 |
| Report generation | $20 |
| **COGS** | **~$670** |
| **Gross margin** | **~98%** |

### PQC Monitor (annual)

| Line item | Amount |
|-----------|--------|
| **Price** | $100,000/yr |
| Scheduled scans (52 × $5 compute) | $260 |
| Storage (Postgres) | $120/yr |
| Support (2 hrs/mo @ $100) | $2,400/yr |
| **COGS** | **~$2,780/yr** |
| **Gross margin** | **~97%** |

*Primary COGS is human support at scale — automate remediation workflow to protect margin.*

---

## Unit economics — Optimization

### Hospital pilot (60 days)

| Line item | Amount |
|-----------|--------|
| **Price** | $75,000 |
| Cloud compute (CP-SAT + fixture) | $200 |
| Integration support (20 hrs @ $150) | $3,000 |
| **COGS** | **~$3,200** |
| **Gross margin** | **~96%** |

### Hospital production (annual)

| Line item | Amount |
|-----------|--------|
| **Price** | $100,000/yr |
| Compute (est. 500 solves/mo) | $600/yr |
| Support (5 hrs/mo) | $6,000/yr |
| **COGS** | **~$6,600/yr** |
| **Gross margin** | **~93%** |

---

## QPU / quantum COGS (when live)

| Backend | Cost per micro-solve | Notes |
|---------|---------------------|-------|
| Fixture replay | ~$0.001 | Default production |
| Aer simulator | ~$0.01–$0.10 | Local/staging CPU |
| IBM Quantum (real QPU) | $0.50–$5.00 | Depends on queue/time |
| D-Wave Leap | $0.25–$2.00 | Annealing shot budget |

**Policy:** Default production uses fixture; live QPU opt-in only. Cap QPU spend at **$500/mo** until $250K ARR.

---

## ARR build-up scenario (base case)

| Quarter | PQC customers | Opt pilots | Opt prod | **ARR end** |
|---------|---------------|------------|----------|-------------|
| Q3 2026 | 1 monitor | 1 pilot | 0 | $100K |
| Q4 2026 | 2 monitor | 2 pilot | 0 | $200K |
| Q1 2027 | 3 monitor | 1 pilot | 1 prod | $350K |
| Q2 2027 | 4 monitor | 1 pilot | 2 prod | $500K |
| Q3 2027 | 6 monitor | 0 | 3 prod | $750K |
| Q4 2027 | 8 monitor | 0 | 5 prod | $1.0M |

*Assumes 1 assessment converts to monitor within 6 months; 50% pilot → production conversion.*

---

## Burn & runway

### Monthly burn (seed stage, months 1–12)

| Category | Monthly |
|----------|---------|
| Founder/engineering (1 FTE equiv) | $15K |
| Second engineer (from month 4) | $12K |
| Cloud (Railway, Vercel, Postgres) | $500 |
| QPU budget | $200 |
| Tools (GitHub, domain, SaaS) | $300 |
| Legal/accounting | $500 |
| Sales travel | $1,000 |
| **Total burn** | **~$18K → $30K/mo** |

### Seed scenario: $3M raise

| Metric | Value |
|--------|-------|
| Raise | $3,000,000 |
| Avg monthly burn (18 mo) | $165,000 (with 2 FTE + 1 AE) |
| **Runway** | **~18 months** |
| Target ARR at month 18 | $1M |
| Implied revenue multiple at Series A | 10–15× ARR |

---

## "PQC funds optimization R&D" model

| Revenue source | Allocation |
|----------------|------------|
| PQC gross profit (97%) | 60% → optimization engineering (A1, A4, A5, J) |
| PQC gross profit | 25% → GTM + sales |
| PQC gross profit | 15% → ops + compliance (G, D) |

**Rule:** Do not hire optimization-only headcount until ≥$200K PQC ARR committed.

---

## Pricing sensitivity

| If price... | PQC Monitor | Impact |
|-------------|-------------|--------|
| −20% ($80K) | Still 96% GM | Need 25% more customers for same ARR |
| +20% ($120K) | Still 98% GM | May slow mid-market; target enterprise |

**Recommendation:** Start mid-market at $100K monitor; enterprise tier at $200K+ with CMMC mapping.

---

## Fundraising milestone mapping

| Milestone | ARR | Key proof | Raise |
|-----------|-----|-----------|-------|
| Pre-seed | $0 | Demo + 1 LOI | Friends/family $250K–$500K |
| Seed | $100K–$250K | 1–2 paying PQC + A1 shipped | $2–4M seed |
| Series A | $1M+ | SOC2 Type I + 2 case studies + benchmark whitepaper | $8–15M |

---

## Key assumptions (financial)

| ID | Assumption | If wrong |
|----|------------|----------|
| FIN-001 | PQC monitor ACV $100K achievable mid-market | Lower to $60K; need more volume |
| FIN-002 | 50% pilot → prod conversion | Extend runway; tighten pilot criteria |
| FIN-003 | Gross margin stays >90% | Support automation required earlier |
| FIN-004 | QPU COGS capped by fixture default | No margin impact |
| FIN-005 | Second engineer hire month 4 | Delay if ARR < $100K |

Track in [backlog/assumptions-and-open-questions.md](./backlog/assumptions-and-open-questions.md).

---

## Related docs

- GTM pricing: [09-track-E-gtm.md](./09-track-E-gtm.md)
- Business ops: [10-track-F-business-ops.md](./10-track-F-business-ops.md)
- Timeline: [15-timeline-and-milestones.md](./15-timeline-and-milestones.md)
- KPIs: [16-metrics-and-kpis.md](./16-metrics-and-kpis.md)
