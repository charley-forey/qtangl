# Vertical Playbook — Government & Defense Contractors

Go-to-market playbook for the defense industrial base (DIB), federal contractors, and gov-adjacent SaaS on a FedRAMP path. Scenario pack: `gov-contractor-cmmc`.

---

## Why this vertical

| Factor | Detail |
|--------|--------|
| Urgency | NSM-10 mandate; CMMC 2.0 enforcement; CNSA 2.0 timelines |
| Contract risk | Crypto posture tied to contract eligibility ($8–15M est. exposure) |
| Pain | Must evidence crypto inventory + migration planning for audits |
| Data sensitivity | National-security-relevant data → severe HNDL concern |

---

## Buyer map

| Role | Care about |
|------|------------|
| CISO / ISSO | NSM-10, CNSA 2.0, authorization posture |
| CMMC / compliance officer | CMMC Level 2 evidence |
| VP Engineering | Migration across classified-adjacent + commercial systems |
| Contracts / capture | Eligibility, primes' flow-down requirements |

---

## Frameworks & drivers

| Framework | Relevance |
|-----------|-----------|
| NSM-10 | Federal PQC migration mandate |
| CNSA 2.0 | NSA suite + deadlines |
| CMMC 2.0 (Level 2) | Crypto inventory for DIB |
| NIST SP 800-208 | Code/firmware signing (SLH-DSA) |
| FedRAMP (path) | Gov SaaS authorization (we provide evidence input, not authorization) |

Scenario fixture: [scenarios/gov-contractor-cmmc.json](../../../demos/pqc_migration/data/scenarios/gov-contractor-cmmc.json) · pack frameworks: CMMC L2, CNSA 2.0, SP 800-208.

---

## Discovery questions

- "What do your prime contractors flow down regarding PQC/crypto?"
- "Where are you in CMMC Level 2 readiness?"
- "Do you sign firmware/code — and with what algorithms?" (SP 800-208)
- "What's your timeline against CNSA 2.0?"

---

## Value framing

| Pain | Qtangl value |
|------|--------------|
| CMMC crypto evidence | Framework-mapped report + signed verify |
| Code/firmware signing exposure | SLH-DSA (FIPS 205) remediation guidance |
| Prime flow-down pressure | Fast inventory + roadmap to satisfy requirements |
| Continuous posture | Monitor drift for audit cycles |

---

## Compliance posture (be precise)

| We provide | We do NOT provide |
|------------|-------------------|
| Crypto inventory + CMMC control mapping evidence | Formal CMMC certification/attestation |
| FedRAMP-relevant evidence inputs | FedRAMP authorization (12–24 mo program) |
| Signed, verifiable reports | Legal compliance guarantee |

Position as "CMMC-ready evidence," never "FedRAMP authorized" ([17-legal-regulatory-and-compliance.md](../17-legal-regulatory-and-compliance.md)).

---

## Special considerations

| Item | Note |
|------|------|
| Export control | Crypto + gov = heightened EAR/ITAR awareness ([17](../17-legal-regulatory-and-compliance.md)) |
| Data residency | Some buyers require US-only processing |
| Channel | System integrators + GovCon resellers ([15-partnerships-and-ecosystem.md](../15-partnerships-and-ecosystem.md)) |
| Procurement | Longer cycles; marketplace/co-sell helps post-SOC2 |

---

## Demo emphasis

1. `gov-contractor-cmmc` scenario scan
2. CMMC L2 + CNSA 2.0 mapping
3. Code-signing (SP 800-208) remediation
4. Signed evidence for assessor/prime
5. Monitor for ongoing audit readiness

---

## Federal funding path

Non-dilutive SBIR and federal contracts validate the gov vertical while funding discovery + evidence development.

| Priority | Program | Action |
|----------|---------|--------|
| 1 | NSF SBIR Project Pitch | Submit first — lowest friction |
| 2 | NIST NCCoE PQC COI | Join for credibility |
| 3 | AFWERX Open Topic | DoD pilot via DSIP |

**Full playbook:** [24-federal-funding-and-grants.md](../24-federal-funding-and-grants.md) · [federal-funding/](../federal-funding/README.md)

---

## Related

- Federal funding: [24-federal-funding-and-grants.md](../24-federal-funding-and-grants.md)
- Legal/export: [17-legal-regulatory-and-compliance.md](../17-legal-regulatory-and-compliance.md)
- Partnerships (SI/GovCon): [15-partnerships-and-ecosystem.md](../15-partnerships-and-ecosystem.md)
- Solutions page spec: [04-website-transformation.md](../04-website-transformation.md) (`/solutions/government`)
