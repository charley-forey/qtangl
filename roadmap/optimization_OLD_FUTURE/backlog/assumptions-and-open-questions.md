# Assumptions & Open Questions

Explicit hypotheses that must be validated. Update **Status** when evidence exists.

**Status:** `unvalidated` | `validated` | `invalidated` | `deferred`

---

## Strategic assumptions

| ID | Assumption | Validation method | Success criteria | Status |
|----|------------|-------------------|------------------|--------|
| A-001 | **PQC is the faster path to revenue** vs optimization | Close 2 PQC pilots before first optimization pilot | 2 PQC SOWs signed first | unvalidated |
| A-002 | **Mid-market buyers ($500–10K employees) will pay $75K–$150K/yr** for PQC monitor | 5 pricing conversations + 2 signed deals | ≥1 deal at ≥$75K ACV | unvalidated |
| A-003 | **Hybrid surfaces ≥1 extra distinct feasible alternate** within 2% of optimum on repair windows | Track C2 success metric on BM-003+ | successMetric=true on ≥1 instance | unvalidated |
| A-004 | **Audit packs are a purchase driver** for hospital/airline buyers | Pilot survey: "audit pack useful?" ≥4/5 | ≥3/4 pilot buyers agree | unvalidated |
| A-005 | **Honesty positioning wins** vs quantum hype vendors | Win ≥1 deal where buyer cites transparency | Documented in case study | unvalidated |
| A-006 | **PQC revenue can fund optimization R&D** without seed dilution | PQC gross profit covers 1 engineer month | $15K+ GP/month from PQC | unvalidated |

---

## Technical assumptions

| ID | Assumption | Validation method | Success criteria | Status |
|----|------------|-------------------|------------------|--------|
| T-001 | **Local repair windows fit in ≤12 binary vars** for real disruptions | A1 extractor on 10 hospital/airline scenarios | 100% extract without empty window | unvalidated |
| T-002 | **Fixture replay is acceptable** for production demos until A5 | 5 sales demos; ask "is this live?" — no deal loss | 0 deals lost solely due to fixture | unvalidated |
| T-003 | **QAOA warm-start improves alternate diversity** vs cold start | J2 experiment on BM-003 | diversityScore +≥0.1 vs cold | unvalidated |
| T-004 | **Quantum-inspired (neal/SA) matches QAOA** on micro-windows | J3/J4 comparison table | ≥80% alternate overlap | unvalidated |
| T-005 | **Real QPU is not required** for production hybrid path | J2–J4 + A5 — if SA wins, ADR to skip QPU in prod | ADR-006 decision documented | unvalidated |
| T-006 | **CP-SAT remains default** for all global solves at scale | Load test C5; no customer needs larger MIP | p95 <2s for ≤50 task schedule | unvalidated |

---

## Market assumptions

| ID | Assumption | Validation method | Success criteria | Status |
|----|------------|-------------------|------------------|--------|
| M-001 | **Hospital re-staffing is #1 optimization vertical** | E2 pilot conversion vs airline outreach | Hospital pilot closes first | unvalidated |
| M-002 | **2027 PQC deadline creates urgency** in outbound | Email reply rate ≥10% on PQC vs optimization | PQC reply rate 2× optimization | unvalidated |
| M-003 | **Both-sides-of-Q-Day bundle increases ACV** | Offer bundle to 5 PQC prospects | ≥1 bundle vs standalone PQC | unvalidated |

---

## Financial assumptions

| ID | Assumption | Validation method | Success criteria | Status |
|----|------------|-------------------|------------------|--------|
| FIN-001 | PQC monitor ACV **$100K** achievable | E1 closed deals | ≥1 at $100K | unvalidated |
| FIN-002 | **50% pilot → production** conversion | Track H4 lifecycle | ≥50% over 4 pilots | unvalidated |
| FIN-003 | **Gross margin >90%** sustained | Actual COGS tracking | GM ≥90% at 5 customers | unvalidated |
| FIN-004 | **$3M seed gives 18-month runway** | Monthly burn tracking | Cash positive path or Series A by mo 18 | unvalidated |

See also [17-financial-model.md](../17-financial-model.md).

---

## Open questions (decisions pending)

| ID | Question | Options | Decision by | Blocks |
|----|----------|---------|-------------|--------|
| Q-001 | Production hybrid solver: QAOA vs quantum-inspired? | QAOA / neal-SA / tabu / ensemble | Phase 4 (J6) | A4 production config |
| Q-002 | Real QPU in production or marketing-only? | Opt-in / marketing-only / never | Phase 4 (A5) | A5 scope |
| Q-003 | Self-serve vs sales-led PQC first? | Self-serve H5 / sales-led E1 | Phase 3 | H5 vs E1 priority |
| Q-004 | Incorporate as Delaware C-Corp now? | Yes / defer | Phase 1 | F5 fundraising |
| Q-005 | Open-source SDK vs proprietary? | MIT SDK / proprietary | Phase 3 | D5 license |
| Q-006 | First hire: backend vs security vs AE? | Eng / security / sales | $200K ARR or month 6 | F2 |
| Q-007 | Federate auth (Auth0/Clerk) vs custom? | Auth0 / Clerk / custom | Phase 3 H1 | H1 architecture |

---

## Validation log

| Date | ID | Result | Evidence |
|------|-----|--------|----------|
| — | — | — | — |

---

## Invalidation playbook

When an assumption is **invalidated**:

1. Update status in this doc
2. Add or update risk in [risk-register.md](./risk-register.md)
3. Write ADR if architectural decision changes
4. Update [03-strategy-and-priorities.md](../03-strategy-and-priorities.md) if priority shifts
5. Communicate in weekly review

**Example:** If A-003 invalidated (hybrid never adds alternates) → pivot all optimization marketing to audit-only; deprioritize A4/A5; accelerate PQC.

---

## Related docs

- Validation: [../07-track-C-validation.md](../07-track-C-validation.md)
- Research: [../14-track-J-solver-research.md](../14-track-J-solver-research.md)
- Metrics: [../16-metrics-and-kpis.md](../16-metrics-and-kpis.md)
