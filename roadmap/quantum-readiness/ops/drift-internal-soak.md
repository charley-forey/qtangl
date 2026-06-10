# Drift internal soak (2 weeks)

## Fixtures

- Tenant A: external + host schedules (168h cadence, accelerated to 24h in staging).
- Tenant B: code scan on fixture repo.
- Tenant C: CBOM cloud_pull schedule.

## Daily checks

- Snapshot write error rate &lt; 0.1%
- No cross-tenant leakage in RLS tests
- Alert volume within expected bounds

## Exit

All G-Drift-6 items checked in `drift-g3-g5-checklist.md`.
