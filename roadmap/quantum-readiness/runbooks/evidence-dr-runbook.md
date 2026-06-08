# Evidence layer DR runbook

| Target | Value |
|--------|-------|
| **RPO** | 24 hours (daily backup) |
| **RTO** | 4 hours (restore + anchor cross-check) |

## Backup

1. Run `python backend/scripts/backup_evidence_log.py` on schedule (cron/worker).
2. Configure `QTANGL_EVIDENCE_BACKUP_BUCKET` for encrypted object storage.

## Restore drill

1. Restore `evidence_log`, `signing_keys`, `evidence_anchors`, `witness_cosignatures` from backup.
2. Run `python backend/scripts/reconstruct_log_from_anchors.py` — exit 0 required.
3. Compare Merkle root against Git witness + RFC 3161 token.

## Key recovery

Signing keys via KMS envelope (ADR-007, E1): unwrap via `QTANGL_SIGNING_KMS_KEY_ID`.

## Integrity alerts

Worker consistency self-check fires `evidence.integrity_alert` / `anchor.drift` webhooks on mismatch.
