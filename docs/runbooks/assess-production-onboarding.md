# Assess production onboarding runbook

Self-serve and sales-led paths into production Assess mode.

## Self-serve (`/assess/start`)

1. User submits work email, company, optional domain.
2. `POST /public/assess-signup` provisions free-tier tenant + onboarding token (24h TTL).
3. Welcome email contains:
   - Dashboard sign-in URL (`/dashboard/login?onboarding=TOKEN`) — **primary**
   - Assess production URL (`/assess?onboarding=TOKEN&mode=production`)
4. Client peeks token (`GET /public/onboarding-key/{token}?peek=true`) to load API key without redeeming.
5. User runs production baseline against allowlisted domains.

### Allowlist rules

- Domain auto-seeded when it matches work email domain (e.g. `api.example.com` for `user@example.com`).
- Mismatched domains return `allowlistSeeded: false` and a `warning` in the API response.

### Rate limits

- `QTANGL_ASSESS_SIGNUP_LIMIT_PER_HOUR` per email domain (default 5).

## Sales-led pilot

1. Provision tenant via `backend/scripts/provision_tenant.py` or admin API.
2. Send customer `/dashboard/login?onboarding=TOKEN` — not fixture autorun links.
3. Customer accepts legal terms in dashboard before first production scan.

## Onboarding failures

| Symptom | Action |
|---------|--------|
| 404 on onboarding link | Token expired or redeemed; re-issue via admin |
| No API key on peek (onboarding v2) | Expected — user must WorkOS sign-in |
| Domain not on allowlist | `PUT /admin/tenants/{id}/authorized-domains` or dashboard Settings |

## CRM webhook

Set `QTANGL_CRM_WEBHOOK_URL` to receive JSON on signup:

```json
{ "event": "assess_signup", "email": "...", "company": "...", "domain": "...", "tenantId": "..." }
```

## Tests

- `backend/tests/test_assess_signup.py`
- `backend/tests/test_onboarding_tokens.py` (peek)
- `web/tests/e2e/assess-production.spec.ts`

## Email-gated single-domain scan (intent picker)

Middle funnel on `/assess`: **Scan one domain (work email)** → `POST /public/assess-signup` with matching domain → one free production live scan → upsell to `/assess/start` for ongoing scans.

## Staging feature flags (Vercel)

```bash
NEXT_PUBLIC_ASSESS_MONITOR_CHECKOUT=true   # Monitor checkout beta on upsell block
NEXT_PUBLIC_ASSESS_PORTFOLIO=true          # R4 portfolio panel (staging only)
NEXT_PUBLIC_ASSESS_CBOM_IMPORT=true
NEXT_PUBLIC_ASSESS_AI_NARRATIVE=true
NEXT_PUBLIC_ASSESS_MSSP_WHITELABEL=true
NEXT_PUBLIC_ASSESS_PRODUCTION_MODE=true
```

## Readiness Index cohort (peer band)

Recruit `benchmarkOptIn` tenants via dashboard Settings → Benchmark opt-in until cohort ≥10 for real peer band on `/assess`. Track opt-in rate in PostHog; fallback copy shows when cohort is insufficient.
