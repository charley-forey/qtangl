# KMS IAM templates (read + flip)

## AWS

- **Read-only discovery:** [`backend/contracts/aws-readonly-policy.json`](../../backend/contracts/aws-readonly-policy.json) — ListKeys, DescribeKey, GetKeyRotationStatus; denies Decrypt.
- **Flip (separate role):** [`backend/contracts/aws-kms-flip-policy.json`](../../backend/contracts/aws-kms-flip-policy.json) — CreateKey, UpdateAlias, TagResource; denies Decrypt/GetPublicKey/ExportKey.

Use distinct IAM roles: `qtangl-kms-read` vs `qtangl-kms-flip`. Store `flipRoleArn` in tenant AWS integration config.

## Azure Key Vault

Read: `keys/read`, `keys/list` on vault scope.

Flip: `keys/create`, `keys/update` — no `keys/backup` or secret export.

## GCP Cloud KMS

Read: `cloudkms.cryptoKeys.list`, `cloudkms.cryptoKeyVersions.list`.

Flip: `cloudkms.cryptoKeyVersions.create` — no `cryptoKeyVersions.useToDecrypt`.
