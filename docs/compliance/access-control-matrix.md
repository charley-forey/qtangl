# Access control matrix

**Last updated:** 2026-06-10  
**Review cadence:** Quarterly

| System | Purpose | Admin(s) | MFA | Notes |
|--------|---------|----------|-----|-------|
| GitHub (qtangl org) | Source, CI, secrets | Founder | Required | Branch protection on main/develop |
| Railway | API, Postgres, Redis prod | Founder | Required | Separate staging project |
| Vercel | Web prod + previews | Founder | Required | Root `web/` |
| Stripe | Billing | Founder | Required | Dashboard + webhooks |
| Google Workspace / email | charley@qtangl.com | Founder | Required | Aliases TBD |
| Domain registrar | DNS | Founder | Required | |

**Service accounts**

| Credential | Scope | Rotation |
|------------|-------|----------|
| `QTANGL_ADMIN_API_KEY` | Admin API prod | Per secrets runbook |
| `QTANGL_DOGFOOD_API_KEY` | Dogfood tenant CI scans | On compromise |
| Tenant demo keys | Non-prod only | N/A |

Evidence: export MFA screenshots to Vanta/Drata during SOC 2 observation.
