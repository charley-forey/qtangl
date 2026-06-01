# Monitor observability

## Health checks

- `GET /health` — liveness
- `GET /health/ready` — database, Redis, scheduler metrics

### Scheduler fields (`scheduler` object)

| Field | Alert if |
|-------|----------|
| `lastTickAt` | Stale > 2× `intervalSec` while `schedulerEnabled` |
| `lastEnqueuedCount` | Informational per tick |
| `totalEnqueued` | Counter monotonic increase |

## Better Uptime / Grafana

1. HTTP check every 60s on `/health/ready`
2. JSON path `$.status` equals `ready`
3. Optional: custom check on `$.scheduler.lastTickAt` age

## Queue depth

Monitor Redis list length for `pqc_scan` queue when worker is deployed.

## Runbook

See [monitor-setup guide](https://www.qtangl.com/docs/guides/monitor-setup) and `backend/docs/RAILWAY_DEPLOY.md`.
