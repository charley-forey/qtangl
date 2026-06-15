# Dashboard auth break-glass runbook

## When WorkOS / SSO is unavailable

1. **Automation keys still work** — long-lived `qtangl_…` API keys authenticate directly against FastAPI (`Authorization: Bearer …` or `X-Api-Key`).
2. **Legacy key paste** — if `QTANGL_DASHBOARD_AUTH_LEGACY_KEY=true`, operators can paste a tenant API key on `/dashboard` until WorkOS is restored.
3. **Platform admin** — use `QTANGL_ADMIN_API_KEY` + `/admin/*` to issue a new break-glass key via `POST /admin/tenants/{id}/keys`.

## Session TTL

| Layer | TTL |
|-------|-----|
| WorkOS AuthKit session | 8h sliding (WorkOS default) |
| BFF `X-Qtangl-Session` assertion | 8h (`BFF_SESSION_TTL_SECONDS`) |
| Dashboard session keys | 15 min |

## Offboarding an employee

1. Remove membership in WorkOS Admin Portal **or** `DELETE /tenant/members/{id}` (admin).
2. Webhook `organization_membership.deleted` revokes `dashboard_session_keys` for that user/tenant.
3. Rotate automation keys if the user had access to them.

## Rate limits

- API key rate limit: `QTANGL_RATE_LIMIT_PER_MINUTE` (default 300/min per key).
- Magic link sends: enforce in WorkOS dashboard (recommended 5/email/hour).

## Tier gates

- SSO Admin Portal: enterprise tier (`check_sso_feature`).
- Team invites: monitor+ (`check_team_invites_feature`).
- API key quota: free 1, monitor 5, enterprise unlimited (`check_api_key_quota`).
