# Action Items

Granular checkbox backlog. Each item has an ID, epic link, acceptance criterion, and file pointers. Check off as completed.

**Format:** `- [ ] **ID** Description → files | acceptance`

---

## Phase 0 — Foundation (Weeks 1–4)

### I1 — CI/CD

- [x] **I1-001** Create `.github/workflows/ci.yml` with backend pytest job → `backend/tests/` | CI runs on PR
- [x] **I1-002** Add web lint + build job to CI → `web/package.json` | `npm run lint && npm run build` pass
- [x] **I1-003** Add gitleaks job to CI → `.github/workflows/ci.yml` | Fails on secret pattern in diff
- [x] **I1-004** Configure branch protection on `main` requiring CI pass → GitHub settings | Documented in CONTRIBUTING.md; enable in GitHub UI
- [x] **I1-005** Document local test commands in root `CONTRIBUTING.md` → new file | Matches CI steps

### I2 — Dependency pinning

- [x] **I2-001** Add `pip-tools`; generate `backend/requirements.lock` from `requirements.txt` → `backend/requirements.txt` | Lockfile committed
- [x] **I2-002** Pin qiskit ecosystem to tested versions in lock → lockfile | QAOA demo runs on clean venv
- [x] **I2-003** CI installs from lockfile not loose requirements → `.github/workflows/ci.yml` | Reproducible CI
- [x] **I2-004** Create `backend/.env.example` with all vars documented → `backend/README.md` | No secrets in example

### G1 — Secrets hygiene

- [ ] **G1-001** Rotate Cursor API key and GitHub token if ever shared → local `.env` | Old tokens invalidated *(manual — see [secrets-runbook.md](../security/secrets-runbook.md))*
- [x] **G1-002** Verify `.env` in `.gitignore`; run gitleaks on full history → `.gitignore`, `.gitleaks.toml` | Clean scan (doc placeholders allowlisted)
- [x] **G1-003** Document Railway/Vercel secret setup runbook → `roadmap/security/secrets-runbook.md` | Runbook exists
- [x] **G1-004** Add secret rotation procedure (90-day API keys) → `roadmap/security/secrets-runbook.md` | Procedure written

### G2 — Threat model

- [x] **G2-001** Write threat model v1 covering PQC scanner SSRF, uploads, auth → `roadmap/security/threat-model.md` | High threats listed
- [x] **G2-002** Map existing controls: `assert_scannable`, rate limits, API key → `backend/app/pqc/safety.py`, `auth.py` | Control matrix complete
- [x] **G2-003** Review threat model; create epics for unmitigated High items → `backlog/epics.md` | No unowned High threats

### C1-partial — Benchmark baseline

- [x] **C1-001** Run `backend/examples/compare_schedule_solvers.py` on tiny schedule → script | Output captured
- [x] **C1-002** Run `backend/benchmarks/hospital_harness.py` → script | Output JSON saved
- [x] **C1-003** Run `backend/benchmarks/pqc_harness.py` → script | Output JSON saved
- [x] **C1-004** Create `backend/benchmarks/results/` directory with README → new dir | Structure committed

---

## Phase 1 — Keystone + PQC (Weeks 5–12)

### A1 — Local repair window extractor

- [x] **A1-001** Read hospital repair window: `backend/app/hospital/repair_window.py` | Notes on pattern
- [x] **A1-002** Create `backend/app/repair_window/scheduling.py` with extraction interface | Module imports cleanly
- [x] **A1-003** Implement critical-path neighborhood detection from CP-SAT result | Unit test with 10-task fixture
- [x] **A1-004** Implement QUBO size bounding loop (shrink window until ≤ max vars) | Uses `estimate_scheduling_qubo_size`
- [x] **A1-005** Replace `whole_problem_smoke` in `detect_local_repair_window()` → `backend/app/pipeline.py` | Strategy != smoke for large jobs
- [x] **A1-006** Extend `merge_local_repair()` to pin non-window tasks to classical assignment | Non-window tasks unchanged in test
- [x] **A1-007** Add `backend/tests/test_scheduling_repair_window.py` with 3 cases | All pass in CI
- [x] **A1-008** Update diagnostics JSON to include window task IDs and QUBO size | API response verified
- [x] **A1-009** Write ADR-004 for repair window algorithm → `roadmap/adrs/ADR-004-scheduling-repair-window.md` | ADR committed

### B1 — PQC live scan harden

- [x] **B1-001** Audit all code paths calling `scan_live()` → `backend/app/pqc/scanner.py` | Path list documented
- [x] **B1-002** Add integration test: scan `test.openquantumsafe.org:443` → `backend/tests/test_pqc_scanner.py` | Passes when live enabled
- [x] **B1-003** Add SSRF regression tests for RFC1918, localhost, metadata IP → `backend/tests/test_pqc_safety.py` | All blocked
- [x] **B1-004** Enforce scan timeout in test (no hang > timeout+5s) → safety tests | Passes
- [x] **B1-005** Add UI toggle for live scan with authorization copy → `web/app/demo/pqc/` | User must confirm
- [x] **B1-006** Update production runbook in `backend/README.md` for live scan env vars | Documented

### B2 — CBOM standardization

- [x] **B2-001** Document CBOM schema version used in export → `backend/app/pqc/report.py` | Schema ID in export metadata
- [x] **B2-002** Validate sample CBOM against CycloneDX conventions | Validation script or manual checklist
- [x] **B2-003** Add CBOM sample to `demos/pqc_migration/data/` | Sample file committed
- [x] **B2-004** Update demo script CBOM handoff step → `demos/pqc_migration/script.md` | Script updated

### B5 — Compliance report packs

- [x] **B5-001** Add framework mapping section to PDF export for 3 scenarios → `backend/app/pqc/report.py` | PDF includes mapping
- [x] **B5-002** Verify Mosca assessment prominent in report → `backend/app/pqc/risk.py` | Visible in PDF JSON
- [x] **B5-003** Include handshake proof appendix in report → `backend/app/pqc/handshake.py` | Appendix present

### B6 — Design-partner pilot package

- [x] **B6-001** Pilot SOW template → `roadmap/templates/pqc-pilot-sow.md` | Template committed
- [x] **B6-002** CRM log for PQC outreach → `demos/pqc_migration/outreach/crm-log.md` | Log template ready

### E3 — Demo recordings

- [ ] **E3-001** Record hospital call-out demo (3–5 min) per `demos/hospital_restaffing/script.md` | Video file or Loom link *(manual)*
- [ ] **E3-002** Record PQC scan + handshake demo per `demos/pqc_migration/script.md` | Video file or Loom link *(manual)*
- [x] **E3-003** Embed or link recordings from demo pages → `web/app/demo/hospital/`, `web/app/demo/pqc/` | Clickable from site

### E1 — First PQC pilot

- [ ] **E1-001** Send 10 PQC outbound emails using `demos/pqc_migration/outreach/cold_email.md` | Log in CRM *(template: `outreach/crm-log.md`)*
- [ ] **E1-002** Complete 2 PQC demos with live or fixture scan | Demo notes captured *(manual)*
- [x] **E1-003** Draft pilot SOW from B6 template | SOW ready for signature
- [ ] **E1-004** Sign first PQC pilot contract | **Milestone: first revenue**

---

## Phase 2 — Credibility + Pilots (Weeks 13–24)

### A2 — Diversity metric

- [x] **A2-001** Add `distinctFeasiblePlans`, `diversityScore` to result models → `backend/app/models/results.py` | Fields in API types
- [x] **A2-002** Compute diversity in hospital pipeline → `backend/app/hospital/pipeline.py` | Scoreboard includes metric
- [x] **A2-003** Propagate to airline and EV pipelines → `airline/pipeline.py`, `ev_fleet/pipeline.py` | Consistent columns
- [x] **A2-004** Update web scoreboard components to display diversity | Hospital/airline/EV UI | Visible in demo
- [x] **A2-005** Add glossary entries → `web/lib/docs/glossary.ts` | Terms defined

### C1 — Benchmark table public

- [x] **C1-010** Define BM-001 through BM-006 instance JSON → `backend/benchmarks/instances/` | 6 instances committed
- [x] **C1-011** Run all 6; commit results → `backend/benchmarks/results/` | No "Pending" in README
- [x] **C1-012** Update `backend/README.md` benchmark table with real numbers | Table complete
- [x] **C1-013** Add CI job for BM-001, BM-003, BM-006 on PR → `.github/workflows/ci.yml` | Regression in CI

### C2 — Success metric

- [x] **C2-001** Implement success metric calculation in harness → `backend/benchmarks/` | JSON includes `successMetric: true/false`
- [x] **C2-002** Document metric in `roadmap/16-metrics-and-kpis.md` | Already drafted — verify after run

### C3 — Reproducibility

- [x] **C3-001** Add `test_qaoa_reproducibility.py` with fixed seed 10-run stability | Test passes on BM-001
- [x] **C3-002** Add golden JSON snapshot for hospital fixture hybrid distribution | Snapshot test passes

### J1 — Research harness

- [x] **J1-001** Create `backend/research/eval_harness.py` with solver parameter | Runs cp-sat + qaoa on same instance
- [x] **J1-002** Add CLI: `python -m research.eval_harness --instance BM-003 --solver all` | CLI works
- [x] **J1-003** Write first 3 library repo notes → `roadmap/research/notes/` | openqaoa, dwave-neal, mitiq

### E2 — Hospital pilot

- [ ] **E2-001** Send 10 hospital outbound per `demos/hospital_restaffing/outreach/` | CRM log *(template: `outreach/crm-log.md`)*
- [ ] **E2-002** Complete 2 hospital demos with scoreboard walkthrough | Demo notes
- [ ] **E2-003** Sign BAA or use de-identified roster → legal | Data path clear
- [ ] **E2-004** Active hospital pilot with ≥10 real call-out solves | **Milestone**

### E6 — Content

- [x] **E6-001** Publish blog: "When classical wins" with benchmark data | `web/app/blog/` | Live post
- [x] **E6-002** Publish blog: PQC inventory walkthrough | `web/app/blog/q-day-readiness/` or new | Live post

---

## Phase 3 — Enterprise MVP (Weeks 25–36)

### D1 — Postgres + Redis

- [ ] **D1-001** Add SQLAlchemy + Alembic; define schema: tenants, api_keys, scan_jobs, scan_results, upload_sessions | Migrations run
- [ ] **D1-002** Replace `_report_cache` with Postgres → `backend/app/api/pqc.py` | Report survives restart
- [ ] **D1-003** Migrate PQC jobs to Redis queue → `backend/app/pqc/jobs.py` | Async scan works multi-instance
- [ ] **D1-004** Migrate all `sessions.py` modules to Postgres | 24h TTL enforced in DB
- [ ] **D1-005** Add `DATABASE_URL`, `REDIS_URL` to env docs | README updated

### G3 — Tenant isolation

- [ ] **G3-001** Implement tenant + api_key tables and validation → `backend/app/auth.py` | Invalid key → 401
- [ ] **G3-002** Add tenant_id to all customer-data queries | Cross-tenant read test fails
- [ ] **G3-003** Admin endpoint to create/revoke keys | Manual test

### H1 — Tenant accounts

- [ ] **H1-001** Build signup flow → `web/app/access/` or new `web/app/dashboard/` | Email verify → key issued
- [ ] **H1-002** Keep public sandbox demo key separate | Sandbox still works

### H3 — Dashboards

- [ ] **H3-001** Dashboard overview: last scans, last solves | `web/app/dashboard/` | Renders with tenant data
- [ ] **H3-002** PQC report download from dashboard | One-click PDF/CBOM

### D4–D5 — OpenAPI + SDKs

- [ ] **D4-001** Export `backend/openapi.json` in CI | File generated on release
- [ ] **D5-001** Create Python package skeleton `sdk/python/` | `pip install -e .` works
- [ ] **D5-002** Generate TS client from OpenAPI → `sdk/typescript/` | Used in web/lib/api.ts optional path

### B3 — Scheduled scans

- [ ] **B3-001** Cron worker for scheduled PQC scans | Worker + DB schedule table
- [ ] **B3-002** Diff report vs previous scan | Delta in API response

---

## Phase 4 — Scale + Research (Weeks 37–52)

### A5 — Real QPU

- [ ] **A5-001** Implement `QuantumAdapter` interface → `backend/app/adapters/base.py` | fixture|aer|ibm
- [ ] **A5-002** Wire IBM Runtime path with fallback chain | Diagnostic on fallback
- [ ] **A5-003** Run one real QPU job on hospital micro-window | Trace committed to fixtures
- [ ] **A5-004** Write runbook: `capture_qpu_trace.py` refresh procedure | README section

### A4 — QAOA robustness

- [ ] **A4-001** Implement warm-start from classical assignment → `backend/app/solvers/qaoa.py` | ADR with results
- [ ] **A4-002** Add simulated annealing fallback on QUBO | Fallback chain in qaoa.py

### J2–J4 — Solver research

- [ ] **J2-001** Warm-start experiment logged in `backend/benchmarks/results/research/` | Pass/fail vs cold start
- [ ] **J3-001** Integrate dwave-neal in eval harness | Comparison table BM-003
- [ ] **J4-001** Integrate SA + tabu in eval harness | 5 solver types total
- [ ] **J6-001** Publish whitepaper: honest hybrid benchmarks | PDF or long-form blog

### G5 — SOC2 Type I

- [ ] **G5-001** Select Vanta/Drata or auditor | Vendor contracted
- [ ] **G5-002** Implement required controls (access, logging, backup) | Control checklist 100%
- [ ] **G5-003** Complete Type I audit | Report received

### G7 — Dogfood

- [x] **G7-001** Weekly CI job: PQC scan qtangl.com | Scheduled workflow
- [ ] **G7-002** Remediate any critical findings on owned infra | Zero critical OR plan

---

## Phase 5 — Growth (Months 13–18)

### H5 — Self-serve PQC

- [ ] **H5-001** Signup → fixture scan → report in <10 min | E2E test
- [ ] **H5-002** Stripe or manual invoice for Monitor tier | Payment flow
- [ ] **H5-003** Terms of service + privacy policy published | Legal pages live

### A3 — Routing + allocation

- [ ] **A3-001** Wire routing parser to pipeline → remove NotImplementedError | POST /optimize routing works
- [ ] **A3-002** Wire allocation parser to pipeline | POST /optimize allocation works
- [ ] **A3-003** API tests + docs update | Reference pages updated

### F1 — Series A prep

- [ ] **F1-001** Update deck with $1M ARR metrics | Deck v3
- [ ] **F1-002** 2 published case studies with customer quotes | Web + PDF

---

## Ongoing (every sprint)

- [ ] **OPS-001** Weekly review using `templates/weekly-review-template.md` | Notes archived
- [ ] **OPS-002** Update `backlog/epics.md` statuses | Current
- [ ] **OPS-003** Review `backlog/risk-register.md` triggers | No unmitigated critical
- [ ] **OPS-004** Sync public roadmap bands quarterly → `web/lib/docs/roadmap.ts` | Bands match phase

---

## Item count summary

| Phase | Items |
|-------|-------|
| Phase 0 | 18 |
| Phase 1 | 27 |
| Phase 2 | 22 |
| Phase 3 | 18 |
| Phase 4 | 14 |
| Phase 5 | 9 |
| Ongoing | 4 |
| **Total** | **~112** |

Add new items with next sequential ID per epic. Link PRs to item IDs in commit messages when possible.
