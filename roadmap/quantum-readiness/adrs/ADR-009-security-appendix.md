# ADR-009 Appendix: Security model, invariants, OSS licenses, pen-test scope

## No-key-exfiltration invariant

1. Sensor **never** reads or transmits private key bytes.
2. API validator rejects payloads containing `BEGIN PRIVATE KEY`, `BEGIN RSA PRIVATE KEY`, or raw DER key material.
3. PKCS#12: report existence, algorithm, expiry — not decrypted contents.
4. Findings use SHA-256 fingerprints only.

Violation of this invariant is a **P0 security incident**.

## Sensor threat model

| Threat | Mitigation |
|--------|------------|
| Stolen enrollment token | 72h TTL, max-uses=100, bcrypt hash stored, fleet-scoped |
| Agent impersonation | mTLS client cert bound to agentId + tenantId |
| Finding injection | Schema validation, tenant isolation on ingest, rate limits |
| Token replay | Nonce on enroll; findingId idempotency |
| Supply chain tampering | cosign-signed releases; transparency log entry per binary |
| Cross-tenant leak | agentId JOIN tenantId on every query; integration tests |

## OSS license matrix

| Engine | License | Distribution | Notes |
|--------|---------|--------------|-------|
| CryptoScan | Check upstream (CSNP) | Subprocess, not linked | Attribution in docs + SBOM |
| CryptoDeps | Check upstream (CSNP) | Subprocess | Same |
| CBOMkit-theia | Apache-2.0 | Subprocess | PQCA / Linux Foundation |

Upgrade process: license re-review → contract tests → 48h canary → release notes.

## Pen-test scope

- Enrollment token brute force
- mTLS bypass / cert confusion
- Finding injection across tenants
- Scanner subprocess escape (container breakout)
- Offline ZIP upload path traversal

Annual pen test; remediate before G3 gate.
