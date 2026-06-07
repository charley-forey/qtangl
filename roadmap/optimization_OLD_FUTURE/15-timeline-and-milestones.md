# 15 — Timeline & Milestones

Phased implementation plan with gates, aligned to [web/lib/docs/roadmap.ts](../web/lib/docs/roadmap.ts) Now/Next/Later bands.

**Start date assumption:** 2026-06-01 (adjust as needed)

---

## Phase overview

| Phase | Name | Duration | Theme |
|-------|------|----------|-------|
| **0** | Foundation | Weeks 1–4 | CI, secrets, benchmark baseline |
| **1** | Keystone + PQC harden | Weeks 5–12 | A1 repair window + B1–B2 + first PQC pilot |
| **2** | Credibility + pilots | Weeks 13–24 | Diversity metric, benchmarks public, 2–3 paying pilots |
| **3** | Enterprise MVP | Weeks 25–36 | Persistence, tenancy, dashboards, SDK |
| **4** | Scale + research | Weeks 37–52 | Real QPU, solver research publish, SOC2 Type I |
| **5** | Growth | Months 13–18 | Self-serve PQC, Series A prep, vertical expansion |
| **4b** | Evidence moat (Track K) | Weeks 16–32 (parallel Phase 2–3) | Transparency log GA, Readiness Passport, CBOM aggregation |

---

## Track K — Evidence layer epics (K16 / K17)

Cross-cutting readiness moat work, parallel to Phase 2–3. Detail: [09-epics-and-backlog.md](../quantum-readiness/09-epics-and-backlog.md), rollout: [evidence-layer-rollout.md](../quantum-readiness/runbooks/evidence-layer-rollout.md).

| ID | Epic | Phase | Effort | Owner | Depends on |
|----|------|-------|--------|-------|------------|
| **K16** | Evidence & Trust Layer (transparency log, key registry, passport, open verify) | Phase 2–3 (Weeks 16–28) | M (3–4 wk) | Eng (PQC) | D1 Postgres, B2 signing stable |
| **K17** | CBOM Aggregation & Ingestion (provenance, merge/dedupe, cloud import) | Phase 3–4 (Weeks 24–32) | M (3–4 wk) | Eng (PQC) | K16-001 log live, B2 CBOM |

### K16 deliverables & gates

| ID | Deliverable | Owner | Target week |
|----|-------------|-------|-------------|
| K16-001 | Alembic `004_evidence_layer` applied; `QTANGL_ENABLE_TRANSPARENCY_LOG=true` in staging | Eng | 16 |
| K16-002 | Stable signing keys (env or persisted); key registry endpoint live | Eng | 17 |
| K16-003 | Transparency log append on every sign; backfill script run once | Eng | 18 |
| K16-004 | `/verify` returns `logInclusion`; verify page shows seq + root | Eng + Web | 19 |
| K16-005 | `qtangl_verify.py` + [verify-spec.md](../../docs/verify-spec.md) published | Eng | 20 |
| K16-006 | Readiness Passport MVP (ShareLink + evidence bundle) | Eng + Product | 24 |
| K16-007 | Log root anchoring + trust center section | Eng + GTM | 26 |

**K16 gate:** ≥1 design-partner auditor verifies a report offline (CLI or `/verify`) and cites log inclusion.

### K17 deliverables & gates

| ID | Deliverable | Owner | Target week |
|----|-------------|-------|-------------|
| K17-001 | CBOM upload with `source` / `provenance` tags | Eng | 24 |
| K17-002 | Merge/dedupe across Qtangl scan + imported CBOM | Eng | 26 |
| K17-003 | Unverified-source labeling in reports | Eng + Product | 27 |
| K17-004 | AWS ACM / Azure KV scheduled import (read-only creds) | Eng | 28 |
| K17-005 | CycloneDX 1.6 + 1.7 validation on import | Eng | 30 |

**K17 gate:** ≥1 tenant with merged CBOM (Qtangl scan + external import) and signed merged report in transparency log.

---

## Gantt (high level)

```mermaid
gantt
  title Qtangl Implementation Timeline
  dateFormat YYYY-MM-DD
  axisFormat %b %Y

  section Phase0
  CI_CD_and_pinning           :p0a, 2026-06-01, 14d
  Secrets_and_threat_model    :p0b, 2026-06-01, 21d
  Benchmark_baseline          :p0c, 2026-06-08, 14d

  section Phase1
  A1_repair_window            :p1a, 2026-06-22, 35d
  B1_PQC_live_harden          :p1b, 2026-06-22, 28d
  B2_CBOM_standard            :p1c, 2026-07-20, 14d
  First_PQC_pilot             :milestone, p1m, 2026-09-15, 0d

  section Phase2
  A2_diversity_metric         :p2a, 2026-09-01, 21d
  C1_benchmark_table_public   :p2b, 2026-09-15, 21d
  E1_E2_design_partners       :p2c, 2026-08-01, 90d
  K16_evidence_trust_layer    :k16, 2026-09-15, 42d
  Hospital_pilot              :milestone, p2m, 2026-11-01, 0d

  section Phase3
  D1_postgres_redis           :p3a, 2026-11-01, 35d
  G3_tenant_isolation         :p3b, 2026-11-15, 28d
  H1_H3_dashboards            :p3c, 2026-12-01, 45d
  D5_SDKs                     :p3d, 2026-12-15, 28d
  K17_cbom_aggregation        :k17, 2026-12-01, 56d

  section Phase4
  A5_real_QPU                 :p4a, 2027-02-01, 28d
  J2_J4_solver_research       :p4b, 2027-01-01, 60d
  G5_SOC2_Type_I              :p4c, 2027-02-15, 90d
  ARR_500K                    :milestone, p4m, 2027-05-01, 0d

  section Phase5
  H5_self_serve_PQC           :p5a, 2027-05-01, 45d
  A3_routing_allocation       :p5b, 2027-05-01, 60d
  Series_A_ready              :milestone, p5m, 2027-11-01, 0d
```

---

## Phase 0 — Foundation (Weeks 1–4)

### Goals

Establish engineering baseline before feature velocity.

### Deliverables

| ID | Deliverable | Track |
|----|-------------|-------|
| I1 | GitHub Actions CI (pytest + web build) | I |
| I2 | Pinned requirements.lock | I |
| G1 | Secrets hygiene + gitleaks | G |
| G2 | Threat model v1 | G |
| C1-partial | Run harnesses; draft benchmark JSON | C |

### Gate to Phase 1

- [ ] CI green on main
- [ ] No secrets in git history (gitleaks pass)
- [ ] Threat model reviewed
- [ ] At least 3 benchmark instances have local results

---

## Phase 1 — Keystone + PQC Harden (Weeks 5–12)

### Goals

Implement A1 (repair window) and harden PQC for first revenue.

### Deliverables

| ID | Deliverable | Track |
|----|-------------|-------|
| A1 | Local repair window extractor live | A |
| B1 | Live PQC scan production-hardened | B |
| B2 | CBOM export validated | B |
| B5 | Compliance-mapped report packs | B |
| E3 | PQC + hospital demo recordings | E |

### Milestone: First PQC pilot signed (~Week 12)

### Gate to Phase 2

- [ ] A1 merged with tests
- [ ] Live PQC scan on customer domain in staging
- [ ] ≥1 signed pilot SOW (PQC)
- [ ] Demo recordings published

---

## Phase 2 — Credibility + Pilots (Weeks 13–24)

### Goals

Public benchmarks, diversity metric, 2–3 paying pilots, hospital pilot started.

### Deliverables

| ID | Deliverable | Track |
|----|-------------|-------|
| A2 | Diversity metric all verticals | A |
| C1 | Benchmark table public (no Pending rows) | C |
| C2 | Falsifiable success metric documented | C |
| E1 | 2 PQC paying customers | E |
| E2 | 1 hospital pilot active | E |
| J1 | Research eval harness | J |

### Milestone: $250K ARR run-rate (~Week 24)

### Gate to Phase 3

- [ ] Benchmark blog published
- [ ] Hospital pilot on real or de-identified roster
- [ ] BAA signed if PHI used
- [ ] Research harness runs 3 solver types

---

## Phase 3 — Enterprise MVP (Weeks 25–36)

### Goals

Multi-tenant production infrastructure and customer dashboards.

### Deliverables

| ID | Deliverable | Track |
|----|-------------|-------|
| D1 | Postgres + Redis | D |
| D2 | Async workers | D |
| G3 | Per-tenant API keys | G |
| H1 | Tenant accounts | H |
| H3 | Dashboards MVP | H |
| D4–D5 | OpenAPI + Python/TS SDKs | D |
| B3 | Scheduled PQC re-scans | B |
| K16 | Evidence & Trust Layer (transparency log GA) | K |
| K17-partial | CBOM import + provenance tags | K |

### Milestone: 3 production tenants (~Week 36)

### Gate to Phase 4

- [ ] Two API instances share state correctly
- [ ] SDK quickstart works against staging
- [ ] SOC2 readiness assessment started

---

## Phase 4 — Scale + Research (Weeks 37–52)

### Goals

Real QPU credibility, published research, SOC2 Type I, $500K ARR.

### Deliverables

| ID | Deliverable | Track |
|----|-------------|-------|
| A5 | Documented real-QPU run | A |
| A4 | QAOA robustness improvements | A |
| J2–J4 | Solver comparison published | J |
| G5 | SOC2 Type I report | G |
| G7 | Qtangl self-scan clean | G |
| B4 | Remediation workflow | B |

### Milestone: $500K ARR + SOC2 Type I (~Week 52)

### Gate to Phase 5

- [ ] Whitepaper published
- [ ] SOC2 Type I complete
- [ ] Real QPU trace in fixtures with runbook

---

## Phase 5 — Growth (Months 13–18)

### Goals

Self-serve PQC, routing/allocation GA, Series A narrative.

### Deliverables

| ID | Deliverable | Track |
|----|-------------|-------|
| H5 | Self-serve PQC signup | H |
| A3 | `/optimize` routing + allocation | A |
| E5 | 1 technology partnership (IBM/OQS) | E |
| F1 | Series A deck with metrics | F |
| G6 | CMMC report mapping GA | G |

### Milestone: Series A ready (~Month 18)

- [ ] $1M ARR run-rate or clear path
- [ ] 2 case studies published
- [ ] Multi-tenant SaaS operational

---

## Mapping to public roadmap bands

| Public band ([roadmap.ts](../web/lib/docs/roadmap.ts)) | Internal phase |
|--------------------------------------------------------|----------------|
| **Now** | Phase 0–1 (schedule GA, hospital pilot, PQC pilot, docs GA) |
| **Next** | Phase 2–3 (routing, allocation, local repair, SDKs) |
| **Later** | Phase 4–5 (OpenAPI, tracing, SOC2, Postman) |

Update public bands each quarter from this doc.

---

## Definition of done (per phase)

Each phase gate requires:
1. All phase deliverables acceptance criteria met
2. Epic statuses updated in [backlog/epics.md](./backlog/epics.md)
3. Risk register reviewed
4. KPI snapshot captured in [16-metrics-and-kpis.md](./16-metrics-and-kpis.md)
5. Weekly review notes archived

---

## Related docs

- Strategy: [03-strategy-and-priorities.md](./03-strategy-and-priorities.md)
- Metrics: [16-metrics-and-kpis.md](./16-metrics-and-kpis.md)
- Financial: [17-financial-model.md](./17-financial-model.md)
