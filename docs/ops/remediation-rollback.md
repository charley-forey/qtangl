# Remediation program — rollback procedure

## When to rollback

- ITSM sync worker causing ticket status corruption
- Program auto-ingest creating duplicate items
- Verify dispatch enqueueing runaway discovery jobs
- Partner RBAC scope leak

## Steps

1. **Disable feature flag** — `REMEDIATION_PROGRAM_ENABLED=false` or per-tenant `remediationProgramEnabled: false`.
2. **Stop sync worker** — unset `QTANGL_ENABLE_ITSM_SYNC` or set worker interval to 0.
3. **Fall back to scan-scoped API** — legacy `GET/POST /tenant/scans/{scan_id}/remediation` remains active during canary.
4. **Pause auto-ingest** — flag off skips `upsert_program_items_from_scan` on job complete.
5. **Revert matrix** — set `remediationWorkflow: "partial"` if already flipped.
6. **ITSM** — leave `remediation_external_sync` rows intact; manual reconcile with Jira/ServiceNow after fix.

## Recovery

Run `python -m app.cli.migrate_remediation_program --tenant-id=<id>` after re-enable. Pilot tenants first.
