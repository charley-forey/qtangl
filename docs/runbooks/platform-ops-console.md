# Platform ops console

Internal super-admin console for Qtangl employees at `/ops`.

## Access

- Sign in with WorkOS (same as dashboard).
- Email must end with `@qtangl.com`, or appear in `QTANGL_OPS_EMAIL_ALLOWLIST`.
- Server layout at `web/app/ops/layout.tsx` redirects others to `/dashboard/login`.
- Dashboard shows **Ops console** link in workspace header for ops emails only.

## Architecture

| Layer | Path | Notes |
|-------|------|-------|
| UI | `/ops`, `/ops/tenants`, `/ops/users`, `/ops/funnel`, `/ops/dogfood` | Next.js App Router |
| BFF | `/api/ops/*` | Checks ops email; proxies to backend with `QTANGL_ADMIN_API_KEY` |
| API | `/admin/*` | Platform admin routes in `backend/app/api/admin.py` |

Never expose `QTANGL_ADMIN_API_KEY` to the browser.

## Required env (Vercel)

- `QTANGL_ADMIN_API_KEY` — same value as backend Railway
- WorkOS vars for dashboard auth
- Optional: `QTANGL_OPS_EMAIL_ALLOWLIST` for contractor emails

## Common tasks

### Provision a pilot tenant

1. Open `/ops` or `/ops/tenants`.
2. Use **Provision tenant** form: name, optional slug, tier, domains.
3. Copy the one-time API key shown after create.

### View platform usage

- `/ops` — tenant/user counts, tier breakdown, funnel snapshot, dogfood freshness.
- `/ops/users` — cross-tenant user list with memberships.
- `/ops/tenants` — **Export CSV** for tenant directory snapshots.

### MSSP portfolio and settings

1. Open `/ops/tenants/{tenantId}`.
2. **MSSP portfolio parent** — enter parent tenant ID → **Link parent tenant**.
3. **Settings merge** — edit JSON (e.g. `orgType`, `salesLed`) → **Merge settings**.

### Change tier

1. Open `/ops/tenants/{tenantId}`.
2. Select tier → **Update tier** (calls `PATCH /admin/tenants/{id}`).

### Issue or revoke automation keys

Tenant detail → **Issue key** or **Revoke** on an existing key row.

### View platform usage

- `/ops` — tenant/user counts, tier breakdown, funnel snapshot.
- `/ops/users` — cross-tenant user list with memberships.

## Audit

Mutating admin calls from the BFF include `X-Qtangl-Ops-Actor` with the signed-in ops user email. Backend logs this on tier changes, domain updates, tenant creation, key issue, MSSP parent links, and settings merges.

## CLI fallback

If the web console is unavailable, use `backend/scripts/provision_tenant.py` with `QTANGL_ADMIN_SECRET` against `POST /admin/tenants`.

See also: [dashboard-auth-break-glass.md](./dashboard-auth-break-glass.md).
