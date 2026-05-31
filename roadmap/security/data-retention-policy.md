# Qtangl data retention and tenant data rights (G4)

**Effective:** 2026-05-31  
**Applies to:** Monitor and Assessment tier tenants with Postgres persistence

## Data we store

| Data type | Retention | Location |
|-----------|-----------|----------|
| Scan results (JSON bundles) | Until tenant delete or contract end + 30 days | Tenant Postgres (`scan_jobs`) |
| API keys (hashed) | Until revoked | Postgres (`api_keys`) |
| Share link tokens (hashed) | Until expiry or revoke | Postgres (`share_links`) |
| Audit log | 12 months rolling | Postgres (`audit_log`) |
| Remediation status | Co-terminus with scan | Postgres (`remediation_status`) |

## Tenant rights

- **Export:** `GET /tenant/export` — scan metadata and remediation velocity
- **Delete:** `DELETE /tenant/data` — removes all scan jobs for tenant (admin auth required)
- **Offboarding:** Contact hello@qtangl.com for full tenant deletion including keys and schedules

## Demo / sandbox

- Public demo uses fixture replay; no customer data stored unless tenant key is used
- Default sandbox tenant may be re-seeded on deploy

## Subprocessors

- Railway (hosting, Postgres)
- Vercel (web frontend)
- Stripe (billing, when enabled)

## Contact

Data requests: hello@qtangl.com
