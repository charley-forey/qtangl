# Crypto flip rollback runbook

## When to rollback

- Post-flip verify scan shows regression (algorithm downgrade, new vulnerability)
- Customer reports outage linked to flip job within 4h of completion
- CLM/KMS provider returns unrecoverable error after partial apply

## Overlay rollback

1. Identify `crypto_flip_jobs.external_ref` (PR number, K8s patch ID, Terraform artifact URL)
2. **Git:** Revert merge commit or close PR without merge; redeploy previous config tag
3. **K8s:** `kubectl apply` previous Ingress/Gateway manifest from job `request_json.beforeManifest`
4. **Terraform:** Customer CI re-applies previous state; Qtangl does not hold cloud write creds by default
5. Update job status → `rolled_back` via `POST /tenant/flips/{job_id}/cancel` with `reason: rollback`
6. Trigger verify re-scan; attach proof showing restored posture

## CLM rollback

1. Poll Venafi/DigiCert for request status; if cert not yet installed, cancel request via provider console
2. If installed: trigger `renew_certificate` with previous template ID (documented in `result_json.previousTemplateId`)
3. Re-bind previous cert in CLM if install step completed
4. Mark job `rolled_back`; notify owner via webhook

## KMS rollback

1. **AWS:** `update_alias` to point back to `result_json.previousKeyId` (requires flip IAM role)
2. **Azure:** Set previous key version as active (customer Key Vault policy)
3. **GCP:** Restore primary CryptoKeyVersion via customer console
4. **Cooldown:** Wait 24h before retrying prod KMS flip on same alias
5. Assert no `kms:Decrypt` or key export in audit log

## Audit

- `log_action` event `flip_rolled_back` with actor, reason, jobId
- Update remediation program item status → `in_progress` with rollback note

## Escalation

- P1 outage: page on-call + customer CISO contact from program item owner
- Provider API outage: pause flip queue; DLQ entries visible at `GET /tenant/flips?status=failed`
