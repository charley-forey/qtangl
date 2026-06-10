# Discovery depth — ops runbooks

## Agent enrollment failures

1. Verify fleet token not expired (`token_expires_at`)
2. Check `token_uses < token_max_uses`
3. Confirm enrollment nonce matches fleet (`enrollmentNonce` in create/rotate response)
4. Confirm `discovery.hostSensor` feature flag enabled
5. Review API logs for `discovery/agent/enroll` 401

## mTLS / agent certificate failures

1. Confirm `DISCOVERY_MTLS_REQUIRED` matches deployment policy
2. Re-enroll agent to obtain fresh `certPem` / `keyPem` / `caChainPem`
3. Sensor must send `X-Qtangl-Agent-Cert` on heartbeat and findings
4. Revoked agents: rotate fleet token and redeploy

## CA rotation

1. Generate new CA (`DISCOVERY_CA_KEY_PEM`, `DISCOVERY_CA_CERT_PEM`)
2. Deploy API + worker with new material
3. Revoke all `agent_certificates` rows for affected tenants
4. Force fleet token rotation and mass re-enrollment

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
