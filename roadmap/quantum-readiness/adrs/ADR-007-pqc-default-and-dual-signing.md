# ADR-007: PQC-default and dual signing

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-08 |
| **Epic** | K16 |

## Decision

Every signed report carries **ML-DSA-65 (primary when oqs available) + Ed25519 (mandatory fallback)** in a `signatures[]` array. Top-level `signature` remains the primary for backward compatibility. Content hash excludes all signature material.

## Consequences

- Verifiers without liboqs validate Ed25519; PQC-capable verifiers validate ML-DSA.
- Golden contentHash tests must remain stable.
- Optional SLH-DSA and KMS-native ECDSA added in Phase 7 (ADR-009 signer agility / E1).
