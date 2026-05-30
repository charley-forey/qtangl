# 01 — Current State (Baseline Truth)

Honest grading of every major component as of 2026-05-29. Status uses the roadmap legend: `ga` | `pilot` | `coming-soon` | `research`.

---

## Summary matrix

| Component | Status | Works? | Notes |
|-----------|--------|--------|-------|
| CP-SAT classical scheduler | `ga` | ✅ Yes | Production-safe; ~0.017s on 5-task schedule |
| QAOA hybrid path | `research` | 🟡 Partial | Real code; ≤12 binary vars; off on Railway; often fails/loses |
| Generic `/optimize` pipeline | `pilot` | 🟡 Schedule only | Routing/allocation → `NotImplementedError` |
| Local repair window (generic) | `research` | ❌ No | `whole_problem_smoke` placeholder |
| Hospital vertical | `pilot` | ✅ Demo | Full pipeline; fixture hybrid replay |
| Airline vertical | `pilot` | ✅ Demo | Routing + crew + hybrid; fixture replay |
| EV fleet vertical | `pilot` | ✅ Demo | VRP + charging + hybrid; fixture replay |
| PQC scanner | `pilot` | ✅ Yes | Live scan + fixture; most real backend |
| Web platform | `ga` | ✅ Yes | 96+ pages, docs, demos, learn library |
| CI/CD | `coming-soon` | ❌ No | No `.github/` workflows |
| Multi-tenancy / persistence | `coming-soon` | ❌ No | In-memory caches; single API key |
| Benchmark results committed | `coming-soon` | ❌ No | README table mostly "Pending" |

---

## Backend core

### FastAPI application — `pilot`

**File:** [backend/app/main.py](../backend/app/main.py)

Routers mounted: `/optimize`, `/hospital/*`, `/airline/*`, `/ev_fleet/*`, `/pqc/*`, `/health`. CORS configured for qtangl.com, localhost, `*.vercel.app`.

### Classical solver — `ga`

**File:** [backend/app/solvers/classical.py](../backend/app/solvers/classical.py)

- OR-Tools CP-SAT: interval vars, no-overlap, precedence, blocked resources, makespan minimize.
- Timeout: `QTANGL_CLASSICAL_TIMEOUT_SECONDS` (default 5s).
- Returns feasible assignments, metrics, visualization blocks.

**Verified:** 5-task precedence schedule → 0.017s, 0 violations ([backend/README.md](../backend/README.md)).

### QAOA solver — `research`

**File:** [backend/app/solvers/qaoa.py](../backend/app/solvers/qaoa.py)

- Disabled by default on Railway unless `QTANGL_ENABLE_QAOA=true`.
- Limits: ≤12 binary vars, horizon ≤6, ≤24 overlap constraints.
- Uses Qiskit Aer + SPSA + `MinimumEigenOptimizer`.
- Assessment statuses: `disabled`, `too_large`, `eligible`, `failed`, `kept_classical`.

**Known failure:** 5-task schedule → 6.886s, simulator memory/transpilation issues (README benchmark).

### Generic pipeline — `pilot` (schedule only)

**File:** [backend/app/pipeline.py](../backend/app/pipeline.py)

Flow: `run_global_classical` → `detect_local_repair_window` → `build_local_quantum_candidate` → `solve_schedule_with_qaoa` → `merge_local_repair`.

**Keystone gap:**

```python
# backend/app/pipeline.py — detect_local_repair_window
strategy="whole_problem_smoke"
# "No separate local repair extractor is implemented yet"
```

### QUBO modeling — `ga` (for small instances)

**File:** [backend/app/qubo/scheduling.py](../backend/app/qubo/scheduling.py)

- docplex → qiskit-optimization quadratic program.
- `estimate_scheduling_qubo_size` drives QAOA eligibility.

### Canonical contract — `pilot`

**File:** [backend/app/models/canonical.py](../backend/app/models/canonical.py)

Types: `schedule` | `routing` | `allocation`. Only `schedule` is wired end-to-end.

---

## Vertical demos

All four verticals share the pattern:

```
classical global solve → detect repair window → hybrid micro-solve → scoreboard → audit packs → timeline
```

### Hospital — `pilot` (most mature)

| Piece | File |
|-------|------|
| Pipeline | [backend/app/hospital/pipeline.py](../backend/app/hospital/pipeline.py) |
| Classical | [backend/app/hospital/solver_classical.py](../backend/app/hospital/solver_classical.py) |
| Hybrid | [backend/app/hospital/solver_hybrid.py](../backend/app/hospital/solver_hybrid.py) |
| Repair window | [backend/app/hospital/repair_window.py](../backend/app/hospital/repair_window.py) |
| API | [backend/app/api/hospital.py](../backend/app/api/hospital.py) |
| Demo UI | [web/app/demo/hospital/page.tsx](../web/app/demo/hospital/page.tsx) |

**Production mode:** Live CP-SAT + cached QPU trace replay (`useFixture: true`). No IBM credentials required on Railway.

**Rich metrics:** `fairness_delta`, `agency_cost`, `fatigue_score`, `distinctness`.

### Airline — `pilot`

| Piece | File |
|-------|------|
| Pipeline | [backend/app/airline/pipeline.py](../backend/app/airline/pipeline.py) |
| Routing repair | [backend/app/airline/solver_routing.py](../backend/app/airline/solver_routing.py) |
| Hybrid | [backend/app/airline/solver_hybrid.py](../backend/app/airline/solver_hybrid.py) |

Two-stage: aircraft routing repair → crew CP-SAT → hybrid crew rebid window.

### EV fleet — `pilot`

| Piece | File |
|-------|------|
| Pipeline | [backend/app/ev_fleet/pipeline.py](../backend/app/ev_fleet/pipeline.py) |
| VRP routing | [backend/app/ev_fleet/solver_routing.py](../backend/app/ev_fleet/solver_routing.py) |
| Charger queue | [backend/app/ev_fleet/solver_classical.py](../backend/app/ev_fleet/solver_classical.py) |

Two-stage: VRP route assignment → CP-SAT charger queue / TOU → hybrid stagger window.

### PQC — `pilot` (most genuinely real)

| Piece | File |
|-------|------|
| Pipeline | [backend/app/pqc/pipeline.py](../backend/app/pqc/pipeline.py) |
| Live scanner | [backend/app/pqc/scanner.py](../backend/app/pqc/scanner.py) |
| Risk (Mosca) | [backend/app/pqc/risk.py](../backend/app/pqc/risk.py) |
| Handshake proof | [backend/app/pqc/handshake.py](../backend/app/pqc/handshake.py) |
| Report export | [backend/app/pqc/report.py](../backend/app/pqc/report.py) |
| API | [backend/app/api/pqc.py](../backend/app/api/pqc.py) |

**Live capabilities:** TLS cert parse, CT subdomain enum, SSH banner, JWKS/OIDC, SMTP STARTTLS, SSRF guards (`assert_scannable`).

**Fixture mode:** Production-safe synchronous path.

---

## Frontend — `ga`

| Area | Scale |
|------|-------|
| Pages | 96+ route pages under [web/app/](../web/app/) |
| Components | 346+ TS/TSX files |
| Docs platform | Per-endpoint reference, schemas, operations guides |
| Learn library | ~90 quantum OSS repos indexed |
| E2E tests | Playwright in [web/tests/e2e/](../web/tests/e2e/) |

**Maturity note:** Web/docs exceed backend production readiness. This is a strategic asset for inbound and credibility.

---

## Infrastructure & ops

| Item | State | File |
|------|-------|------|
| Docker | ✅ | [backend/Dockerfile](../backend/Dockerfile) |
| Railway | ✅ | [backend/railway.json](../backend/railway.json) |
| Vercel (backend alt) | ✅ | [backend/vercel.json](../backend/vercel.json) |
| CI/CD | ❌ | No `.github/workflows/` |
| Dependency pinning | ❌ | [backend/requirements.txt](../backend/requirements.txt) unpinned |
| Auth | 🟡 Single key | [backend/app/auth.py](../backend/app/auth.py) — `QTANGL_API_KEY` |
| In-memory state | ❌ | `_report_cache` in [backend/app/api/pqc.py](../backend/app/api/pqc.py); sessions in `*/sessions.py` |

---

## Tests — `pilot`

~50 test functions in [backend/tests/](../backend/tests/):

- Hospital, airline, EV fleet: pipeline, API, data, repair window, classical solver
- PQC: scanner, pipeline, API, safety, vulnerability, risk, contracts
- Core: classical scheduling, QAOA scheduling (limited)

**Gaps:** Load tests, QAOA correctness at scale, fixture-vs-live tolerance, CI integration.

---

## Scripts & offline tooling

| Script | Purpose |
|--------|---------|
| [backend/scripts/capture_qpu_trace.py](../backend/scripts/capture_qpu_trace.py) | Offline IBM QPU trace for fixtures |
| [backend/scripts/capture_handshake_trace.py](../backend/scripts/capture_handshake_trace.py) | PQC handshake trace |
| [backend/benchmarks/*_harness.py](../backend/benchmarks/) | Vertical benchmark harnesses |
| [backend/examples/compare_schedule_solvers.py](../backend/examples/compare_schedule_solvers.py) | Classical vs QAOA comparison |

---

## Security hygiene (flagged)

- `.env` at repo root contains API tokens; **gitignored, not committed** (verified).
- Track G covers rotation + secrets manager adoption.
- PQC live scan has SSRF guards; broader threat model not yet documented.

---

## Keystone gaps (ordered by impact)

1. **Local repair window extractor** — [backend/app/pipeline.py](../backend/app/pipeline.py)
2. **Persistent multi-tenant state** — sessions, jobs, report cache
3. **CI/CD + pinned dependencies**
4. **Benchmark table filled** — [backend/README.md](../backend/README.md)
5. **Real QPU opt-in live path** — beyond fixture replay
6. **`/optimize` routing + allocation** — [backend/app/parsers/](../backend/app/parsers/) scaffolded

---

## Next doc

[02-market-and-competition.md](./02-market-and-competition.md) — where this capability fits in the market.
