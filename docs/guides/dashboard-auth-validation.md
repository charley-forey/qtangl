# Dashboard auth validation checklist

Use this checklist before each pilot release or WorkOS configuration change.

## Environment parity

- [ ] Vercel: `QTANGL_DASHBOARD_AUTH_WORKOS=true` and `NEXT_PUBLIC_QTANGL_DASHBOARD_AUTH_WORKOS=true`
- [ ] Vercel + Railway: `QTANGL_BFF_SESSION_SECRET` matches exactly
- [ ] `GET /api/dashboard/auth-health` — all booleans true, `hasBffSessionSecret: true`, `clientWorkosFlagSet: true`
- [ ] WorkOS webhook delivers `organization_membership.*` events to Railway

## Signup / invite

- [ ] Admin invites operator → email → accept → `/dashboard` shows tenant name + KPIs
- [ ] Pending invite auto-links on first bootstrap when webhook is delayed
- [ ] Invited viewer cannot create scans or API keys
- [ ] Revoked member gets 403 on summary

## Sign-in

- [ ] WorkOS magic link → dashboard loads without logged-out landing duplicate
- [ ] SSO org → same behavior
- [ ] After callback, `?session=refresh` triggers session re-bootstrap
- [ ] Tenant switcher changes data without full reload
- [ ] Sign out clears cookies and returns to sign-in

## Session → data chain

- [ ] `GET /api/dashboard/me` → `authenticated: true` with `tenantId`, `role`, `capabilities`
- [ ] `GET /api/dashboard/tenant/dashboard/summary` → 200 with `kpis`, `recentScans`
- [ ] `GET /api/dashboard/session-debug` → `hasAssertionCookie: true`, `summaryOk: true` (when signed in)
- [ ] Signed-in user with no membership sees **No workspace linked** (not marketing landing)

## Data visibility

- [ ] KPIs match tenant scans
- [ ] Compliance rail shows posture for latest scan
- [ ] Board export works for admin
- [ ] Portfolio tab (MSSP) shows child tenants

## Role policies

- [ ] Viewer: overview + scans tabs only; compliance widgets visible
- [ ] Operator: monitor + remediate tabs visible
- [ ] Admin: settings team panel, API keys, SSO portal
- [ ] Admin can change member role in Settings → Team dropdown
- [ ] Admin removes member → 403 on next API call
- [ ] Free tier: Send invite returns upgrade/tier error (expected)
- [ ] Monitor tier: Send invite succeeds; pending invite visible in Team panel

See [dashboard-team-roles.md](./dashboard-team-roles.md) for admin workflow details.

## Failure modes

- [ ] BFF secret mismatch → auth-health shows `hasBffSessionSecret: false` or bootstrap 403
- [ ] Summary 401 → session refresh + retry before expiry banner
- [ ] Database unavailable → maintenance message (not infinite landing)

## Automated tests

- [ ] `pytest backend/tests/test_workos_auth.py`
- [ ] `pytest backend/tests/test_tenant_dashboard.py`
- [ ] `npx playwright test web/tests/e2e/dashboard-authenticated.spec.ts`
- [ ] `npx playwright test web/tests/e2e/dashboard-no-membership.spec.ts`
- [ ] `npx playwright test web/tests/e2e/dashboard-role-gating.spec.ts`
