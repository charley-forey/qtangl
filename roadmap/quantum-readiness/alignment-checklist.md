# Marketing alignment checklist

Before publishing tier page changes, verify each claim:

| Claim | Verified in code |
|-------|------------------|
| Scheduled re-scans | `QTANGL_ENABLE_SCHEDULER` + worker |
| Drift alerts | `evaluate_scan_alerts` + tenant settings |
| Verify fix | `POST /tenant/scans/{id}/remediation/verify` |
| Webhook DLQ | `webhook_dead_letters` table + dashboard replay |
| Complete inventory (code/cloud) | `/platform/coverage` status column |

Update `liveToday` arrays in `web/lib/copy/readiness-pricing.ts` when shipping.
