# Crypto flip — G3/G5 ship gate checklist (flipsCrypto = Yes)

**Status:** Engineering gates met (2026-06-09) — pilot evidence collection in progress.

## G-Flip-1 — Control plane

- [x] Migration 015 `crypto_flip_jobs` + `flip_approvals` deployed
- [x] `FlipDispatchService`: dry_run, submit, poll, cancel, retry
- [x] Flip policy engine: prod approval, rate limits, blocked tags
- [x] APIs: dry-run, submit, list, get, approve, cancel, retry
- [x] `log_action` on all flip mutations
- [x] Convert tier gate; Enterprise gate for KMS prod

## G-Flip-2 — KMS discovery

- [x] `pull_aws_kms`, `pull_azure_keyvault_keys`, `pull_gcp_cloud_kms`
- [x] IAM templates extended (read-only + flip policy docs)
- [x] Wired into `integrations/pull.py`
- [x] KMS drift snapshots on scheduled cloud pull
- [x] KMS inventory panel on dashboard

## G-Flip-3 — CLM flip

- [x] VenafiFlipAdapter: request_certificate, install_certificate, poll
- [x] DigiCertFlipAdapter: order_certificate, renew_certificate, poll
- [x] AppViewXFlipAdapter: trigger_workflow, poll
- [x] Keyfactor metadata write-back on flip complete
- [x] ACME full issuance flow (account key + CSR)
- [x] ClmFlipAdapter registry + playbooks
- [x] WireMock integration tests

## G-Flip-4 — Overlay flip

- [x] GitHub/GitLab/ADO hybrid TLS PR parity
- [x] nginx/Envoy/HAProxy/Caddy/JWKS snippet library
- [x] K8sOverlayAdapter with dry-run
- [x] TerraformOverlayAdapter ALB/AGW fragments
- [x] Envoy/Istio and F5/ALB JSON export (Enterprise)
- [x] `/remediation/automate` migrated with deprecation header

## G-Flip-5 — KMS flip

- [x] AwsKmsFlipAdapter: create_key, schedule_rotation, update_alias
- [x] Separate IAM flip policy (deny decrypt/export)
- [x] Azure Key Vault new key version
- [x] GCP Cloud KMS CryptoKeyVersion
- [x] Two-person approval, 24h cooldown, rollback docs
- [x] WireMock tests for AWS KMS flip paths

## G-Flip-6 — UX & docs

- [x] CryptoFlipPanel, FlipJobProgress, FlipApprovalQueue, BeforeAfterProof
- [x] Flip button on RemediationProgramBoard
- [x] `/docs/guides/crypto-flip` + provider runbooks
- [x] `/docs/reference/crypto-flip-api`
- [x] SDK: dryRunFlip, submitFlip, approveFlip, getFlipJob

## G-Flip-7 — Enterprise hardening

- [x] SOC2 flip approval sampling extension
- [x] Pen test scope documented
- [x] Per-tenant flip budget + provider DLQ
- [x] RLS + no-key-material CI assertions
- [x] Air-gap manual flip playbook
- [x] MSSP partner approve scope
- [x] flip_load.py benchmark + chaos soak docs

## G-Flip-8 — Pilots (before matrix flip)

- [ ] 30-day CLM pilot: 2 tenants, 10+ successful flips with proof
- [ ] 30-day overlay pilot: hybrid KEX verified on staging
- [ ] 30-day Enterprise KMS pilot: alias migration, zero decrypt calls

## G-Flip-9 — CI gates

- [x] `flip-golden-fixtures/` + `flip-contract-tests` CI job
- [x] E2E `crypto-flip.spec.ts`

## G-Flip-10 — GTM flip

- [x] `competitors.ts` `flipsCrypto: "yes"`, `kms`/`certClm: "yes"`
- [x] Battlecards, blog, competitive intel updated
- [x] Comparison PDF regenerated
