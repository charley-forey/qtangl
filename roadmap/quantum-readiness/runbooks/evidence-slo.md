# Evidence endpoint SLO

| Endpoint | Availability | p95 latency |
|----------|--------------|-------------|
| `GET /pqc/verify/{scanId}` | 99.9% | 500ms |
| `POST /pqc/verify` | 99.9% | 500ms |
| `GET /pqc/transparency/*` | 99.95% | 200ms |
| Signing pipeline | 99.9% success | 2s |

Metrics: `GET /metrics` (Prometheus text). Alert on anchor drift and integrity failures.
