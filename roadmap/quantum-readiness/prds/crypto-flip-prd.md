# PRD — Crypto Flip (orchestrated)

**Tier:** Convert / Enterprise · **Status:** engineering · **Owner:** Product

Orchestration-first crypto flip: Qtangl drives overlay, CLM, and KMS changes through customer-owned systems, captures before/after drift snapshots, verifies with re-scan, and attaches signed proof — without operating a native PQ overlay appliance or CA.

---

## Summary & goal

Let Convert and Enterprise customers approve and execute cryptographic flips from remediation program items with dry-run, governance, and auditable before/after evidence.

**Success:** ≥10 successful pilot flips per surface (CLM, overlay, KMS) with signed proof; matrix `flipsCrypto` flips to **yes** after G-Flip gates pass.

---

## Personas & jobs-to-be-done

| Persona | Job |
|---------|-----|
| VP Engineering | "Flip TLS/KMS posture on staging first, then prod with approval" |
| CISO | "Approve prod flips with two-person rule; audit every mutation" |
| Platform engineer | "Get hybrid KEX config as a PR or CLM request, not a black box" |
| MSSP | "Execute flips for child tenants with scoped approval" |
| Auditor | "Verify before/after drift delta and signed proof URL" |

---

## Functional requirements

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-F1 | M | `CryptoFlipJob` persisted with surface (`overlay`/`clm`/`kms`), provider, status, external ref |
| FR-F2 | M | Dry-run returns diff without side effects |
| FR-F3 | M | Approval workflow: `draft` → `pending_approval` → `approved` → `running` → terminal |
| FR-F4 | M | Prod targets require approval note; staging may auto-approve per tenant policy |
| FR-F5 | M | Before/after drift snapshots linked to job |
| FR-F6 | M | Verify re-scan on completion; signed proof attached |
| FR-F7 | M | Overlay: Git/GitLab/ADO PR, K8s patch, Terraform fragment, mesh/LB export |
| FR-F8 | M | CLM: Venafi request, DigiCert order, AppViewX workflow, Keyfactor metadata write-back |
| FR-F9 | S | KMS: AWS alias rotation, Azure key version, GCP CryptoKeyVersion (Enterprise prod) |
| FR-F10 | S | Webhook `crypto.flip.completed` with before/after delta |
| FR-F11 | S | Partner/MSSP approve flips for child tenants |
| FR-F12 | C | Air-gap manual proof upload path |

### Per-surface acceptance

| Surface | Acceptance |
|---------|------------|
| **Overlay** | Dry-run shows snippet diff; PR/patch created; post-deploy TLS scan shows hybrid KEX |
| **CLM** | Cert request/order in customer CLM; external ref polled; scan shows improved algorithm |
| **KMS** | CBOM metadata before/after; alias points to new key; no decrypt/export API calls |

---

## Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-F1 | Never store customer private keys or key material |
| NFR-F2 | RLS on `crypto_flip_jobs`; cross-tenant access denied |
| NFR-F3 | `log_action` on dry_run, submit, approve, complete, cancel, retry |
| NFR-F4 | Per-tenant flip rate limits and provider DLQ |
| NFR-F5 | Enterprise two-person approval for prod KMS flips |
| NFR-F6 | 24h cooldown between prod KMS flips per tenant |
| NFR-F7 | Convert tier required; KMS prod flip Enterprise-only |

---

## Boundary (what Crypto Flip is NOT)

| Qtangl owns | Out of scope |
|-------------|--------------|
| Orchestration, approval, proof | Native PQ network overlay appliance |
| Dry-run diff, job audit | Operating a public CA |
| Customer CLM/KMS API calls (delegated creds) | HSM key export |
| Playbooks + verify re-scan | Hands-on pen test / formal attestation |

See [ADR-010](../adrs/ADR-010-orchestrated-crypto-flip.md).

---

## Telemetry

| Event | Properties |
|-------|------------|
| `flip_dry_run` | surface, provider, programItemId |
| `flip_submitted` | jobId, surface, targetEnv |
| `flip_approved` | jobId, approver |
| `flip_completed` | jobId, success, proofId |
| `flip_failed` | jobId, error |

---

## Acceptance criteria (engineering)

- [x] Migration 015 `crypto_flip_jobs` deployed with RLS
- [x] Dry-run, submit, approve, poll, cancel, retry APIs
- [x] CLM, overlay, KMS adapter registries
- [x] KMS metadata pull (AWS/Azure/GCP)
- [x] UI: CryptoFlipPanel, FlipJobProgress, FlipApprovalQueue, BeforeAfterProof
- [x] SDK methods: `dryRunFlip`, `submitFlip`, `approveFlip`, `getFlipJob`
- [ ] Pilot evidence (G-Flip-8 through G-Flip-10)
