# SOC 2 Type I — scoping document (G5)

**Target:** Q3 2026  
**Trust service criteria:** Security (required); Availability (optional phase 2)

## In-scope systems

| System | Role |
|--------|------|
| Qtangl API (Railway) | PQC scan, report, tenant API |
| Qtangl Web (Vercel) | Demo, dashboard, verify |
| Postgres (Railway) | Tenant data persistence |
| Redis (Railway) | Job queue, scheduler (Monitor tier) |

## Out of scope (phase 1)

- Hospital optimization workloads (separate pilot track)
- Customer on-prem deployments
- FedRAMP / IL5 environments

## Control themes to implement

1. **Access control** — API keys per tenant, admin key separation, role field on keys
2. **Encryption** — TLS in transit; Postgres at-rest via Railway; signed reports (Ed25519)
3. **Logging** — Audit log for share/create/delete; no cert material in application logs (G9)
4. **Change management** — GitHub CI, pinned dependencies (Track I2)
5. **Vendor management** — Railway, Vercel, Stripe DPAs

## Evidence already in product

- Signed report verify (`/pqc/verify/{scanId}`)
- Tenant isolation tests (`backend/tests/test_g3_d2_h.py`)
- Threat model (`roadmap/security/threat-model.md`)
- Data retention policy (`roadmap/security/data-retention-policy.md`)

## Recommended platform

Vanta or Drata — connect GitHub, Railway, Vercel for automated evidence collection.

## Milestone

- **Type I observation period:** 3 months after control implementation
- **Gate:** Required before PHI/gov pilots with production data
