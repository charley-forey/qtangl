# Qtangl SDK changelog

## 0.9.1 — 2026-06-14

Monitor + CBOM resource groups, drift/remediation resources, React hooks package, dashboard SDK bootstrap, local smoke in CI.

### Added

- **`client.monitor`** — settings, integrations, webhooks (incl. DLQ replay), schedule patch/delete/runs
- **`client.drift`** — summary, scope, history, intel
- **`client.remediation`** — scan-scoped remediation + program board, flip dry-run/submit
- **`client.cbom`** — ingest, aggregate, sources, conflicts, diff, resolve
- **`client.reports`** — availability + persist scan bundle
- **`@qtangl/sdk-react`** — `QtanglProvider`, `useQtanglClient`, `useQtanglApiKey`, `useQtanglContext`
- Generated models: `SchedulePatchRequest`, `TenantSettingsRequest`, `CbomConflictResolveRequest`, `RemediationUpdateRequest`, `ProgramCreateRequest`, `ProgramUpdateRequest`, `ProgramVerifyRequest`
- `web/lib/dashboard-data.ts` — typed dashboard bootstrap via SDK
- `sdk/examples/` quickstart scripts
- `sdk_smoke.py --local` for CI without live API keys
- CORS allowlist includes `Idempotency-Key` for browser clients

### Changed

- Dashboard integrations, schedules, drift, and remediation panels use SDK via `@qtangl/sdk-react`
- Dashboard load path uses SDK for me/scans/billing/CBOM bootstrap
- PQC report availability/persist uses SDK

## 0.9.0 — 2026-06-14

First public beta release of official SDKs.

### Added

- **Python (`qtangl`)** and **TypeScript (`@qtangl/sdk`)** clients with shared scope:
  - PQC scan + poll (`POST /pqc/scan`, `GET /pqc/scan/{id}`)
  - Public verify + transparency log endpoints
  - Tenant schedules and scans listing
  - `me()`, billing portal, report URL helpers
- Generated request models from canonical FastAPI OpenAPI export
- Retry policy for 429 / 5xx with exponential backoff
- `Idempotency-Key` helpers (`new_idempotency_key` / `newIdempotencyKey`)
- Python offline verify via `qtangl-verify` (`qtangl.verify.verify_report_offline`)
- Web dashboard dogfood via `@qtangl/sdk` (`web/lib/qtangl-client.ts`, `tenant-api.ts`, `pqc.ts`, verify page)

### Publish

- PyPI: `pip install qtangl` (tag `sdk-v0.9.1`)
- npm: `npm install @qtangl/sdk @qtangl/sdk-react` (tag `sdk-v0.9.1`)
