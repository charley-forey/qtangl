# Marketing alignment checklist

Before publishing tier page changes, verify each claim:

| Claim | Verified in code | Verified |
|-------|------------------|----------|
| Scheduled re-scans | `QTANGL_ENABLE_SCHEDULER` + worker (`backend/app/monitoring/service.py`, `backend/app/worker.py`) | 2026-06-21 |
| Drift alerts | `evaluate_scan_alerts` + tenant settings (`backend/app/monitoring/alerts.py`) | 2026-06-21 |
| Verify fix | `POST /tenant/scans/{id}/remediation/verify` (`backend/app/api/tenant.py`) | 2026-06-21 |
| Webhook DLQ | `webhook_dead_letters` table + dashboard replay (`backend/app/notifications/webhooks.py`) | 2026-06-21 |
| Complete inventory (code/cloud) | `/platform/coverage` status column (`web/lib/copy/readiness-coverage.ts`) — GitHub + host sensor labeled **beta** | 2026-06-21 |

Automated gate: `node scripts/alignment-check.mjs` (CI job `alignment`).

Update `liveToday` arrays in `web/lib/copy/readiness-pricing.ts` when shipping.
