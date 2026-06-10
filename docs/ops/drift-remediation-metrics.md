# Drift + remediation observability

## Prometheus metrics

| Metric | Type | Labels | SLO target |
|--------|------|--------|------------|
| `qtangl_drift_snapshots_total` | counter | `tenant_id`, `source_type` | — |
| `qtangl_drift_snapshot_write_errors_total` | counter | `source_type` | < 0.1% of writes |
| `qtangl_drift_alerts_fired_total` | counter | `alert_type`, `severity` | — |
| `qtangl_drift_summary_latency_seconds` | histogram | — | p95 < 0.2s |
| `qtangl_remediation_sync_lag_seconds` | gauge | `provider` | < 600s |
| `qtangl_remediation_sync_failures_total` | counter | `provider` | < 1% of polls |
| `qtangl_remediation_program_items_total` | gauge | `tenant_id`, `status` | — |
| `qtangl_remediation_verify_jobs_total` | counter | `source_type`, `outcome` | — |

## Dashboards

- **Drift** — snapshot write rate, diff compute latency, alert volume by type, retention prune count
- **Remediation** — sync lag, open items by status, verify success rate, ITSM DLQ depth

## Alerts (ops)

- `DriftSummaryLatencyHigh` — p95 > 500ms for 10m
- `DriftSnapshotWriteErrorSpike` — error rate > 1% for 5m
- `ITSMSyncLagHigh` — lag > 1800s for any provider
- `RemediationSyncFailureSpike` — failures > 10/min
