# ADR-009: Native discovery depth (host sensor + code/binary orchestration)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-09 |
| **Deciders** | Product, GTM, Engineering |
| **Supersedes** | Partially supersedes [ADR-006](./ADR-006-evidence-layer-and-aggregator-positioning.md) rejected alternative "out-discover incumbents" |

---

## Context

Competitive comparison ([11-competitive-intelligence.md](../11-competitive-intelligence.md)) scores Qtangl **No** on host/endpoint discovery and source-code/binary scan. ADR-006 positioned Qtangl as evidence layer + CBOM aggregator, explicitly rejecting native depth.

Buyers increasingly require a **single-vendor CPM story** with verifiable evidence. Agentless external scan remains the self-serve Assess motion, but Monitor and Enterprise tiers need native depth to win RFPs against Keyfactor, SandboxAQ, and IBM.

Constraints preserved from ADR-006:

- Evidence layer (signing, transparency log, public verify) remains the primary moat
- Neutral CBOM aggregation from third-party tools continues
- Honest scope: inventory aid, not formal audit
- No private key material exfiltration from host sensors

---

## Decision

**Build native discovery depth in two programs while retaining the evidence layer.**

### 1. Qtangl Unified Sensor (host/endpoint)

Cross-platform Go sensor discovering:

- Certificate stores (Windows CryptoAPI, Linux paths, macOS Keychain, Java keystores)
- Filesystem crypto artifacts (metadata only)
- Crypto library versions
- Local TLS listeners

Findings push to Qtangl API via mTLS; air-gap offline ZIP upload supported.

### 2. Code/binary orchestration (OSS engines)

Orchestrate CryptoScan, CryptoDeps, and CBOMkit-theia in sandboxed workers. Normalize CycloneDX output into Qtangl CBOM with provenance tags. Do not rebuild Sonar-cryptography from scratch.

### 3. Unified discovery platform

All methods funnel through `backend/app/discovery/orchestrator.py` → CBOM merge → readiness score → signed evidence.

### 4. Feature flags (default off)

Per-tenant flags: `discovery.host_sensor`, `discovery.code_scan`, `discovery.binary_scan`. Enable after pilot validation.

---

## Ship gates

| Gate | Exit criteria |
|------|---------------|
| **G0** Foundation | ADR-009, schema v1, DB models, orchestrator, feature flags |
| **G1** Host partial | Linux sensor + fleet API + CBOM merge + 100-agent soak |
| **G2** Code partial | Async code_scan + dashboard + GitHub Action |
| **G3** Host yes | Windows/macOS/K8s + CMDB + 1k-agent soak |
| **G4** Code yes | Image scan + GitHub App + source/runtime diff |
| **G5** Enterprise | Java/.NET module + 3 pilots >500 agents + full GTM refresh |

No public comparison matrix claim before gate passes.

---

## Consequences

**Positive:** Closes competitive depth gap; enables single-vendor enterprise narrative; compounds evidence moat across all discovery methods.

**Negative:** Engineering-heavy; agent deployment friction; positioning shift from pure aggregator.

---

## Related

- [ADR-009 appendix: security model](./ADR-009-security-appendix.md)
- [discovery-depth-prd.md](../prds/discovery-depth-prd.md)
- [cbom-ingestion-prd.md](../prds/cbom-ingestion-prd.md)
