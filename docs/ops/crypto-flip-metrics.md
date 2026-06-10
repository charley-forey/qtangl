# Crypto flip metrics and SLOs

## Prometheus metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `qtangl_flip_jobs_total` | Counter | `surface`, `provider`, `status` | Flip jobs by terminal status |
| `qtangl_flip_success_rate` | Gauge | `surface`, `tenant_tier` | Rolling 7d success ratio |
| `qtangl_flip_approval_latency_seconds` | Histogram | `surface` | Time from submit to approve |
| `qtangl_flip_duration_seconds` | Histogram | `surface`, `provider` | Submit to terminal status |
| `qtangl_flip_dry_run_total` | Counter | `surface` | Dry-run invocations |
| `qtangl_flip_provider_errors_total` | Counter | `provider`, `error_code` | Provider API failures |

## SLO targets

| SLO | Target | Window |
|-----|--------|--------|
| Flip API availability | 99.5% | 30d |
| Dry-run p95 latency | < 2s | 7d |
| CLM flip success (non-stub) | ≥ 95% | Pilot |
| KMS flip success (Enterprise) | ≥ 90% | Pilot |
| Approval queue age p95 | < 4h business hours | 7d |
| Webhook delivery | ≥ 99% (with DLQ replay) | 7d |

## Dashboards

- **Flip operations:** jobs/hour by surface, failure rate, DLQ depth
- **Governance:** pending approvals, two-person KMS queue, cooldown blocks
- **Evidence:** proof attachment rate, verify scan pass rate post-flip

## Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| `FlipFailureSpike` | `rate(qtangl_flip_jobs_total{status="failed"}[1h]) > 5` | warning |
| `KmsFlipWithoutApproval` | audit log anomaly detector | critical |
| `FlipDlqBacklog` | DLQ depth > 50 for 15m | warning |
| `FlipProviderTimeout` | `qtangl_flip_provider_errors_total` rate > 10/min | warning |

## Load benchmark

Run `python backend/benchmarks/flip_load.py` — target 1k dry-runs/min on staging.
