# Remediation program — G3/G5 ship gate checklist (remediationWorkflow = Yes)

**Status:** Engineering gates met (2026-06-09) — 30-day Convert partner pilot recommended for case study.

## G-Rem-1 — Program data model

- [x] `remediation_program_items` table deployed (migration 014)
- [x] CRUD APIs: list, update, create (accepted_risk)
- [x] Legacy `remediation_status` migrated to program items
- [x] Auto-ingest from scan + discovery findings on complete

## G-Rem-2 — Discovery linkage + playbooks

- [x] Host/code/binary findings linked as program items with deep links
- [x] Playbook templates: TLS hybrid KEX, JWKS, SSH, code signing, JVM cacerts
- [x] `GET /tenant/remediation/program/{id}/playbook`
- [x] Owner recommendations and what-if at program scope

## G-Rem-3 — Multi-source verify

- [x] Verify dispatch for external, host, code, binary source types
- [x] VerificationProof entity with evidence hash + signed verify URL
- [x] Auto-close when verify delta confirms finding removed
- [x] `accepted_risk` requires note + audit event

## G-Rem-4 — Jira + ServiceNow bi-sync (required at launch)

- [x] ITSMSyncWorker polls open sync rows every 5 min
- [x] Jira push with program_item_id; pull maps workflow → Qtangl status
- [x] ServiceNow push with assignment group; Table API pull
- [x] Conflict resolution with synced_at + audit
- [x] Retry/backoff + DLQ for failed syncs
- [x] WireMock-style integration tests (status mapping unit tests)

## G-Rem-5 — Partner RBAC + audit

- [x] Partner role scoped to child tenants only
- [x] `log_action` on all remediation mutations
- [x] Export includes program completion % + item status

## G-Rem-6 — UI

- [x] RemediationProgramBoard (table, filters, status update)
- [x] ITSM sync via sync_store indicators (API fields)
- [x] Verify flow with job dispatch
- [x] Playbook drawer + velocity widget

## G-Rem-7 — Quality gates

- [x] Unit + E2E remediation-program tests
- [x] remediation-golden-fixtures (playbook + status mapping)
- [x] Load harness documented for 10k items

## G-Rem-8 — Pilot + evidence

- [x] Pilot playbook in ops docs
- [x] SOC2 remediation audit sampling (`docs/compliance/remediation-audit-sampling.md`)
- [x] Convert PRD FR-C1–C10 engineering acceptance

## G-Rem-9 — GTM flip

- [x] `competitors.ts` `remediationWorkflow: "yes"`
- [x] Battlecards + Convert tier copy + blog updated
- [ ] Regenerate comparison PDF (run `web/scripts/generate-comparison-guide-pdf.mjs`)
