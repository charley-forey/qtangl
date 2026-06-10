# Trust center operations runbook

**Owner:** Founder (Evidence track)  
**Last updated:** 2026-06-10

## Weekly (30 min)

1. Check GitHub Actions: **pqc-dogfood**, **dogfood-freshness**, **CI**, **production-smoke**
2. Review `[SECURITY]` inbox — 2 business day ack SLA
3. Update [trust-program-tracker.md](../compliance/trust-program-tracker.md)
4. One evidence item toward next phase

## Monthly

- Review `/trust/subprocessors` — update `subprocessorsLastUpdated` in `web/lib/copy/trust.ts`
- Run or verify **compliance-evidence-export.yml** artifact
- Review vendor assurance binder renewal dates

## Quarterly

- Backup restore drill per [platform-backup-restore-runbook.md](../ops/platform-backup-restore-runbook.md)
- Access control matrix audit
- Threat model review

## Annually

- Penetration test (or schedule if not done)
- Renew `security.txt` `Expires` field (see security-txt-renewal workflow or manual PR)
- SOC 2 audit window coordination

## Per release

- Regenerate platform SBOM if dependencies changed (`scripts/generate-platform-sbom.mjs`)
- Update security overview if architecture changed
- Run `node scripts/trust-copy-check.mjs` locally before merge

## Alerting

| Workflow | On failure |
|----------|------------|
| dogfood-freshness.yml | GitHub issue `dogfood-stale` |
| production-smoke.yml | Investigate API health |
| ci.yml security-audit | Block merge until fixed |

## Document requests

Route via `/access` with **Security diligence** interest — respond within 3 business days using questionnaire drafts in `docs/compliance/questionnaires/`.
