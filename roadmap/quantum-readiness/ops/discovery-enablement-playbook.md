# Discovery enablement playbook

## Feature flags

| Flag | Capability |
|------|------------|
| `discovery.hostSensor` | Fleet enrollment, agent ingest, offline upload |
| `discovery.codeScan` | Code scan orchestrator, GitHub/GitLab/ADO webhooks |
| `discovery.binaryScan` | Container/binary CBOM scans |

Dev shortcut: `QTANGL_DISCOVERY_ENABLE_ALL=true`

## Rollout rings

| Ring | Tenants | Duration | Rollback trigger |
|------|---------|----------|------------------|
| Ring 0 | Internal sandbox | Continuous | P0 security finding |
| Ring 1 | 1–2 design partners | 2 weeks | Ingest error rate >2% |
| Ring 2 | Monitor beta cohort | 4 weeks | p99 ingest >5s |
| Ring 3 | GA | After G5 | Pilot failure |

## Tenant onboarding checklist

1. Enable appropriate discovery flags for tier
2. Create fleet + distribute enrollment token + nonce
3. Deploy sensor (Helm / MSI / deb) with mTLS cert from enroll
4. Verify `GET /tenant/discovery/agents` shows online agents
5. Configure code targets or GitHub App install
6. Optional: wire ServiceNow CMDB env vars for coverage widget

## Rollback

| Scenario | Action |
|----------|--------|
| Matrix flipped too early | Revert `competitors.ts` to `partial` |
| OSS regression | Pin `scanner-versions.lock`; disable Ring 2+ |
| CA compromise | Rotate `DISCOVERY_CA_*`; force re-enroll |
| Soak SLO miss | Keep flags Ring 0–1 only |
