# 00 — Executive Summary

## What Qtangl is

Qtangl is a **two-pillar quantum-adjacent platform**:

1. **Hybrid optimization API** — Classical-first planning (OR-Tools CP-SAT) with bounded quantum/hybrid micro-repair on local disruption windows. Returns ranked plans, scoreboards, and audit packs.
2. **PQC Q-Day readiness scanner** — Cryptographic inventory, Mosca HNDL risk scoring, post-quantum TLS handshake proof, and migration reports (JSON/CSV/CBOM/PDF).

**Positioning:** *"Both sides of Q-Day — extract auditable value from hybrid optimization today; prove your stack survives Q-Day tomorrow."*

---

## The honest thesis (our moat)

We do **not** sell "quantum is faster." We sell:

- **Auditability** — QUBO snapshots, solver diagnostics, and evidence packs a compliance officer can save.
- **Diverse feasible alternates** — When CP-SAT returns one greedy optimum, hybrid sampling surfaces tied plans with different fairness/cost profiles.
- **Classical fallback always** — If QAOA fails or loses, the API returns the classical plan with transparent diagnostics.

This honesty is rare in quantum software and is defensible under technical due diligence.

---

## Two-product bet

| Product | Lead? | Why |
|---------|-------|-----|
| **PQC scanner** | **Yes — revenue now** | Real backend today; board-level mandate; no "quantum doesn't win yet" caveat; budgets $5–25M at mid-size banks |
| **Hybrid optimizer** | **Yes — story + expansion** | Hospital/airline/EV demos ~60% built; strongest wedge is hospital re-staffing; needs keystone engineering (local repair window) |

**Sequence:** PQC pilots fund optimization R&D. Optimization credibility unlocks enterprise optimization contracts.

---

## Current maturity (one paragraph)

**Works:** CP-SAT classical core, four vertical demo pipelines (hospital, airline, EV fleet, PQC), polished Next.js site + docs + learn library (~90 OSS repos indexed), ~50 backend tests.

**Fixture-backed:** Production demos replay cached QPU traces; hybrid path is deterministic and safe but not live quantum.

**Missing keystone:** Real local-repair-window extraction in generic `/optimize` pipeline (`whole_problem_smoke` placeholder). No CI. Unpinned dependencies. In-memory session/job stores. Single shared API key.

---

## Five most important things

1. **Build the local-repair-window extractor** — Unlocks the entire hybrid optimization premise.
2. **Ship PQC as lead revenue product** — Harden live scan, CBOM, continuous monitoring, remediation workflow.
3. **Keep the honesty** — "Diverse auditable alternates," not speed, is the headline metric.
4. **Security before regulated pilots** — Secrets hygiene, threat model, SOC2 path before hospital PHI or gov CMMC data.
5. **Fill the benchmark table** — Publish reproducible numbers; due diligence will ask.

---

## 6 / 12 / 18-month vision

### 6 months — *Credible + first revenue*

- PQC: 2–3 paying design-partner pilots; live scan production-hardened; CBOM exports accepted by auditors.
- Optimizer: Local repair window live in `/optimize` + hospital; diversity metric on all scoreboards; benchmark table filled.
- Platform: CI/CD, pinned deps, per-tenant API keys, Postgres for sessions/reports.
- GTM: Hospital + PQC demo recordings; 5 design-partner LOIs.

### 12 months — *Enterprise-ready pilot*

- Real QPU run documented and reproducible (opt-in live path + fixture fallback).
- Hospital + airline design partners in production pilot (fixture or live hybrid).
- SOC 2 Type I in progress; HIPAA BAA template for hospital vertical.
- Official Python + TypeScript SDKs; OpenAPI published.
- $500K–$1M ARR run-rate from PQC subscriptions + optimization pilots.

### 18 months — *Scale*

- Multi-tenant SaaS with self-serve onboarding for PQC; optimization API `ga` for schedule + routing.
- FedRAMP/CMMC pathway for gov PQC buyers.
- Solver research published (honest benchmarks vs CP-SAT / quantum-inspired).
- Series A narrative: recurring PQC revenue + optimization expansion + defensible IP on repair-window method.

---

## Value to the world

| Stakeholder | Value delivered |
|-------------|-----------------|
| **Hospitals** | Faster, auditable nurse swap decisions; reduced agency OT; compliance evidence |
| **Airlines / logistics** | Diverse recovery plans; FAR 117 / constraint proof; cascade cost reduction |
| **Fleet operators** | Peak demand reduction; TOU savings; concrete $/day ROI |
| **CISOs / compliance** | PQC inventory, HNDL risk, remediation backlog before 2027/2030 deadlines |
| **Developers** | Honest hybrid API with JSON contract, docs, and SDKs — no quantum hype required |

---

## Where to go next

- **Builders:** [01-current-state.md](./01-current-state.md) → [backlog/action-items.md](./backlog/action-items.md)
- **Investors:** [02-market-and-competition.md](./02-market-and-competition.md) → [17-financial-model.md](./17-financial-model.md) → [15-timeline-and-milestones.md](./15-timeline-and-milestones.md)
