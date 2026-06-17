# Dashboard auth break-glass runbook

## When WorkOS / SSO is unavailable

1. Check **`GET /api/dashboard/auth-health`** on the web app — confirms which env vars are missing (`WORKOS_COOKIE_PASSWORD`, `NEXT_PUBLIC_WORKOS_REDIRECT_URI`, etc.).
2. **Automation keys still work** — long-lived `qtangl_…` API keys authenticate directly against FastAPI (`Authorization: Bearer …` or `X-Api-Key`).
3. **Legacy key paste** — if `QTANGL_DASHBOARD_AUTH_LEGACY_KEY=true`, operators can paste a tenant API key under **Settings → Advanced** on `/dashboard` until WorkOS is restored.
4. **Platform admin** — use `QTANGL_ADMIN_API_KEY` + `/admin/*` to issue a new break-glass key via `POST /admin/tenants/{id}/keys`.

## Required Vercel env (WorkOS)

| Variable | Notes |
|----------|-------|
| `QTANGL_DASHBOARD_AUTH_WORKOS` | Server flag `true` |
| `NEXT_PUBLIC_QTANGL_DASHBOARD_AUTH_WORKOS` | Client flag `true` — required for BFF connect without inference delay |
| `WORKOS_API_KEY` | From WorkOS dashboard |
| `WORKOS_CLIENT_ID` | From WorkOS dashboard |
| `WORKOS_COOKIE_PASSWORD` | Min 32 chars |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | e.g. `https://www.qtangl.com/auth/callback` |
| `QTANGL_BFF_SESSION_SECRET` | Must match Railway |

## Signed in but empty dashboard

1. `GET /api/dashboard/auth-health` — confirm `clientWorkosFlagSet`, `hasBffSessionSecret`, `bffSecretMatchesBackend`, `bootstrapReachable`.
2. DevTools → `GET /api/dashboard/me` after login:
   - `authenticated: false` + `reason: no_membership` → user needs invite or pending invite link on bootstrap.
   - `reason: bff_secret_missing` or `credentialsReady: false` → set matching `QTANGL_BFF_SESSION_SECRET` on Vercel + Railway.
3. `GET /api/dashboard/tenant/dashboard/summary` → expect 200; if 401, use **Sign out** then sign in again (session cookies re-minted on bootstrap).
4. `GET /api/dashboard/session-debug` (while signed in) — `credentialsReady` and `summaryOk` should be true; follow `recommendedAction` if present.
5. UI should show KPI strip or a stable error card — never a flashing skeleton/error loop or duplicate marketing landing after sign-in.

## WorkOS webhooks (membership linking)

Configure WorkOS to POST to:

`https://<railway-api-host>/public/workos/webhook`

Required events:

- `organization_membership.created`
- `organization_membership.deleted`
- `invitation.accepted`

Set `WORKOS_WEBHOOK_SECRET` on Railway to match the WorkOS dashboard signing secret. Without webhooks, invited users may sign in but see **No workspace linked** until bootstrap links a pending `TenantInvite`.

See [dashboard-auth-validation.md](../guides/dashboard-auth-validation.md) for the full release checklist.

## Session TTL

| Layer | TTL |
|-------|-----|
| WorkOS AuthKit session | 8h sliding (WorkOS default) |
| BFF `X-Qtangl-Session` assertion | 8h (`BFF_SESSION_TTL_SECONDS`) |
| Dashboard session keys | 8h (aligned with assertion) |

## Offboarding an employee

1. Remove membership in WorkOS Admin Portal **or** `DELETE /tenant/members/{id}` (admin).
2. Webhook `organization_membership.deleted` revokes `dashboard_session_keys` for that user/tenant.
3. Rotate automation keys if the user had access to them.

## Session expiry (operators)

- The dashboard shows a **session expired** banner when BFF calls return `401`.
- Users should use **Sign out** in the navbar, workspace header, or error card — navigates to `/api/dashboard/sign-out` and clears WorkOS + Qtangl cookies.
- Proactive warning is enabled for WorkOS BFF mode via client-side fetch interception.

## Weekly digest / board export email (SMTP)

Digest and scheduled board emails require SMTP on the **worker** process:

| Variable | Notes |
|----------|-------|
| `QTANGL_SMTP_HOST` | Required for any outbound email |
| `QTANGL_SMTP_PORT` | Default `587` |
| `QTANGL_SMTP_USER` / `QTANGL_SMTP_PASSWORD` | Optional auth |
| `QTANGL_SMTP_FROM` | From address |

Tenant toggles: `weeklyDigestEnabled`, `boardExportSchedule.enabled` in tenant settings.

## Rate limits

- API key rate limit: `QTANGL_RATE_LIMIT_PER_MINUTE` (default 300/min per key).
- Magic link sends: enforce in WorkOS dashboard (recommended 5/email/hour).

## Tier gates

- SSO Admin Portal: enterprise tier (`check_sso_feature`).
- Team invites: monitor+ (`check_team_invites_feature`). Admin workflow: [dashboard-team-roles.md](../guides/dashboard-team-roles.md)
- API key quota: free 1, monitor 5, enterprise unlimited (`check_api_key_quota`).
