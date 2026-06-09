# Discovery depth — ops runbooks

## Agent enrollment failures

1. Verify fleet token not expired (`token_expires_at`)
2. Check `token_uses < token_max_uses`
3. Confirm `discovery.hostSensor` feature flag enabled
4. Review API logs for `discovery/agent/enroll` 401

## Scanner OOM

1. Check worker memory for `discovery_code` queue jobs
2. Reduce repo size or increase container memory limit (2 vCPU / 2Gi default)
3. Retry via `GET /tenant/discovery/jobs/{id}` → re-enqueue

## OSS engine crash

1. Verify `backend/scanner-versions.lock` checksums
2. Fall back to regex-only pass (automatic in code_orchestrator)
3. File issue with engine version pin

## Fleet silent >30 days

1. Dashboard shows offline agents
2. Auto-revoke policy marks `status=revoked`
3. Customer rotates enrollment token and redeploys

## DR: fleet re-enrollment

1. Restore tenant from backup
2. Issue new fleet tokens
3. Agents re-enroll; findings archive rebuilds CBOM via `ingest_scan_assets`
