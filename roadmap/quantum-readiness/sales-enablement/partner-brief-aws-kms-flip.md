# Partner brief: AWS KMS + Qtangl crypto flip

## Positioning

**Qtangl orchestrates key lifecycle metadata changes; AWS KMS holds all key material.**

Qtangl never exports or stores private keys. Flip jobs use least-privilege IAM to create keys, update aliases, and enable rotation — with strict Enterprise governance.

## Co-sell motion

1. Qtangl KMS pull ingests key metadata into CBOM (algorithm family, rotation status)
2. Program item targets quantum-vulnerable signing keys
3. Dry-run shows alias change plan without side effects
4. Two-person approval (Enterprise prod) → flip job executes
5. CBOM before/after + application verify scan + signed proof

## What AWS keeps

- Key material in KMS/HSM
- IAM policy enforcement in customer account
- CloudTrail audit of KMS API calls

## What Qtangl adds

- Discovery of KMS posture alongside TLS, code, and CLM
- Governed orchestration with cooldown and rollback runbooks
- Neutral evidence layer for PQC migration programs

## Honest scope

When PQC algorithms are not yet GA on AWS KMS, flip playbooks focus on **alias prep, rotation enablement, and migration tagging** — with verify when algorithms become available. No overclaim on GA PQC key types.

## Technical requirements

- Separate IAM roles: read-only (discovery) vs flip (CreateKey, UpdateAlias, TagResource)
- Flip role must **deny** kms:Decrypt, kms:GetPublicKey export paths
- CloudTrail enabled for flip role assumptions
