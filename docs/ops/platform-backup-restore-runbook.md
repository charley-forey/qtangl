# Platform backup and restore runbook

**Status:** v0.1  
**Owner:** Engineering  
**RTO target:** 4 hours (API read path)  
**RPO target:** 24 hours (Postgres + evidence log)

## Scope

- Railway-managed Postgres (tenant scans, audit log, transparency log)
- Evidence log backups via `backend/scripts/backup_evidence_log.py`
- Application secrets: platform stores only (Railway/Vercel)

## Daily backup

1. GitHub Action `evidence-backup.yml` runs `backup_evidence_log.py` (when `PROD_DATABASE_URL` secret configured).
2. Railway Postgres: rely on provider PITR + documented export procedure.

## Restore drill (quarterly)

1. Restore Postgres snapshot to staging project OR run `reconstruct_log_from_anchors.py` per `roadmap/quantum-readiness/runbooks/evidence-dr-runbook.md`.
2. Verify `/health/ready` and sample `/pqc/verify/{scanId}`.
3. Log result in `docs/compliance/trust-program-tracker.md`.

## Incident escalation

See `web/app/docs/trust/incident-response/page.tsx` and `[SECURITY]` email to charley@qtangl.com.
