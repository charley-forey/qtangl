# Dashboard customer guide

## Sign in

1. Open [https://www.qtangl.com/dashboard](https://www.qtangl.com/dashboard).
2. Click **Sign in** (navbar or hero).
3. Complete WorkOS hosted sign-in (email magic link or enterprise SSO).

API keys for CI/automation are under **Settings → Advanced** after sign-in.

## First session checklist

| Step | Action |
|------|--------|
| 1 | Sign in to workspace |
| 2 | Run authorized baseline scan (Scans tab) |
| 3 | Create weekly monitoring schedule (Settings → Scheduled monitoring) |
| 4 | Invite teammates (Settings → Team, admin only) |

## Dashboard tabs

| Tab | Purpose |
|-----|---------|
| **Overview** | KPIs, readiness trend, executive digest, compliance rail |
| **Scans** | Scan history, baseline runner, exports |
| **Monitor** | Integrations, drift, cloud CBOM |
| **Remediate** | Remediation board and priorities |
| **Settings** | Alerts, team, SSO, schedules, API keys (advanced) |
| **Portfolio** | MSSP multi-customer rollup (when applicable) |

## Evidence exports

Use the sticky **Evidence exports** bar for one-click PDF, board, auditor, and evidence bundle downloads.

## Diagnostics

- Auth config: `GET /api/dashboard/auth-health` (booleans only, no secrets)
- Required Vercel env: see [web/.env.example](../../web/.env.example)

## Support

- Break-glass access: [dashboard-auth-break-glass.md](../runbooks/dashboard-auth-break-glass.md)
- SSO setup: `/docs/guides/sso-setup`
