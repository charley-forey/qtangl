# Discovery depth — SLOs and alerts

| Metric | SLO | Alert threshold |
|--------|-----|-----------------|
| Agent heartbeat lag (p99) | < 15 min | > 30 min for 10% of fleet |
| Findings ingest latency (p99) | < 2s | > 5s for 5 min |
| Discovery queue depth | < 100 jobs | > 500 for 15 min |
| Discovery job error rate | < 2% / 24h | > 5% / 1h |
| Stale agents (no heartbeat 7d) | < 5% of fleet | > 10% |

Prometheus counters: `qtangl_discovery_findings_ingested_total`, `qtangl_discovery_job_dlq_total`.

Gauges: `qtangl_discovery_queue_depth`, `qtangl_discovery_ingest_latency_ms`, `qtangl_discovery_heartbeat_lag_minutes`.

Grafana dashboard panels (staging):

1. Findings ingest rate (counter derivative)
2. Ingest latency p99 (`discovery_ingest_latency_ms`)
3. Queue depth by job type
4. Heartbeat lag histogram
5. DLQ rate / total jobs

PagerDuty: page on queue depth >500 for 15m or ingest p99 >5s for 5m.

Runbooks: [discovery-runbooks.md](./discovery-runbooks.md)
