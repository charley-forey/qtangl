# ADR-004: Scheduling local repair window extraction

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-30 |
| **Deciders** | Engineering |
| **Epic** | A1 |

---

## Context

Qtangl's hybrid story requires QAOA on a **bounded micro-problem**, not the full uploaded schedule. Before A1, [`backend/app/pipeline.py`](../../backend/app/pipeline.py) reused the entire job as `whole_problem_smoke` when it happened to fit QAOA limits — useless for real schedules (20+ tasks, 33+ binary variables).

Hospital, airline, and EV verticals already implement domain-specific repair windows. Generic `/optimize` scheduling needed the same pattern.

Constraints:

- QAOA limits: default ≤12 binary variables, horizon ≤6 ([`backend/app/solvers/qaoa.py`](../../backend/app/solvers/qaoa.py))
- Classical CP-SAT always runs first on the full job
- Non-window tasks must keep classical assignments (pinned as resource blocks)
- Honest fallback if no eligible window exists

---

## Decision

Implement [`backend/app/repair_window/scheduling.py`](../../backend/app/repair_window/scheduling.py):

1. **Seed** from classical critical-path tasks + tasks on resources with blocked days
2. **Expand** one precedence hop and shared-resource neighbors
3. **Shrink** by removing highest-slack non-critical tasks (or earliest critical tasks if necessary) until `estimate_scheduling_qubo_size(subproblem)` passes `assess_qaoa_candidate`
4. **Build sub-problem** with window tasks only; pin non-window classical assignments as `resource_unavailable` constraints
5. **Merge** QAOA window assignments back into the classical plan; compare merged makespan vs classical score

Strategies:

| Strategy | When |
|----------|------|
| `whole_job_research` | Full job already within QAOA limits (tiny instances) |
| `critical_path_neighborhood` | Extracted sub-problem within limits |
| *(none)* | `localRepairWindow: not_found` in diagnostics |

Replace `whole_problem_smoke` as the default path for large jobs.

---

## Consequences

### Positive

- Generic `/optimize` can attempt QAOA on large schedules without whole-job smoke
- Diagnostics expose `taskIds`, `quboDiagnostics`, `windowTaskCount`, `strategy`
- Pattern aligns with hospital/airline vertical repair windows
- Tests lock pinning behavior for non-window tasks

### Negative / tradeoffs

- Critical-path heuristic may miss better alternate neighborhoods (A2 diversity metric addresses product value)
- Single-task windows are valid but weak for demonstrating hybrid value
- Pinning via blocked days is approximate; exotic resource constraints may need richer encoding later
- Shrink loop is greedy, not optimal minimum window

### Neutral

- QAOA still research-only; production Railway default remains `QTANGL_ENABLE_QAOA=false`

---

## Alternatives considered

| Option | Pros | Cons | Why rejected |
|--------|------|------|--------------|
| Whole-job smoke (status quo) | Simple | Fails on any real schedule | Product premise broken |
| Random task subset | Easy to implement | Not tied to disruption | Hard to explain to buyers |
| Full CP-SAT neighborhood search | Optimal window | Expensive; overkill for Phase 1 | Defer to research track |
| Copy hospital BFS verbatim | Proven in demo | Wrong domain model (nurses ≠ tasks) | Generalized critical-path instead |

---

## Validation

- [`backend/tests/test_scheduling_repair_window.py`](../../backend/tests/test_scheduling_repair_window.py) — 10-task bounded window, strategy ≠ smoke, merge pinning
- 58 backend tests pass in CI
- BM-002 shows QAOA skipped when even full chain exceeds limits; tiny windows eligible when extracted

Review date: after A2 diversity metric lands (Q3 2026).

---

## References

- Code: [`backend/app/repair_window/scheduling.py`](../../backend/app/repair_window/scheduling.py), [`backend/app/pipeline.py`](../../backend/app/pipeline.py)
- Pattern source: [`backend/app/hospital/repair_window.py`](../../backend/app/hospital/repair_window.py)
- Track: [05-track-A-hybrid-optimizer.md](../05-track-A-hybrid-optimizer.md)
