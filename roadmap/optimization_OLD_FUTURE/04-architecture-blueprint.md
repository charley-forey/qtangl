# 04 — Architecture Blueprint

Current vs target architecture for Qtangl. Feeds Track G threat model and Track D implementation.

---

## Current architecture (as-built)

```mermaid
flowchart TB
  subgraph clients [Clients]
    Web[Next.js web / demos]
    API_Consumer[API consumers]
  end

  subgraph vercel [Vercel]
    WebApp[web/ Next.js 16]
  end

  subgraph railway [Railway]
    FastAPI[FastAPI backend]
    subgraph routers [Routers]
      Opt["/optimize"]
      Hosp["/hospital/*"]
      Air["/airline/*"]
      EV["/ev_fleet/*"]
      PQC["/pqc/*"]
    end
    subgraph solvers [Solvers]
      CPSAT[OR-Tools CP-SAT]
      QAOA[Qiskit Aer QAOA]
    end
    MemStore[(In-memory sessions jobs cache)]
  end

  Web --> WebApp
  WebApp --> FastAPI
  API_Consumer --> FastAPI
  Opt --> CPSAT
  Opt --> QAOA
  Hosp --> CPSAT
  Hosp --> QAOA
  PQC --> Scanner[Live TLS/SSH/JWKS scan]
  FastAPI --> MemStore
```

### Reusable vertical solve pattern

Every vertical implements the same orchestration:

```mermaid
sequenceDiagram
  participant API
  participant Classical as CP-SAT Classical
  participant RW as RepairWindow
  participant Hybrid as Hybrid QAOA or Fixture
  participant Out as Scoreboard AuditPack

  API->>Classical: Global solve full problem
  Classical->>RW: Detect bounded micro-window
  RW->>Hybrid: QUBO on window only
  Hybrid->>Out: Merge compare fallback
  Out->>API: Timeline diagnostics
```

**Reference implementations:**
- Generic (incomplete RW): [backend/app/pipeline.py](../backend/app/pipeline.py)
- Hospital: [backend/app/hospital/pipeline.py](../backend/app/hospital/pipeline.py)
- Airline: [backend/app/airline/pipeline.py](../backend/app/airline/pipeline.py)
- EV fleet: [backend/app/ev_fleet/pipeline.py](../backend/app/ev_fleet/pipeline.py)

---

## Target architecture (18-month)

```mermaid
flowchart TB
  subgraph clients [Clients]
    Web[Web SaaS dashboards]
    SDK[Python TS SDKs]
  end

  subgraph edge [Edge]
    CDN[Vercel CDN]
    WAF[WAF rate limit]
  end

  subgraph api [API tier]
    LB[Load balancer]
    FastAPI1[FastAPI instance N]
  end

  subgraph data [Data tier]
    PG[(Postgres tenants jobs reports)]
    Redis[(Redis queue cache)]
  end

  subgraph workers [Worker tier]
    ScanWorker[PQC scan workers]
    SolveWorker[Long solve workers]
  end

  subgraph quantum [Quantum adapters]
    Aer[Aer simulator]
    IBM[IBM Runtime opt-in]
    Fixture[Fixture trace replay]
  end

  subgraph obs [Observability]
    Logs[Structured logs]
    Traces[X-Request-Id tracing]
    Metrics[Prometheus or Datadog]
  end

  clients --> edge --> LB --> FastAPI1
  FastAPI1 --> PG
  FastAPI1 --> Redis
  Redis --> ScanWorker
  Redis --> SolveWorker
  SolveWorker --> Aer
  SolveWorker --> IBM
  SolveWorker --> Fixture
  FastAPI1 --> obs
```

---

## Canonical contract evolution

**Today:** [backend/app/models/canonical.py](../backend/app/models/canonical.py)

```python
ProblemType = Literal["schedule", "routing", "allocation"]
```

| Type | Parser | Pipeline | Status |
|------|--------|----------|--------|
| `schedule` | [backend/app/parsers/scheduling.py](../backend/app/parsers/scheduling.py) | [backend/app/pipeline.py](../backend/app/pipeline.py) | `pilot` |
| `routing` | [backend/app/parsers/routing.py](../backend/app/parsers/routing.py) | Not wired | `coming-soon` |
| `allocation` | [backend/app/parsers/allocation.py](../backend/app/parsers/allocation.py) | Not wired | `coming-soon` |

**Target (Track A3):**
- Extend `CanonicalProblem` with routing nodes/edges and allocation shifts/skills
- Single `run_optimization(problem)` dispatches by `problem.type`
- Vertical modules remain specialized wrappers over canonical types where needed

---

## Component responsibilities

| Component | Responsibility | Target owner |
|-----------|----------------|--------------|
| **Parsers** | Request JSON → `CanonicalProblem` | `backend/app/parsers/` |
| **Pipeline** | Orchestrate classical → RW → hybrid → merge | `backend/app/pipeline.py` + vertical `pipeline.py` |
| **Classical solvers** | Always run first; production default | `backend/app/solvers/classical.py` + vertical `solver_classical.py` |
| **QUBO builders** | Micro-window → quadratic program | `backend/app/qubo/`, vertical `solver_hybrid.py` |
| **Quantum adapter** | Pluggable: fixture / Aer / IBM Runtime | New: `backend/app/adapters/quantum/` (extend [backend/app/adapters/base.py](../backend/app/adapters/base.py)) |
| **Presentation** | API response shape | [backend/app/presentation.py](../backend/app/presentation.py) |
| **Audit** | Evidence packs | Vertical `audit.py` modules |

---

## Trust boundaries

```mermaid
flowchart LR
  subgraph untrusted [Untrusted]
    UserInput[User uploads scans targets]
    CustomerNet[Customer TLS endpoints]
  end

  subgraph dmz [Scanner DMZ]
    SSRF[assert_scannable allowlist]
    ScanWorker2[Isolated scan workers]
  end

  subgraph trusted [Trusted Qtangl]
    API2[Authenticated API]
    DB[(Tenant DB)]
  end

  UserInput --> API2
  API2 --> SSRF
  SSRF --> ScanWorker2
  ScanWorker2 --> CustomerNet
  API2 --> DB
```

**Track G must document:**
- SSRF controls: [backend/app/pqc/safety.py](../backend/app/pqc/safety.py)
- PHI flow: hospital roster uploads → encryption at rest → retention
- Tenant isolation: API key → tenant_id → row-level scope

---

## Deployment topology

| Environment | Backend | Web | Data |
|-------------|---------|-----|------|
| **Local** | `uvicorn app.main:app --reload` | `npm run dev` | In-memory |
| **Staging** | Railway staging project | Vercel preview | Postgres staging |
| **Production** | Railway prod | Vercel prod | Postgres + Redis prod |

**Env vars (critical):** See [backend/README.md](../backend/README.md) — `QTANGL_API_KEY`, `QTANGL_ENABLE_QAOA`, `QTANGL_PQC_ENABLE_LIVE_SCAN`, CORS origins.

---

## ADRs to write (use template)

| ID | Decision | Status |
|----|----------|--------|
| ADR-001 | Classical-first always; quantum never required for feasible response | Accepted (as-built) |
| ADR-002 | Fixture replay default in production demos | Accepted |
| ADR-003 | Postgres + Redis for durable state | Proposed (Track D) |
| ADR-004 | Pluggable quantum adapter interface | Proposed (Track A5) |
| ADR-005 | Per-tenant API keys with row-level isolation | Proposed (Track G/D) |

Template: [templates/adr-template.md](./templates/adr-template.md)

---

## Next doc

[05-track-A-hybrid-optimizer.md](./05-track-A-hybrid-optimizer.md)
