# Discovery depth — disaster recovery

## Tenant restore

1. Restore tenant row and API keys from backup.
2. Re-run `alembic upgrade head` if schema drifted.
3. Agents retain `agentId` in sensor config — heartbeats resume without re-enroll if DB restored within retention window.
4. If agent rows lost: rotate fleet enrollment token and redeploy sensor with new token.

## CBOM rebuild from findings archive

1. Export `host_findings` JSON per tenant from backup.
2. Run `ingest_findings` batch script with `QTANGL_DISCOVERY_ENABLE_ALL=true`.
3. Invoke `ingest_scan_assets` for each batch to rebuild CBOM merge state.
4. Regenerate evidence vault bundle from merged CBOM.

## RPO / RTO targets

| Asset | RPO | RTO |
|-------|-----|-----|
| HostFinding raw JSON | 24h | 4h |
| DiscoveryJob results | 24h | 2h |
| Merged CBOM | 1h | 1h |

## DR test checklist (quarterly)

- [ ] Restore sandbox tenant from snapshot
- [ ] Verify 10 sample agents heartbeat
- [ ] Rebuild CBOM from findings export
- [ ] Confirm compare matrix still shows partial/yes gates
