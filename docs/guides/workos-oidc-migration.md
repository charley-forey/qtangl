# Migrating from env OIDC to WorkOS

The legacy `AUTH_OIDC_*` environment variables and `TenantOidcConfig` database rows are **deprecated** in favor of WorkOS AuthKit + Admin Portal.

## Steps

1. Enable WorkOS (`QTANGL_DASHBOARD_AUTH_WORKOS=true`) in staging.
2. Run `python backend/scripts/migrate_oidc_tenant_map.py --map-json '$AUTH_OIDC_TENANT_MAP'`.
3. Ask enterprise customers to re-connect IdP via **Dashboard → Settings → Configure SSO** (WorkOS Admin Portal).
4. Set per-tenant `auth_mode=sso_required` for enterprise orgs (automatic on admin provision).
5. After validation, remove `AUTH_OIDC_ISSUER`, `AUTH_OIDC_CLIENT_ID`, `AUTH_OIDC_CLIENT_SECRET`, and `AUTH_OIDC_TENANT_MAP` from Vercel env.
6. Deprecate `/api/auth/oidc/*` routes — use `/dashboard/login` and `/auth/callback` instead.

## Membership provisioning

WorkOS sign-in alone does not grant dashboard access. Each user needs a row in `tenant_memberships`:

| Path | When |
|------|------|
| **Self-serve first sign-in** | `/dashboard/login` — free workspace + admin membership (`QTANGL_DASHBOARD_SELF_SERVE_SIGNUP`) |
| WorkOS invite accepted | Webhook `organization_membership.created` (preferred) |
| Pending `TenantInvite` | Auto-linked on first bootstrap (admin sent invite from Settings → Team) |
| Admin pilot provision | `POST /admin/tenants` + team invite |
| Onboarding token | `/dashboard/login?onboarding=TOKEN` after Assess/Monitor signup email |

Admin invite workflow and role matrix: [dashboard-team-roles.md](./dashboard-team-roles.md).

If bootstrap returns 403, the user sees **No workspace linked** in the dashboard UI — not the logged-out marketing page.

## Dual-run period

Keep `QTANGL_DASHBOARD_AUTH_LEGACY_KEY=true` for 30 days so automation keys and key-paste still work while teams adopt sign-in.
