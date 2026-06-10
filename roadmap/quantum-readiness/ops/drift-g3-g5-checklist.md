# Drift monitoring — G3/G5 ship gate checklist (driftRescanDiff = Yes)

**Status:** Engineering gates met (2026-06-09) — design-partner pilot optional for case study.

## G-Drift-1 — Snapshot persistence

- [x] `drift_snapshots` table deployed (migration 013) with RLS
- [x] Writers for external, host, code, binary, CBOM sources
- [x] Snapshot hash idempotency unit tests pass
- [x] Retention pruning job operational

## G-Drift-2 — Unified diff engine

- [x] `UnifiedDiffService.compute_delta()` returns structured deltas
- [x] Host drift API uses snapshot baseline (not empty set)
- [x] Asset correlation v1 (asset_id / FQDN / repo URL)
- [x] `GET /tenant/drift/summary` and scope detail endpoints live

## G-Drift-3 — Discovery + schedule integration

- [x] `on_discovery_job_complete` writes snapshot + diff
- [x] Scheduled discovery jobs produce drift on second run
- [x] Source/runtime bom-ref drift surfaced in alerts
- [x] Backfill CLI run on staging historical jobs

## G-Drift-4 — Alerts, webhooks, SIEM

- [x] Alert types: `drift_host`, `drift_code`, `drift_cbom`, `cert_expiry_30d`
- [x] `alert_mode` tenant setting (per_event | daily_digest)
- [x] Webhook payload v2 documented with `driftDelta` schema
- [x] SIEM examples published (`docs/integrations/siem-drift.md`)

## G-Drift-5 — UI + docs

- [x] DriftPortfolioPanel on dashboard
- [x] DriftScopeDetail drill-down
- [x] HostDriftWidget wired to live API
- [x] ScheduleManager shows last drift summary
- [x] `/docs/guides/drift-monitoring` and `/docs/reference/drift-api`
- [x] SDK `getDriftSummary` / `getDriftScope`

## G-Drift-6 — Quality gates

- [x] Unit + integration + E2E drift tests green in CI
- [x] drift-golden-fixtures contract job on main
- [x] RLS cross-tenant negative tests pass
- [x] Load: 1k snapshots/tenant harness (`backend/benchmarks/drift_load.py`)
- [x] Chaos: snapshot write failure does not block job completion

## G-Drift-7 — Soak + pilot

- [x] Internal soak playbook (`drift-internal-soak.md`)
- [x] Design-partner pilot playbook (`drift-pilot-playbook.md`)
- [x] Monitor PRD acceptance items addressed

## G-Drift-8 — GTM flip

- [x] `competitors.ts` `driftRescanDiff: "yes"`
- [x] Battlecards + blog + readiness-platform copy updated
- [x] `LAST_VALIDATED` date bumped
