# Schedule worker soak test

Prove continuous monitoring works end-to-end (Monitor tier + worker).

## Prerequisites

- Monitor-tier tenant with authorized domain
- Railway: `QTANGL_ENABLE_SCHEDULER=true`, `REDIS_URL`, worker process running
- Weekly schedule created (`cadenceHours: 168`)

## Procedure

1. Provision pilot tenant: `python backend/scripts/provision_tenant.py --tier monitor --domains api.example.com`
2. Create schedule via dashboard Monitor tab or `POST /tenant/schedules`
3. Wait for `nextRunAt` + worker tick (or lower `cadenceHours` to 1 for test env only)
4. Confirm new scan in `/tenant/scans` with matching target
5. Dashboard Monitor tab shows **last run** status green

## Pass criteria (4-week pilot)

- ≥95% scheduled runs complete without error
- Drift alert fires on intentional TLS change (staging regression)
- Recommendations reflect schedule + drift signals

## Failure triage

| Symptom | Check |
|---------|-------|
| No runs | Worker logs, Redis, `schedulerStale` on `/health/ready` |
| Runs fail | Scan allowlist, live scan env |
| Dashboard empty | Wrong tenant / API key |
