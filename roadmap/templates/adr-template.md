# ADR Template — Architecture Decision Record

Copy to `roadmap/adrs/ADR-NNN-<slug>.md` when making significant technical decisions.

---

## ADR-NNN: [Title]

| Field | Value |
|-------|-------|
| **Status** | Proposed / Accepted / Deprecated / Superseded by ADR-XXX |
| **Date** | YYYY-MM-DD |
| **Deciders** | |
| **Epic** | e.g. A1, D1 |

---

## Context

What is the issue or forcing function? What constraints exist?

---

## Decision

What did we decide? Be specific and actionable.

---

## Consequences

### Positive

- 

### Negative / tradeoffs

- 

### Neutral

- 

---

## Alternatives considered

| Option | Pros | Cons | Why rejected |
|--------|------|------|--------------|
| | | | |

---

## Validation

How will we know this decision was correct? Metrics, benchmarks, review date.

---

## References

- Code: `path/to/file.py`
- Docs: link
- External: link

---

## Existing ADRs (index)

| ID | Title | Status |
|----|-------|--------|
| ADR-001 | Classical-first always; quantum never required for feasible response | Accepted |
| ADR-002 | Fixture replay default in production demos | Accepted |
| ADR-003 | Postgres + Redis for durable state | Proposed |
| ADR-004 | Scheduling local repair window extraction | Accepted |
| ADR-005 | Pluggable quantum adapter interface | Proposed |
| ADR-006 | Production hybrid solver choice (QAOA vs quantum-inspired) | Proposed |
| ADR-007 | Per-tenant API keys with row-level isolation | Proposed |

See [04-architecture-blueprint.md](../04-architecture-blueprint.md).
