# Epics Register

Master list of all epics across tracks A–J, I, G, H, E, F, B, C, D. Update status weekly.

**Status:** `not-started` | `in-progress` | `blocked` | `done`  
**Effort:** S (1–2 wk) | M (2–4 wk) | L (4–8 wk)

---

## Track A — Hybrid Optimizer

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| A1 | Local repair window extractor | done | L | I1 | — |
| A2 | Diversity / alternates headline metric | done | M | A1 | — |
| A3 | `/optimize` routing + allocation live | done | L | A1 | — |
| A4 | QAOA robustness + envelope expansion | not-started | M | A1, J2 | — |
| A5 | Reproducible real-QPU opt-in path | not-started | M | A4, I1 | — |

## Track B — PQC Product

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| B1 | Harden live scan production path | done | M | G1 | — |
| B2 | CBOM export standardization | done | S | — | — |
| B3 | Continuous monitoring / scheduled re-scans | not-started | M | B1, D1 | — |
| B4 | Remediation workflow tracking | not-started | M | B2, D1 | — |
| B5 | Compliance mapping + report packs | done | M | B2 | — |
| B6 | Design-partner pilot package | done | S | B1–B5, H1 | — |
| B7 | Enterprise PDF report + live scan quality (coverage split, readiness bands, on-page download) | done | M | B1, B5 | — |

## Track C — Validation

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| C1 | Fill benchmark table (committed results) | done | M | A1, A2 | — |
| C2 | Falsifiable success metric definition | done | S | A2 | — |
| C3 | Determinism & reproducibility tests | done | M | I1 | — |
| C4 | Fixture vs live tolerance tests | not-started | M | A5 | — |
| C5 | Load & performance tests | not-started | M | D1 | — |

## Track D — Enterprise Scale

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| D1 | Persistent stores (Postgres + Redis) | done | L | G2 | — |
| D2 | Async job workers | in-progress | M | D1 | — |
| D3 | Observability (tracing, logs, metrics) | not-started | M | I1 | — |
| D4 | OpenAPI + Postman collection | not-started | S | — | — |
| D5 | Official SDKs (Python + TypeScript) | not-started | M | D4 | — |
| D6 | Horizontal scaling + health checks | not-started | M | D1, D2 | — |

## Track E — GTM

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| E1 | PQC design-partner program | not-started | M | B6, G3 | — |
| E2 | Hospital optimization design partners | not-started | M | A1, H2 | — |
| E3 | Demo recording + sales assets | in-progress | S | — | — |
| E4 | Pricing & packaging v1 | not-started | S | — | — |
| E5 | Partnerships & channel | not-started | M | B1 | — |
| E6 | DevRel / content / community | in-progress | M | C1 | — |

## Track F — Business Ops

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| F1 | Fundraising narrative + deck | not-started | M | C1, E1 | — |
| F2 | First key hires plan | not-started | S | — | — |
| F3 | IP & research credibility | not-started | M | A1, C1 | — |
| F4 | Operating cadence | not-started | S | — | — |
| F5 | Legal & corporate basics | not-started | M | G3 | — |

## Track G — Security & Compliance

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| G1 | Secrets management & hygiene | in-progress | S | — | — |
| G2 | Product threat model | done | M | — | — |
| G3 | Per-tenant auth & data isolation | done | M | D1 | — |
| G4 | Data governance & retention | not-started | M | G3 | — |
| G9 | Safe logging & error responses (PHI redaction) | not-started | S | G2 | — |
| G5 | SOC 2 Type I → Type II | not-started | L | G1–G4 | — |
| G6 | Vertical compliance (HIPAA, CMMC) | not-started | L | G5 | — |
| G7 | Dogfood PQC (Qtangl secures Qtangl) | in-progress | S | B1 | — |
| G8 | Responsible disclosure program | not-started | S | — | — |

## Track H — Product & Onboarding

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| H1 | Tenant accounts & auth UX | in-progress | M | G3 | — |
| H2 | Customer data ingestion | not-started | M | H1 | — |
| H3 | Tenant dashboards | done | L | H1, D1 | — |
| H4 | Demo → pilot → production lifecycle | not-started | S | H1 | — |
| H5 | Self-serve PQC signup (v1) | not-started | M | B1, H1, G4 | — |

## Track I — Engineering Operating Model

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| I1 | CI/CD pipeline | in-progress | M | — | — |
| I2 | Dependency pinning & reproducibility | done | S | — | — |
| I3 | Environment strategy | not-started | S | — | — |
| I4 | Branching, release, versioning | not-started | S | I1 | — |
| I5 | Test strategy & coverage targets | not-started | M | I1 | — |
| I6 | Agent/worktree workflow formalization | not-started | S | — | — |
| I7 | Definition of done | not-started | S | — | — |

## Track J — Solver Research

| ID | Epic | Status | Effort | Depends | Owner |
|----|------|--------|--------|---------|-------|
| J1 | Research evaluation framework | done | M | I2 | — |
| J2 | QAOA improvements (warm-start) | not-started | M | A1 | — |
| J3 | Quantum annealing path (D-Wave) | not-started | M | J1 | — |
| J4 | Quantum-inspired solvers | not-started | M | J1 | — |
| J5 | Library mining pipeline | not-started | M | J1 | — |
| J6 | Publish honest results | not-started | S | C1, J2–J4 | — |

---

## Critical path epics (must not slip)

1. **I1** → **G1** → **A1** → **B1** → **E1** (first revenue)
2. **A1** → **A2** → **C1** (credibility)
3. **D1** → **G3** → **H1** (enterprise)
4. **J1** → **J2/J4** → **A4** (solver path decision)

---

## Epic detail docs

| Track | Document |
|-------|----------|
| A | [05-track-A-hybrid-optimizer.md](../05-track-A-hybrid-optimizer.md) |
| B | [06-track-B-pqc-product.md](../06-track-B-pqc-product.md) |
| C | [07-track-C-validation.md](../07-track-C-validation.md) |
| D | [08-track-D-enterprise-scale.md](../08-track-D-enterprise-scale.md) |
| E | [09-track-E-gtm.md](../09-track-E-gtm.md) |
| F | [10-track-F-business-ops.md](../10-track-F-business-ops.md) |
| G | [11-track-G-security-trust-compliance.md](../11-track-G-security-trust-compliance.md) |
| H | [12-track-H-product-and-onboarding.md](../12-track-H-product-and-onboarding.md) |
| I | [13-track-I-engineering-operating-model.md](../13-track-I-engineering-operating-model.md) |
| J | [14-track-J-solver-research.md](../14-track-J-solver-research.md) |
