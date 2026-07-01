# 01 — Current State (Baseline Truth)

Honest grading of every major component as of 2026-07-01. Status uses the roadmap legend: `ga` | `pilot` | `coming-soon` | `research`.

---

## Summary matrix

| Component | Status | Works? | Notes |
|-----------|--------|--------|-------|
| CP-SAT classical scheduler | `ga` | ✅ Yes | Production-safe; ~0.017s on 5-task schedule |
| QAOA hybrid path | `research` | 🟡 Partial | Real code; ≤12 binary vars; off on Railway; often fails/loses |
| Generic `/optimize` pipeline | `pilot` | ✅ Yes | Schedule, routing, and allocation wired in [backend/app/pipeline.py](../../backend/app/pipeline.py) |
| Local repair window (generic) | `pilot` | ✅ Yes | Schedule extractor live; routing repair path wired |
| Hospital vertical | `pilot` | ✅ Demo | Full pipeline; fixture hybrid replay |
| Airline vertical | `pilot` | ✅ Demo | Routing + crew + hybrid; fixture replay |
| EV fleet vertical | `pilot` | ✅ Demo | VRP + charging + hybrid; fixture replay |
| PQC scanner | `pilot` | ✅ Yes | Live scan + fixture; tenant API, monitoring, MSSP portfolio |
| Web platform | `ga` | ✅ Yes | 200+ route pages, readiness hub, docs, demos, learn library |
| CI/CD | `ga` | ✅ Yes | 11 GitHub Actions workflows; alignment + benchmark gates on PR |
| Multi-tenancy / persistence | `ga` | ✅ Yes | Postgres + Redis; WorkOS SSO; per-tenant API keys; MSSP hierarchy |
| Benchmark results committed | `ga` | ✅ Yes | BM-001–BM-006 JSON in [backend/benchmarks/results/](../../backend/benchmarks/results/) |

---

## Backend core

### FastAPI application — `ga`

**File:** [backend/app/main.py](../../backend/app/main.py)

Routers mounted: `/optimize`, `/hospital/*`, `/airline/*`, `/ev_fleet/*`, `/pqc/*`, `/tenant/*`, `/discovery/*`, `/drift/*`, `/remediation-program/*`, `/crypto-flip/*`, integrations webhooks, `/admin/*`, internal dashboard, `/public/*`, `/health`. CORS configured for qtangl.com, localhost, `*.vercel.app`.

### Classical solver — `ga`

**File:** [backend/app/solvers/classical.py](../../backend/app/solvers/classical.py)

- OR-Tools CP-SAT: interval vars, no-overlap, precedence, blocked resources, makespan minimize.
- Timeout: `QTANGL_CLASSICAL_TIMEOUT_SECONDS` (default 5s).
- Returns feasible assignments, metrics, visualization blocks.

**Verified:** 5-task precedence schedule → 0.017s, 0 violations ([backend/README.md](../../backend/README.md)).

### QAOA solver — `research`

**File:** [backend/app/solvers/qaoa.py](../../backend/app/solvers/qaoa.py)

- Disabled by default on Railway unless `QTANGL_ENABLE_QAOA=true`.
- Limits: ≤12 binary vars, horizon ≤6, ≤24 overlap constraints.
- Uses Qiskit Aer + SPSA + `MinimumEigenOptimizer`.
- Assessment statuses: `disabled`, `too_large`, `eligible`, `failed`, `kept_classical`.

**Known failure:** 5-task schedule → 6.886s, simulator memory/transpilation issues (README benchmark).

### Generic pipeline — `pilot`

**File:** [backend/app/pipeline.py](../../backend/app/pipeline.py)

Flow by problem type:

- **schedule:** classical → `detect_local_repair_window` → QAOA micro-solve → merge
- **routing:** classical → routing repair window → diversity attach
- **allocation:** classical allocation solver

Local repair uses `extract_scheduling_repair_window` when QAOA is eligible; returns `None` with diagnostics when disabled or no bounded window exists.

### QUBO modeling — `ga` (for small instances)

**File:** [backend/app/qubo/scheduling.py](../../backend/app/qubo/scheduling.py)

- docplex → qiskit-optimization quadratic program.
- `estimate_scheduling_qubo_size` drives QAOA eligibility.

### Canonical contract — `pilot`

**File:** [backend/app/models/canonical.py](../../backend/app/models/canonical.py)

Types: `schedule` | `routing` | `allocation`. All three are wired through `/optimize`.

---

## Vertical demos

All four verticals share the pattern:

```
classical global solve → detect repair window → hybrid micro-solve → scoreboard → audit packs → timeline
```

### Hospital — `pilot` (most mature)

| Piece | File |
|-------|------|
| Pipeline | [backend/app/hospital/pipeline.py](../../backend/app/hospital/pipeline.py) |
| Classical | [backend/app/hospital/solver_classical.py](../../backend/app/hospital/solver_classical.py) |
| Hybrid | [backend/app/hospital/solver_hybrid.py](../../backend/app/hospital/solver_hybrid.py) |
| Repair window | [backend/app/hospital/repair_window.py](../../backend/app/hospital/repair_window.py) |
| API | [backend/app/api/hospital.py](../../backend/app/api/hospital.py) |
| Demo UI | [web/app/demo/hospital/page.tsx](../../web/app/demo/hospital/page.tsx) |

**Production mode:** Live CP-SAT + cached QPU trace replay (`useFixture: true`). No IBM credentials required on Railway.

**Rich metrics:** `fairness_delta`, `agency_cost`, `fatigue_score`, `distinctness`.

### Airline — `pilot`

| Piece | File |
|-------|------|
| Pipeline | [backend/app/airline/pipeline.py](../../backend/app/airline/pipeline.py) |
| Routing repair | [backend/app/airline/solver_routing.py](../../backend/app/airline/solver_routing.py) |
| Hybrid | [backend/app/airline/solver_hybrid.py](../../backend/app/airline/solver_hybrid.py) |

Two-stage: aircraft routing repair → crew CP-SAT → hybrid crew rebid window.

### EV fleet — `pilot`

| Piece | File |
|-------|------|
| Pipeline | [backend/app/ev_fleet/pipeline.py](../../backend/app/ev_fleet/pipeline.py) |
| VRP routing | [backend/app/ev_fleet/solver_routing.py](../../backend/app/ev_fleet/solver_routing.py) |
| Charger queue | [backend/app/ev_fleet/solver_classical.py](../../backend/app/ev_fleet/solver_classical.py) |

Two-stage: VRP route assignment → CP-SAT charger queue / TOU → hybrid stagger window.

### PQC — `pilot` (most genuinely real)

| Piece | File |
|-------|------|
| Pipeline | [backend/app/pqc/pipeline.py](../../backend/app/pqc/pipeline.py) |
| Live scanner | [backend/app/pqc/scanner.py](../../backend/app/pqc/scanner.py) |
| Risk (Mosca) | [backend/app/pqc/risk.py](../../backend/app/pqc/risk.py) |
| Handshake proof | [backend/app/pqc/handshake.py](../../backend/app/pqc/handshake.py) |
| Report export | [backend/app/pqc/report.py](../../backend/app/pqc/report.py) |
| API | [backend/app/api/pqc.py](../../backend/app/api/pqc.py) |
| Tenant dashboard | [backend/app/api/tenant.py](../../backend/app/api/tenant.py) |
| Monitoring | [backend/app/monitoring/](../../backend/app/monitoring/) |

**Live capabilities:** TLS cert parse, CT subdomain enum, SSH banner, JWKS/OIDC, SMTP STARTTLS, SSRF guards (`assert_scannable`), scheduled re-scans, drift alerts, webhook DLQ, MSSP portfolio.

**Fixture mode:** Production-safe synchronous path.

---

## Frontend — `ga`

| Area | Scale |
|------|-------|
| Pages | 200+ route pages under [web/app/](../../web/app/) |
| Components | 400+ TS/TSX files |
| Docs platform | Per-endpoint reference, schemas, operations guides |
| Learn library | ~90 quantum OSS repos indexed; quantum-crypto curriculum hub |
| E2E tests | Playwright in [web/tests/e2e/](../../web/tests/e2e/) |

**Maturity note:** Web/docs exceed backend production readiness. Readiness-first homepage, Assess → Monitor → Convert journey, and MSSP partner portal are live.

---

## Infrastructure & ops

| Item | State | File |
|------|-------|------|
| Docker | ✅ | [backend/Dockerfile](../../backend/Dockerfile) |
| Railway | ✅ | [backend/railway.json](../../backend/railway.json) |
| Vercel (backend alt) | ✅ | [backend/vercel.json](../../backend/vercel.json) |
| CI/CD | ✅ | [.github/workflows/](../../.github/workflows/) — CI, smoke, dogfood, sensor build, SDK publish |
| Dependency pinning | ✅ | [backend/requirements.lock](../../backend/requirements.lock), [backend/requirements-dev.lock](../../backend/requirements-dev.lock) |
| Auth | ✅ Multi-tenant | [backend/app/auth.py](../../backend/app/auth.py) — API keys + WorkOS SSO; Redis rate limits |
| Persistence | ✅ | Postgres ([backend/app/db/](../../backend/app/db/)); Redis queue ([backend/app/queue/](../../backend/app/queue/)); Alembic migrations |
| Async workers | ✅ | [backend/app/worker.py](../../backend/app/worker.py) — scans, webhooks, scheduler |

---

## Tests — `ga`

120+ test modules in [backend/tests/](../../backend/tests/):

- Hospital, airline, EV fleet: pipeline, API, data, repair window, classical solver
- PQC: scanner, pipeline, API, safety, vulnerability, risk, contracts, CBOM, monitoring
- Tenant: dashboard, cross-tenant isolation, partner delegation, webhooks, billing
- Core: classical scheduling, QAOA scheduling, benchmark regression (BM-001, BM-003, BM-006)
- Discovery, crypto-flip, drift, remediation program

**Gaps:** Load tests at scale, QAOA correctness beyond research envelope, fixture-vs-live tolerance for all verticals.

---

## Scripts & offline tooling

| Script | Purpose |
|--------|---------|
| [backend/scripts/capture_qpu_trace.py](../../backend/scripts/capture_qpu_trace.py) | Offline IBM QPU trace for fixtures |
| [backend/scripts/capture_handshake_trace.py](../../backend/scripts/capture_handshake_trace.py) | PQC handshake trace |
| [backend/benchmarks/*_harness.py](../../backend/benchmarks/) | Vertical benchmark harnesses |
| [backend/examples/compare_schedule_solvers.py](../../backend/examples/compare_schedule_solvers.py) | Classical vs QAOA comparison |
| [scripts/alignment-check.mjs](../../scripts/alignment-check.mjs) | Marketing ↔ code alignment gate (CI) |

---

## Security hygiene

- `.env` at repo root contains API tokens; **gitignored, not committed** (verified).
- Product threat model documented in [docs/security/](../../docs/security/).
- PQC live scan has SSRF guards; responsible disclosure template in [.github/ISSUE_TEMPLATE/security_vulnerability.yml](../../.github/ISSUE_TEMPLATE/security_vulnerability.yml).
- Track G covers SOC 2, secrets manager adoption, and vertical compliance paths.

---

## Keystone gaps (ordered by impact)

1. **QAOA robustness + envelope expansion** — research path still fragile at scale (Track A4/J2)
2. **Real QPU opt-in live path** — beyond fixture replay (Track A5)
3. **Observability at scale** — tracing, metrics, on-call runbooks (Track D3)
4. **SOC 2 Type I → Type II** — trust center GTM (Track G5)
5. **Fixture-vs-live tolerance tests** — all verticals (Track C4)
6. **Content & SEO engine** — `/q-day` hub, framework guides (Track K3)

---

## Next doc

[02-market-and-competition.md](./02-market-and-competition.md) — where this capability fits in the market.
