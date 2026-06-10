# ADR-010: Orchestrated crypto flip

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-09 |
| **Deciders** | Product, Engineering, GTM |
| **Supersedes** | Convert PRD boundary row "Cert re-issuance at CA" (out of scope → orchestrated via customer CLM) |

---

## Context

Convert tier ([convert-prd.md](../prds/convert-prd.md)) originally scoped Qtangl as program-of-record only: playbooks, tracking, verify — not hands-on crypto changes. Competitive matrix row `flipsCrypto` is **no** while incumbents claim overlay/CLM/KMS flip.

Buyers expect PQC migration platforms to **orchestrate** flips in customer-owned systems (CLM, KMS, Git, K8s) with proof — not to ship a QuSecure-style network appliance. ADR-006 evidence layer is the moat: signed before/after, drift delta, approval audit.

User confirmed **orchestration-first** strategy: full **Yes** on overlay + CLM + KMS (~9 months) before public matrix flip.

---

## Decision

**Qtangl orchestrates crypto flips via customer CLM, KMS, and infra APIs; captures before/after evidence; does not operate a CA or PQ overlay appliance.**

### Boundaries

| In scope | Out of scope |
|----------|--------------|
| Venafi/DigiCert/AppViewX cert request & install orchestration | Qtangl-operated CA |
| Git/K8s/Terraform/mesh config delivery | Inline TLS termination appliance |
| AWS/Azure/GCP KMS alias & key version migration (metadata only) | Private key export or HSM provisioning |
| Dry-run, approval, audit, verify re-scan | Formal penetration test attestation |

### Architecture

- New `crypto_flip_jobs` control plane (migration 015)
- `FlipDispatchService` with surface-specific adapters
- Reuse drift snapshots for before/after posture
- Feature flags: `CRYPTO_FLIP_ENABLED` + per-surface tenant settings

### Governance

- Prod flips require approval; Enterprise KMS prod requires two-person rule
- Never persist customer private keys (NFR from cbom-ingestion-prd IAM model)

---

## Consequences

- Convert PRD boundary table updated: cert re-issuance → "orchestrated via customer CLM"
- Matrix `flipsCrypto`, `discoveryCoverage.kms`, `discoveryCoverage.certClm` flip to **yes** only after G-Flip checklist
- Sales battlecard footnote: orchestration not overlay appliance vs QuSecure

---

## References

- [crypto-flip-prd.md](../prds/crypto-flip-prd.md)
- [flip-g3-g5-checklist.md](../ops/flip-g3-g5-checklist.md)
- [ADR-006](./ADR-006-evidence-layer-and-aggregator-positioning.md)
