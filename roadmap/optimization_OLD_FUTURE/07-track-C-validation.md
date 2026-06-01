# 07 — Track C: Validation & Benchmarks

Scientific and engineering validation — fill the "Pending" benchmark table, define falsifiable success metrics, and prove (or disprove) hybrid value honestly.

---

## Epic overview

| ID | Epic | Status | Effort | Depends on |
|----|------|--------|--------|------------|
| C1 | Fill benchmark table (committed results) | `not-started` | M | A1, A2 |
| C2 | Falsifiable success metric definition | `not-started` | S | A2 |
| C3 | Determinism & reproducibility tests | `not-started` | M | I1 |
| C4 | Fixture vs live tolerance tests | `not-started` | M | A5 |
| C5 | Load & performance tests | `not-started` | M | D1 |

---

## C1 — Fill benchmark table

### Current state

[backend/README.md](../backend/README.md) Classical vs QAOA table:

| Problem | Classical | QAOA | Notes |
|---------|-----------|------|-------|
| 5-task precedence | 0.017s, feasible | 6.886s, failed | Too large for simulator |
| Tiny research schedule | **Pending** | **Pending** | — |

Harnesses exist:
- [backend/benchmarks/hospital_harness.py](../backend/benchmarks/hospital_harness.py)
- [backend/benchmarks/airline_harness.py](../backend/benchmarks/airline_harness.py)
- [backend/benchmarks/ev_fleet_harness.py](../backend/benchmarks/ev_fleet_harness.py)
- [backend/benchmarks/pqc_harness.py](../backend/benchmarks/pqc_harness.py)
- [backend/examples/compare_schedule_solvers.py](../backend/examples/compare_schedule_solvers.py)

### Approach

1. Define benchmark suite JSON: instance name, problem type, size, expected feasible
2. Run harnesses locally + in CI (Track I)
3. Commit results to `backend/benchmarks/results/` (JSON + markdown summary)
4. Update README table — **never leave "Pending" for promoted instances**

### Benchmark instances (minimum set)

| ID | Instance | Type | Size | Metrics |
|----|----------|------|------|---------|
| BM-001 | Tiny research schedule | schedule | ≤5 tasks | time, feasible, objective |
| BM-002 | 5-task precedence | schedule | 5 tasks | time, QAOA pass/fail |
| BM-003 | Hospital callout-cath-acls | hospital | 1 scenario | classical time, hybrid alternates count |
| BM-004 | Airline mx-hold-ord-0612 | airline | 1 scenario | recovery cost, distinct plans |
| BM-005 | EV tou-peak-ca | ev_fleet | 1 scenario | peak kW, daily cost |
| BM-006 | PQC bank-tls-inventory | pqc | fixture | assets found, scan time |

### Acceptance criteria

- [ ] All 6 benchmark instances have committed results
- [ ] Results reproducible on clean venv (pinned deps)
- [ ] CI job runs BM-001, BM-003, BM-006 on every PR
- [ ] Public copy on `/technology` or docs (optional)

---

## C2 — Falsifiable success metric

### The metric (optimization pillar)

**Primary:** *Distinct feasible alternates within ε of classical optimum*

```
success = (
  hybrid_distinct_feasible_plans >= classical_distinct_feasible_plans + 1
  AND hybrid_best_objective <= classical_objective * (1 + ε)
)
where ε = 0.02 (2%)
```

**Secondary metrics:**
- Fairness delta improvement (hospital/airline)
- Peak kW reduction (EV fleet)
- Audit pack generation rate (100% for hybrid runs)

### What we will NOT claim without evidence

- Quantum speedup vs CP-SAT
- Quantum finds better optimum on full problem
- Live QPU outperforms simulator

### Acceptance criteria

- [ ] Metric documented in [16-metrics-and-kpis.md](./16-metrics-and-kpis.md)
- [ ] Harness reports metric per run
- [ ] At least one benchmark instance demonstrates success metric = true

---

## C3 — Determinism & reproducibility tests

### Approach

1. QAOA with fixed seed (`QTANGL_QAOA_SEED=1234`) — same result on same machine
2. Fixture replay — bit-identical distribution for same scenario
3. CP-SAT — deterministic given fixed worker count

### Tests to add

| Test | File |
|------|------|
| QAOA seed stability | `backend/tests/test_qaoa_reproducibility.py` |
| Fixture distribution match | Extend vertical pipeline tests |
| Classical deterministic | `backend/tests/test_classical_scheduling.py` |

### Acceptance criteria

- [ ] 10 consecutive QAOA runs on BM-001 produce identical assignment (Aer, fixed seed)
- [ ] Fixture hybrid matches golden JSON snapshot

---

## C4 — Fixture vs live tolerance tests

### Approach

After A5 (real QPU run):
1. Compare fixture distribution vs live Aer vs live IBM
2. Define tolerance: top candidate match ≥80% weight correlation
3. Document when fixture refresh required

### Acceptance criteria

- [ ] Tolerance report in `backend/benchmarks/results/qpu_fixture_tolerance.md`
- [ ] Runbook: when to run `capture_qpu_trace.py`

---

## C5 — Load & performance tests

### Targets

| Endpoint | p95 latency | Throughput |
|----------|-------------|------------|
| `POST /optimize` (schedule, ≤10 tasks) | < 2s | 30 req/min/tenant |
| `POST /hospital/*/solve` (fixture) | < 10s | 10 req/min |
| `POST /pqc/scan` (fixture) | < 5s | 20 req/min |
| `POST /pqc/scan` (live, 10 endpoints) | < 60s | 5 req/min |

### Approach

- Use `locust` or `k6` scripts in `backend/benchmarks/load/`
- Run against staging before production releases

### Acceptance criteria

- [ ] Load test script committed
- [ ] Staging p95 documented
- [ ] Rate limits in [backend/app/auth.py](../backend/app/auth.py) align with targets

---

## Publishing results (honesty policy)

1. Publish full table including failures
2. Blog post: "When classical wins" — required before optimization GTM scale
3. Update [web/lib/copy/methodology.ts](../web/lib/copy/methodology.ts) with benchmark citations

---

## Related docs

- Track A: [05-track-A-hybrid-optimizer.md](./05-track-A-hybrid-optimizer.md)
- Metrics: [16-metrics-and-kpis.md](./16-metrics-and-kpis.md)
- Assumptions: [backlog/assumptions-and-open-questions.md](./backlog/assumptions-and-open-questions.md)
