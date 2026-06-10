# Drift monitoring pilot playbook

## Design partners

Run with 2 tenants for 14 days minimum before matrix flip.

## Setup

1. Enable `driftUnifiedEnabled` in tenant settings.
2. Create schedules: external TLS (weekly), host fleet (weekly), code scan (on merge).
3. Run `python -m app.cli.backfill_drift_snapshots --tenant-id=<id>` once.

## Success metrics

- Second scheduled run produces non-empty delta on at least one source.
- Webhook `drift.detected` received by SIEM test endpoint.
- Summary API p95 &lt; 200ms on pilot tenant.

## Rollback

See `docs/ops/drift-rollback.md`.
