# Qtangl — standards & compliance mapping

How Qtangl artifacts map to regulatory frameworks and industry standards. For product positioning, see [GTM.md](./GTM.md). For platform security posture, see [roadmap/quantum-readiness/12-platform-security-and-trust.md](../roadmap/quantum-readiness/12-platform-security-and-trust.md).

Public framework guides: [www.qtangl.com/q-day/frameworks](https://www.qtangl.com/q-day/frameworks)

---

## Framework → Qtangl artifact matrix

| Framework / standard | What auditors ask for | Qtangl deliverable | Code / content path |
|----------------------|----------------------|-------------------|---------------------|
| **NSM-10** (US national memo) | Inventory quantum-vulnerable systems; migration timeline | Readiness score, Mosca HNDL, remediation backlog | `app/pqc/risk.py`, `/assess` |
| **CNSA 2.0** | Approved algorithms timeline; deprecation dates | Per-asset algorithm classification, standards crosswalk | `app/pqc/standards.py`, [cnsa-2.0.md](../web/content/readiness/frameworks/cnsa-2.0.md) |
| **NIST IR 8547** | Transition guidance for protocols & applications | Remediation actions per asset, migration roadmap | `app/pqc/standards.py`, [nist-ir-8547.md](../web/content/readiness/frameworks/nist-ir-8547.md) |
| **NIST PQC (ML-KEM / ML-DSA)** | Hybrid TLS proof, algorithm readiness | PQ handshake proof, CBOM algorithm fields | `app/pqc/handshake.py`, [ml-kem.md](../web/content/readiness/frameworks/ml-kem.md) |
| **CMMC 2.0** (L2+) | Cryptographic module inventory, POA&M | **Healthcare/gov compliance pack**, CBOM export | `app/pqc/compliance_packs.py`, [cmmc.md](../web/content/readiness/frameworks/cmmc.md) |
| **FedRAMP / NIST 800-53** | Crypto inventory, continuous monitoring | Monitor schedules, drift diff, audit log | `/tenant/schedules`, `app/monitoring/` |
| **HIPAA / HNDL** | ePHI confidentiality over retention horizon | Mosca inequality score, HNDL timeline | `app/pqc/risk.py`, [hipaa-hndl.md](../web/content/readiness/frameworks/hipaa-hndl.md) |
| **PCI DSS 4.x** | Crypto inventory, key management | TLS/cert inventory, weak algorithm flags | [pci-dss-4.md](../web/content/readiness/frameworks/pci-dss-4.md) |
| **EU CRA** | Security-by-design, vulnerability handling | CBOM export, drift alerts, evidence vault | [eu-cra.md](../web/content/readiness/frameworks/eu-cra.md) |
| **Banking / FFIEC** | Board-level crypto risk reporting | Executive/board PDF export, readiness index | `app/pqc/report.py`, [banking-hndl.md](../web/content/readiness/frameworks/banking-hndl.md) |
| **Gov / defense HNDL** | Classified data retention vs quantum threat | HNDL scoring, gov contractor scenario fixture | [gov-hndl.md](../web/content/readiness/frameworks/gov-hndl.md) |
| **CycloneDX CBOM 1.6** | Machine-readable crypto inventory | `qtangl-cbom-v1` profile export + external ingest | `app/pqc/cbom.py`, `POST /pqc/cbom/ingest` |

---

## Evidence artifacts for audits

| Artifact | Format | Verify independently? | Endpoint / tool |
|----------|--------|----------------------|-----------------|
| Signed assessment report | PDF, JSON | Yes — signature + transparency log | `GET /pqc/report/{scanId}` |
| Cryptographic BOM | CycloneDX JSON | Yes — included in signed bundle | `?format=cbom` |
| Public verify link | HTML | Yes — no API key required | `GET /pqc/verify/{scanId}`, `/verify` |
| Offline verification | CLI JSON | Yes — `qtangl-verify` | `backend/scripts/qtangl_verify.py` |
| Transparency log entry | JSON | Yes — hash chain | `GET /pqc/transparency/log` |
| Evidence vault bundle | ZIP | Yes — contains signed report + CBOM + receipts | `/tenant/evidence` |
| Compliance pack overlay | PDF section | Partial — maps findings to control IDs | `compliance_packs.py` (bank, CMMC, healthcare) |
| Audit log export | CSV/JSON | Tenant-scoped activity | `GET /tenant/audit` |
| Drift report | JSON + UI | Compares scan N vs N-1 | `/tenant/drift/*` |

---

## Compliance packs (built-in)

| Pack | Vertical | Maps to |
|------|----------|---------|
| **Bank** | Financial services | FFIEC-style board reporting, TLS inventory emphasis |
| **CMMC** | Defense contractors | POA&M-oriented remediation backlog |
| **Healthcare** | Payers / providers | HIPAA HNDL framing, ePHI exposure |

Source: `backend/app/pqc/compliance_packs.py`

Fixture scenarios: `gov-contractor-cmmc`, `healthcare-insurer-hndl`, `bank-tls-inventory` in `demos/pqc_migration/data/scenarios/`

---

## What Qtangl is (and is not)

| Qtangl **is** | Qtangl **is not** |
|---------------|-------------------|
| Crypto inventory & risk quantification aid | Formal third-party audit or attestation |
| Signed evidence your team can attach to audit packs | CMMC certification body |
| Continuous monitoring for **drift** in crypto posture | Full GRC platform replacement |
| CBOM-compatible export (CycloneDX 1.6) | Replacement for CLM/HSM for key storage |

Method honesty is required in all customer-facing copy — see [AGENTS.md](../AGENTS.md).

---

## Internal compliance documentation

| Document | Path |
|----------|------|
| SOC 2 Type I kickoff | `docs/compliance/` |
| CAIQ-lite / SIG-lite responses | `docs/compliance/questionnaires/` |
| Data flow diagrams | `docs/compliance/` |
| Vendor assurance | `docs/compliance/vendor-assurance/` |
| Security overview | `docs/compliance/security-overview.md` |
| HIPAA / NIST 800-171 notes | `docs/compliance/` |

---

## Related

- [GTM.md](./GTM.md) — pricing, competitive positioning
- [ARCHITECTURE.md](./ARCHITECTURE.md) — evidence & signing flow
- [Trust center](https://www.qtangl.com/trust) — public security posture
- [Verify spec](./verify-spec.md) — signature verification contract
