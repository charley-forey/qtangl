# PRD — Discovery Depth (Host Sensor + Code/Binary)

**Tier:** Assess · Monitor · Enterprise · **Status:** in-progress · **Owner:** Product

Close competitive gaps on host/endpoint discovery and source-code/binary scan while preserving the evidence-layer moat.

---

## Personas

| Persona | Job |
|---------|-----|
| CISO | Unified crypto inventory across external, hosts, and code with signed evidence |
| Platform engineer | Deploy sensors fleet-wide via Helm/Ansible without agent chaos |
| VP Engineering | CI gates on quantum-vulnerable crypto in repos and container images |
| Compliance lead | Provenance per finding; coverage confidence reflects methods used |

---

## Functional requirements

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-D1 | M | Qtangl Unified Sensor: cert stores, filesystem, libraries, listeners |
| FR-D2 | M | Fleet enrollment API with mTLS agent identity |
| FR-D3 | M | Findings ingest → CBOM merge with `qtangl:host-sensor` provenance |
| FR-D4 | M | Code scan via CryptoScan + CryptoDeps orchestration |
| FR-D5 | M | Binary scan via CBOMkit-theia on OCI images |
| FR-D6 | M | Feature flags per tenant (default off) |
| FR-D7 | M | Async DiscoveryJob with poll API |
| FR-D8 | S | GitHub App + extended CI action |
| FR-D9 | S | Source-vs-runtime CBOM diff |
| FR-D10 | S | ServiceNow CMDB correlation for host coverage % |
| FR-D11 | C | JVM crypto tracer (opt-in enterprise) |

---

## Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-D1 | Agent install → first findings <15 min |
| NFR-D2 | 10k agents/tenant soak; p99 ingest <2s per 1k batch |
| NFR-D3 | Idempotent findingId dedupe |
| NFR-D4 | No private key bytes in transit or at rest |
| NFR-D5 | Scanner sandbox: read-only rootfs, 30 min timeout |

---

## Acceptance criteria by ship gate

| Gate | Acceptance |
|------|------------|
| G0 | Migrations applied; feature flags; schema v1 published; orchestrator deployable |
| G1 | Linux sensor + fleet UI; findings in dashboard CBOM count |
| G2 | code_scan job end-to-end; GitHub Action code mode |
| G3 | 3 OS packaging channels; CMDB coverage metric |
| G4 | Image scan + GitHub App; reachability UI |
| G5 | Enterprise pilot sign-off; comparison matrix updated to Yes |

---

## Related

- [ADR-009](../adrs/ADR-009-native-discovery-depth.md)
- [discovery-depth-expansion plan](../../../.cursor/plans/discovery_depth_expansion_176347d1.plan.md)
