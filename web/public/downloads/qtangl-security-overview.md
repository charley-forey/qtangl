# Qtangl Security Overview

**Version:** 0.1 (draft) · **Last updated:** 2026-06-10  
**Export:** Markdown source for PDF — share under NDA during enterprise diligence.

---

## 1. Company and product

Qtangl provides **Cryptographic Posture Management (CPM)**: automated discovery of quantum-vulnerable cryptography, CycloneDX CBOM export, Mosca HNDL scoring, and signed reports verifiable at `/verify`. We are an inventory and prioritization aid — not a formal audit or certification body.

---

## 2. Architecture and data flow

See [data-flow-diagram.md](./data-flow-diagram.md) and diagram at `/trust/security`.

- Tenants authenticate with API keys (hashed at rest).
- Scan jobs queue in Redis; workers probe allowed targets and persist bundles in Postgres (tenant-scoped RLS).
- Reports are signed (ML-DSA-65 or Ed25519) and optionally appended to a transparency log.
- Public verification at `GET /pqc/verify/{scanId}` requires no tenant credentials.

---

## 3. Encryption

| Layer | Control |
|-------|---------|
| In transit | TLS 1.2+ for all public endpoints |
| At rest | Postgres managed encryption; integration secrets encrypted with `QTANGL_SECRETS_KEY` |
| Reports | Content hash + post-quantum or classical signature |

---

## 4. Tenant isolation

- Row-level security on tenant-scoped tables (`backend/app/db/rls.py`).
- API keys stored as hashes; cross-tenant access returns 404.
- Audit log entries tagged by tenant where applicable.

---

## 5. Sub-processors

Public register: https://www.qtangl.com/trust/subprocessors

Primary: Railway (API/DB/Redis), Vercel (web), Stripe (billing), Resend (email). Infrastructure provider SOC 2 reports available under NDA — not a substitute for Qtangl SOC 2.

---

## 6. Retention and deletion

- Upload bundle sessions: 24 hours.
- Scan metadata and signed reports: default 12 months (configurable per tenant).
- Tenant offboarding: `DELETE /tenant/scans/{id}` and admin key revocation.

---

## 7. Vulnerability disclosure

Policy: https://www.qtangl.com/trust/disclosure  
Contact: charley@qtangl.com (subject `[SECURITY]`)  
Acknowledgement SLA: 2 business days.

---

## 8. SOC 2 status (honest)

SOC 2 Type I **observation in progress**. We do **not** claim SOC 2 certification until an independent CPA report is available under NDA. See [soc2-type1-kickoff.md](./soc2-type1-kickoff.md).

---

## 9. Federal alignment (customer aid)

Qtangl helps customers with CISA ACDI-style cryptographic discovery and inventory (NIST SP 1800-38B methods). We map findings to NSM-10, NIST IR 8547, and CNSA 2.0 frameworks — as an inventory aid for **customer** compliance programs, not as Qtangl attestation or certification.

---

## 10. What we help customers satisfy vs what we certify

| Qtangl provides | Qtangl does not provide |
|---------------|-------------------------|
| Crypto inventory, CBOM, signed evidence | SOC 2 / ISO / CMMC certification for customer |
| Framework mapping (NSM-10, CNSA 2.0) | Legal attestation or audit opinion |
| Drift monitoring and verify links | FedRAMP authorization |

See [17-legal-regulatory-and-compliance.md](../quantum-readiness/17-legal-regulatory-and-compliance.md).

---

## Document request

Enterprise artifacts (DPA, SIG/CAIQ responses, pen test executive summary) via https://www.qtangl.com/access — select **Security diligence**.
