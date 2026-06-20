# Q-Day readiness — 3:20 demo script

**Loom recording:** shot-by-shot storyboard with tab clicks and timestamps → [loom-hero-demo-storyboard.md](./loom-hero-demo-storyboard.md)

**0:00** — "Your board wants a PQC migration plan before NSM-10 and NIST IR 8547 deadlines. Spreadsheets won't cut it."

**0:25** — Open `/assess?scenario=bank-tls-inventory&autorun=1` (Regional bank TLS inventory).

**0:45** — Confirm authorization checkbox, run **fixture scan** for predictable recording.

**1:10** — Walk scoreboard: 8 assets, 7 quantum-vulnerable, readiness score in the 30s.

**1:35** — Mosca inequality: X=10yr data, Y=5yr migration, Z=12yr to Q-Day — inequality holds → HNDL exposed.

**2:00** — Top remediation: RSA-2048 API gateway → ML-KEM-768 hybrid TLS.

**2:30** — Handshake proof panel: X25519MLKEM768, captured ClientHello excerpt.

**2:50** — **CBOM handoff (procurement / GRC):**
- Click **Migration report** → export **CBOM** (CycloneDX 1.6, Qtangl profile `qtangl-cbom-v1`).
- Explain each component: algorithm, key size, severity, Mosca priority, remediation deadline.
- Reference committed sample: `demos/pqc_migration/data/sample-cbom-bank-tls-inventory.json`.
- API path: `GET /pqc/report/{scanId}?format=cbom` after a scan completes.
- Note honesty disclaimers (inventory aid, not formal audit).

**3:10** — "Qtangl helps you on both sides of Q-Day — hybrid optimization today, migration readiness tomorrow."

## CBOM quick reference

| Field | Location in export |
|-------|-------------------|
| Schema ID | `metadata.properties[qtangl:cbomSchemaId]` → `qtangl-cbom-v1` |
| CycloneDX version | `specVersion` → `1.6` |
| Algorithm / key size | `components[].properties[qtangl:algorithm|keySize]` |
| Vulnerability class | `qtangl:vulnerabilityStatus`, `qtangl:severity` |
| Mosca priority | `qtangl:moscaPriority` |
| Remediation SLA | `qtangl:remediationDeadline`, `qtangl:remediationPqcAlgorithm` |

Validation: `python -m pytest backend/tests/test_pqc_cbom.py -q`
