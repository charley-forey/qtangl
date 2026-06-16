# Dashboard customer guide

## Sign in

1. Open [https://www.qtangl.com/dashboard](https://www.qtangl.com/dashboard).
2. Click **Sign in** (navbar or hero).
3. Complete WorkOS hosted sign-in (email magic link or enterprise SSO).

API keys for CI/automation are under **Settings → Automation API keys** after sign-in (admin only). Legacy key paste is hidden when WorkOS sign-in is enabled.

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

## Personas

Toggle **Operator** vs **Executive** in the dashboard header. Executive mode hides operator-only panels on Overview (runner, CBOM, integrations) and limits tabs to Overview, Scans, Settings, and Portfolio.

## Widget preferences

Under **Settings → Widget preferences**, pin or hide overview widgets (KPI, trend, digest, compliance, forecast, heatmap). Free-tier tenants have heatmap hidden by default.

## Weekly digest email

Enable under **Settings → Alert settings**:

- Toggle **Enable weekly digest email**
- Add comma-separated recipients
- Use **Send test digest** (admin) to preview via API
- Requires `QTANGL_SMTP_*` on the worker (see backend `.env.example`)

## MSSP portfolio

When your account manages multiple customer tenants, open the **Portfolio** tab for aggregate readiness, customers below threshold, and per-customer drill-down. Click a customer row to switch tenant context without a full page reload.

## Diagnostics

- Auth config: `GET /api/dashboard/auth-health` (booleans only, no secrets)
- Session chain: `GET /api/dashboard/me`, `GET /api/dashboard/session-debug` (when signed in)
- Release checklist: [dashboard-auth-validation.md](./dashboard-auth-validation.md)
- Required Vercel env: see [web/.env.example](../../web/.env.example)

## Support

- Break-glass access: [dashboard-auth-break-glass.md](../runbooks/dashboard-auth-break-glass.md)
- SSO setup: `/docs/guides/sso-setup`
