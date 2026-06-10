# Crypto flip pilot playbooks

## CLM pilot (30 days, 2 tenants)

- Enable `CRYPTO_FLIP_ENABLED` + `cryptoFlip.clm` per tenant
- Configure Venafi or DigiCert integration with write-back
- Target: 10+ successful cert flips with signed before/after proof
- Weekly review: approval latency, provider error rate, verify pass rate

## Overlay pilot (30 days, 2 tenants)

- Enable `cryptoFlip.overlay`
- GitHub/GitLab staging repos with hybrid TLS PR workflow
- Success: hybrid KEX visible on staging TLS scan post-merge
- Document rollback via PR revert

## KMS pilot (30 days, 1 Enterprise tenant)

- Enable `cryptoFlip.kms`; separate flip IAM role
- Alias migration on non-prod first, then one prod alias with two-person approval
- Success: CBOM before/after; zero Decrypt API calls in CloudTrail for flip role
- 24h cooldown enforced between prod flips
