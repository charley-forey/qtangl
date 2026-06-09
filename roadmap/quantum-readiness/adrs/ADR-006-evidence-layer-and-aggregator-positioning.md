# ADR-006: Evidence layer and neutral CBOM aggregator positioning

| Field | Value |
|-------|-------|
| **Status** | Accepted (discovery depth partially superseded by [ADR-009](./ADR-009-native-discovery-depth.md)) |
| **Date** | 2026-06-06 |
| **Deciders** | Product, GTM, Engineering |
| **Epic** | K4, K11 |

---

## Context

Qtangl's readiness platform ([00-transformation-thesis.md](./00-transformation-thesis.md), [ADR-005](./ADR-005-readiness-first-positioning.md)) leads with **Assess → Monitor → Convert**. Signed reports, public verify, and CycloneDX CBOM export are already shipped (`pilot`/`done` in [03-solution-architecture.md](./03-solution-architecture.md)).

Competitive analysis ([11-competitive-intelligence.md](./11-competitive-intelligence.md)) shows the market consolidating under **Cryptographic Posture Management (CPM)**. Incumbents — Keyfactor (+ InfoSec Global / CipherInsights), SandboxAQ AQtive Guard, Fortanix, IBM CBOMkit, Palo Alto — anchor on **deep discovery** (host agents, source-code analysis, KMS-centric inventory). No single discovery method is complete (NIST NCCoE, Applied Quantum PQC Migration Framework), but incumbents have years of enterprise deployment, channel, and breadth.

Qtangl's agentless external scan is the **fastest baseline** but cannot credibly claim full-estate coverage. Prior positioning risked implying parity with agent-based discovery — a trap called out explicitly in battlecards and objection handling.

Meanwhile, every vendor produces CBOM fragments. Buyers with 2–3 discovery tools lack a **neutral system of record** for cryptographic inventory evidence — especially one that auditors can verify independently of Qtangl's UI.

Constraints:

- Do not deprecate Qtangl's own agentless scan; it remains the primary self-serve Assess motion
- Preserve honest scope: "inventory aid, not formal audit" on all surfaces
- Evidence must be **vendor-neutral** where CBOM is aggregated (no Qtangl-only lock-in of the inventory artifact)
- Mid-market price and minutes-to-value remain non-negotiable differentiators

---

## Decision

**Lead with the evidence layer and position Qtangl as a neutral CBOM aggregator. Do not compete to out-discover incumbents.**

### 1. Evidence layer as the primary moat

Elevate signing, transparency log, evidence vault, and open verification from cross-cutting implementation detail to **first-class product narrative**:

| Capability | Buyer promise |
|------------|---------------|
| **Signed reports** | Tamper-evident readiness artifacts (Ed25519 today; PQC signing on roadmap) |
| **Transparency log** | Append-only inclusion of report content hashes; externally anchorable roots |
| **Evidence vault** | Tenant-scoped retention of scan artifacts, bundles, and verification receipts |
| **Readiness Passport** | Shareable, revocable, time-bound access to evidence (extends ShareLink) |
| **Open verify** | Public spec + `/verify` UI + offline CLI (`backend/scripts/qtangl_verify.py`) |

GTM copy, homepage proof points, and sales decks lead with **"prove it"** — not **"find everything."**

### 2. Neutral CBOM aggregator (ingestion, not replacement)

Accept CBOM and inventory uploads from Qtangl scans **and** third-party sources. Qtangl becomes the **merge point and evidence custodian**, not the sole discoverer:

- Tag every component with **provenance** (source tool, scan method, confidence, verification status)
- **Merge and dedupe** across sources; surface conflicts instead of silently overwriting
- Support **CycloneDX 1.6 and 1.7** CBOM as interchange formats
- Label **unverified-source** components when provenance cannot be attested
- Ingest cloud/KMS inventory via **read-only credentials** (no key material export)

Positioning line: *"Bring your CBOMs. We unify, score, track drift, and produce signed evidence auditors can verify offline."*

### 3. Complementary discovery posture (explicit)

In competitive and partner conversations:

| Say | Do not say |
|-----|------------|
| "Fast agentless baseline in minutes" | "Complete cryptographic estate coverage" |
| "Evidence layer on top of Keyfactor / SandboxAQ / Fortanix" | "Replace your discovery vendor" |
| "Combine 2–3 methods per NIST guidance; we aggregate and prove" | "Our scan finds everything" |

Discovery depth gaps (internal hosts, dormant keys, source code, OT) are **documented blind spots**, not marketing omissions.

### 4. Build sequencing

| Phase | Deliverable | PRD |
|-------|-------------|-----|
| **Now** | Transparency log, signing key registry, verify API + CLI, evidence bundle ZIP | [evidence-layer-prd.md](../prds/evidence-layer-prd.md) |
| **Next** | CBOM upload, provenance tags, merge/dedupe, unverified labeling | [cbom-ingestion-prd.md](../prds/cbom-ingestion-prd.md) |
| **Then** | Readiness Passport UX, cloud/KMS read-only connectors, partner co-sell kits | evidence-layer + cbom-ingestion PRDs |

---

## Consequences

**Positive**

- Differentiated moat aligned with what incumbents lack: **independent verifiability** and a **neutral aggregation point**
- Opens coopetition motion with Keyfactor, SandboxAQ, Fortanix, IBM, and MSSPs ([15-partnerships-and-ecosystem.md](./15-partnerships-and-ecosystem.md))
- Reduces credibility risk from over-claiming discovery breadth
- CBOM interchange (CycloneDX) limits vendor lock-in fears in enterprise procurement
- Evidence layer compounds across Assess, Monitor, and Convert (re-scan proof, drift receipts)

**Negative / tradeoffs**

- "Aggregator" positioning is less visceral than "we scan your estate" — requires education (mitigated: demo-in-minutes Assess + verify flow)
- Merge/dedupe across heterogeneous CBOMs is engineering-heavy; conflicts must be surfaced honestly
- Some prospects want a single-vendor discovery story — we may lose RFPs that mandate agent deployment (acceptable: not our ICP)
- Transparency log and anchoring add operational surface (key rotation, anchor witnesses, log monitoring)

---

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| **Out-discover incumbents** (agents, code scanning, KMS agents) | Capital-intensive, long enterprise cycles, directly competes with Keyfactor/SandboxAQ on their turf; violates mid-market DNA |
| **Evidence as footnote only** (keep discovery-first GTM) | Under-sells the shipped differentiator; competitive intel shows verify/CBOM as buyer asks incumbents cannot satisfy |
| **Qtangl-only CBOM** (no third-party ingestion) | Fails accounts that already run discovery tools; blocks partnership motion |
| **Formal attestation / audit sign-off** | Outside scope and liability model; evidence layer provides **input**, not attestation ([convert-prd.md](../prds/convert-prd.md) boundary) |
| **Blockchain anchoring** | Over-engineered for current scale; file/git witnesses + published roots sufficient for v1 ([anchoring.py](../../backend/app/pqc/anchoring.py)) |

---

## Related

- [11-competitive-intelligence.md](./11-competitive-intelligence.md) — discovery-method lens, coopetition traps
- [03-solution-architecture.md](./03-solution-architecture.md) — evidence layer in platform diagram
- [prds/evidence-layer-prd.md](../prds/evidence-layer-prd.md) — transparency log, vault, passport, verify spec
- [prds/cbom-ingestion-prd.md](../prds/cbom-ingestion-prd.md) — provenance, merge, CycloneDX, cloud/KMS
- [sales-enablement/battlecards.md](./sales-enablement/battlecards.md) — incumbent coopetition scripts
- [12-platform-security-and-trust.md](./12-platform-security-and-trust.md) — signing, retention, trust center
