# Production go-live runbook

Repeatable activation for Qtangl backend (Railway) + web (Vercel). Run after merging release `0.9.0`.

## 1. Railway — API service

Set environment variables (see [`backend/.env.example`](../../backend/.env.example)):

| Variable | Production value |
|----------|------------------|
| `DATABASE_URL` | `postgresql+psycopg://…` |
| `REDIS_URL` | `redis://…` |
| `QTANGL_ENABLE_TRANSPARENCY_LOG` | `true` |
| `QTANGL_ENABLE_SCHEDULER` | `true` |
| `QTANGL_INLINE_JOBS` | `false` |
| `QTANGL_DB_AUTO_MIGRATE` | `true` |
| `QTANGL_REPORT_SIGNING_KEY_B64` | Generate once; stable across deploys |
| `QTANGL_PUBLIC_URL` | `https://www.qtangl.com` |
| `QTANGL_ADMIN_API_KEY` | Strong secret |
| `QTANGL_SIGNUP_PROVISION_SECRET` | Strong secret |
| `QTANGL_SMTP_*` | Report email + drip |
| `QTANGL_STRIPE_*` | Monitor/Convert/Enterprise price IDs + webhook secret |

### Alembic

```bash
cd backend
alembic upgrade head
```

Or rely on `QTANGL_DB_AUTO_MIGRATE=true` on first deploy.

## 2. Railway — worker service

Deploy a **second** Railway service using [`backend/railway.worker.json`](../../backend/railway.worker.json):

- **Start command:** `python -m app.worker`
- **Same env** as API (DATABASE_URL, REDIS_URL, scheduler flags, SMTP, anchoring)

The worker tick runs: scheduled scans, cloud pulls, onboarding drip, lifecycle sweeps, log anchoring.

## 3. Vercel — web

Set variables from [`web/.env.example`](../../web/.env.example):

- `NEXT_PUBLIC_QTANGL_API_BASE_URL`
- `NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY`
- `RESEND_API_KEY`, `QTANGL_ACCESS_TO_EMAIL`, `QTANGL_FROM_EMAIL`
- Optional: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`

Do **not** set `QTANGL_ACCESS_ALLOW_CONSOLE_FALLBACK` in production.

## 4. Smoke sequence

```bash
export QTANGL_API_BASE=https://your-api.up.railway.app
export QTANGL_API_KEY=your-tenant-or-demo-key

python backend/scripts/verify_production_rollout.py --full
python backend/scripts/verify_production_rollout.py --gtm
```

### Readiness gate

```bash
curl -s "$QTANGL_API_BASE/health/ready" | python -m json.tool
```

Expect:

- `persistenceEnabled`: true
- `redisEnabled`: true
- `scheduler.schedulerEnabled`: true
- `schedulerStale`: false

## 5. PyPI — qtangl-verify (Track B1)

1. Add `PYPI_API_TOKEN` to GitHub repository secrets.
2. Confirm [`backend/verifier/pyproject.toml`](../../backend/verifier/pyproject.toml) version.
3. Tag and push: `git tag verify-v1.1.0 && git push origin verify-v1.1.0`
4. Workflow [`.github/workflows/publish-verifier.yml`](../../.github/workflows/publish-verifier.yml) builds wheel + publishes.
5. Verify: `pip install qtangl-verify` from a clean virtualenv.

## 6. Stripe webhook

Register in Stripe Dashboard → Developers → Webhooks:

- URL: `https://<api>/public/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

## 6. Rollback

If `/health/ready` is degraded:

1. Set `QTANGL_ENABLE_SCHEDULER=false` to stop new scheduled jobs
2. Set `QTANGL_PQC_ENABLE_LIVE_SCAN=false` (default)
3. Fix DATABASE_URL / REDIS_URL connectivity
4. Re-run smoke scripts before re-enabling scheduler
