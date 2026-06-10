# Drift unified engine — rollback procedure

## When to rollback

- Summary API p95 latency > 500ms sustained 15 min
- Cross-tenant snapshot leak detected
- Snapshot write failures causing job completion failures
- Alert storm from false-positive drift deltas

## Steps

1. **Disable feature flag** — set `DRIFT_UNIFIED_ENABLED=false` (env) or per-tenant `driftUnifiedEnabled: false` in settings.
2. **Stop snapshot writers** — writers check flag; external scan diff via legacy `compare_scan_bundles` continues unchanged.
3. **Drain alerts** — set `alert_mode: daily_digest` or pause webhooks via empty `webhookSigningSecret`.
4. **Revert matrix** — if already flipped, set `driftRescanDiff: "partial"` in `competitors.ts` and redeploy web.
5. **Database** — do not drop `drift_snapshots`; data retained for post-mortem. Optional: pause retention prune job.
6. **Verify** — confirm `GET /tenant/drift/summary` returns 503 or empty when flag off; scheduled scans still complete.

## Recovery

Re-enable per-tenant canary after root-cause fix. Run `python -m app.cli.backfill_drift_snapshots --tenant-id=<id>` before full re-enable.
