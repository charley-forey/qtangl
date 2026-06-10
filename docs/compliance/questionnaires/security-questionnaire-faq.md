# Security questionnaire FAQ (top 20)

**Version:** 0.1 · **Last updated:** 2026-06-10

Pre-answered buyer questions for 24h turnaround. Full CAIQ/SIG Lite drafts in this directory.

---

## General

**Q: What does Qtangl do?**  
A: Cryptographic Posture Management — discover quantum-vulnerable crypto, export CycloneDX CBOM, score Mosca HNDL risk, and produce signed reports verifiable at `/verify`.

**Q: Do you claim SOC 2 certification?**  
A: No. SOC 2 Type I observation is in progress; CPA report will be available under NDA when complete.

**Q: Where is data hosted?**  
A: Primary US (Railway Postgres/Redis, Vercel CDN). EU residency available by agreement.

**Q: Who are your sub-processors?**  
A: Public register at https://www.qtangl.com/trust/subprocessors

---

## Security controls

**Q: How are tenants isolated?**  
A: Row-level security in Postgres, hashed API keys, cross-tenant requests return 404.

**Q: How are reports integrity-protected?**  
A: SHA-256 content hash + ML-DSA-65 or Ed25519 signature; optional transparency log inclusion.

**Q: Do you scan customer internal networks?**  
A: Only targets the customer authorizes (external TLS, optional host sensor, code/binary CBOM). SSRF protections on scanner (`assert_scannable`).

**Q: How do you handle vulnerability reports?**  
A: https://www.qtangl.com/trust/disclosure — charley@qtangl.com, subject `[SECURITY]`, 2 business day ack SLA.

**Q: Is MFA required for admin access?**  
A: Required for GitHub, Railway, Vercel, Stripe (documented in access control matrix).

**Q: Do you run dependency scanning?**  
A: Yes — blocking pip-audit and npm audit in CI; Dependabot weekly.

**Q: Do you run secret scanning?**  
A: Yes — gitleaks in CI and optional pre-commit hook.

**Q: Penetration testing?**  
A: Scoped in `docs/compliance/pen-test-scope.md`; executive summary available under NDA after engagement.

---

## Data handling

**Q: Default retention?**  
A: 12 months for scan metadata and signed reports; configurable per tenant.

**Q: Can customers delete data?**  
A: Yes — `DELETE /tenant/scans/{id}` and key revocation.

**Q: Do you train ML on customer scan data?**  
A: No customer scan content is used to train third-party models without explicit agreement.

**Q: PHI / HIPAA?**  
A: Optional HIPAA track — customer BAA required before PHI pilots; see `hipaa-readiness.md`.

---

## Federal / compliance mapping

**Q: Does Qtangl satisfy NSM-10 / CNSA 2.0?**  
A: We help **customers** map inventory to those frameworks — we do not certify customer compliance.

**Q: CISA ACDI alignment?**  
A: Automated discovery and inventory tooling aligned with NIST SP 1800-38B methods.

**Q: CMMC?**  
A: We help DIB customers with crypto evidence; Qtangl CMMC assessment not completed — see `nist-800-171-gap-assessment.md`.

**Q: FedRAMP?**  
A: Out of scope for current phase; not claimed on marketing surfaces.

---

## Operations

**Q: Uptime / status page?**  
A: https://www.qtangl.com/status (polls `/health/ready`).

**Q: Do you scan yourselves?**  
A: Yes — dogfood program with public verify link via `GET /pqc/dogfood/latest`.

**Q: Questionnaire turnaround?**  
A: Target ≤ 3 business days with pre-filled CAIQ/SIG Lite drafts.

**Q: How to request DPA / SOC 2 / pen test summary?**  
A: https://www.qtangl.com/access — interest **Security diligence**.
