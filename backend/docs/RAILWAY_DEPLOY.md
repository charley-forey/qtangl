# Railway production deploy

## Services

| Service | Start command | Required vars |
|---------|---------------|---------------|
| **API** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | **`DATABASE_URL` (required)**, `QTANGL_API_KEY`, `QTANGL_PUBLIC_URL`, `REDIS_URL` when using worker queue |
| **Worker** | `python -m app.worker` | **Same `DATABASE_URL` as API**, `REDIS_URL`, `QTANGL_INLINE_JOBS=false`, `QTANGL_ENABLE_SCHEDULER=true` |
| **Redis** | Railway Redis plugin | `REDIS_URL` (auto-linked) |

Root directory: `backend/` (Dockerfile at `backend/Dockerfile`).

## Custom domain (`api.qtangl.com`)

Production API URL: **`https://api.qtangl.com`** (not the `*.up.railway.app` hostname).

1. Railway → API service → **Settings → Networking → Custom Domain** → add `api.qtangl.com`.
2. At your DNS host for `qtangl.com`, add:
   - **CNAME** `api` → `ewxlpe42.up.railway.app` (Railway shows the exact target)
   - **TXT** `_railway-verify.api` → `railway-verify=…` (one-time verification)
3. Wait for Railway to show the domain as **Active** (TLS issued automatically).
4. Point clients at the custom domain:
   - **Vercel:** `NEXT_PUBLIC_QTANGL_API_BASE_URL=https://api.qtangl.com`
   - **GitHub (optional):** `QTANGL_PROD_API_BASE=https://api.qtangl.com`
   - **Stripe webhook:** `https://api.qtangl.com/public/stripe-webhook`

**Do not** set `QTANGL_PUBLIC_URL` to `api.qtangl.com`. That variable is the **web** origin (`https://www.qtangl.com`) for verify links, emails, and dashboard URLs embedded in PDFs and notifications.

Smoke after DNS is live:

```bash
curl -s https://api.qtangl.com/health/ready | python -m json.tool
```

## Postgres / Redis: private URLs only (avoid egress warnings)

Railway shows warnings on **`DATABASE_PUBLIC_URL`** and **`REDIS_PUBLIC_URL`** because those use `*.proxy.rlwy.net` (public TCP proxy). **Do not** point app services at them.

| Variable | Use for |
|----------|---------|
| **`DATABASE_URL`** | API, worker, migrations — private network (`RAILWAY_PRIVATE_DOMAIN` / internal host) |
| `DATABASE_PUBLIC_URL` | Local laptop, GUI clients, one-off `psql` from your machine only |
| **`REDIS_URL`** | API + worker — private Redis URL |
| `REDIS_PUBLIC_URL` | External debugging only |

On **API** and **worker** services: **Variables → Add variable reference** → select Postgres **`DATABASE_URL`** and Redis **`REDIS_URL`** from the plugins. Never set `DATABASE_URL=${{Postgres.DATABASE_PUBLIC_URL}}`.

## API environment (minimum)

```
QTANGL_ENV=production
DATABASE_URL=postgresql://...
QTANGL_DB_AUTO_MIGRATE=false
QTANGL_RUN_MIGRATIONS_ON_START=true
QTANGL_SECRETS_KEY=<fernet-key>
# Migrations: Docker CMD runs `alembic upgrade head`; API startup also patches missing columns.
# Do NOT set QTANGL_BUNDLE_STORAGE_URI=file:// on Railway — use Postgres bundle_json or s3:// only.
QTANGL_INLINE_JOBS=false
QTANGL_API_KEY=<production-demo-key>
QTANGL_ADMIN_API_KEY=<admin-secret>
QTANGL_RATE_LIMIT_PER_MINUTE=300
QTANGL_PUBLIC_URL=https://www.qtangl.com
QTANGL_REPORT_SIGNING_KEY_B64=<stable-ed25519-key>
QTANGL_CORS_ORIGINS=https://www.qtangl.com,https://qtangl.com
```

## Monitor tier (worker + scheduler)

```
REDIS_URL=redis://...
QTANGL_INLINE_JOBS=false
QTANGL_ENABLE_SCHEDULER=true
QTANGL_SCHEDULER_INTERVAL_SEC=60
QTANGL_WORKER_MAX_RETRIES=3
QTANGL_ALERT_READINESS_DROP=5
```

Optional alerts: `QTANGL_SMTP_*`, tenant Slack webhook via dashboard.

## Enable transparency log (post-deploy)

After migrations 004–006 apply and smoke tests pass:

1. Set `QTANGL_ENABLE_TRANSPARENCY_LOG=true` on the **API** service
2. Run `python scripts/backfill_transparency_log.py` once (Railway shell or local with prod `DATABASE_URL`)
3. Verify: `python scripts/verify_production_rollout.py --full`
4. Confirm trust page shows live root at `/trust`

See [evidence-layer-rollout.md](../quantum-readiness/runbooks/evidence-layer-rollout.md).

## Live dogfood self-scan (trust center G7)

Public trust widget reads `GET /pqc/dogfood/latest`. Configure on **API + worker**:

```
QTANGL_PQC_ENABLE_LIVE_SCAN=true
QTANGL_PQC_SCAN_ALLOWLIST=qtangl.com,www.qtangl.com,api.qtangl.com
QTANGL_ENABLE_TRANSPARENCY_LOG=true
QTANGL_DOGFOOD_TENANT_ID=dogfood
```

Operational steps:

1. Create a dedicated **dogfood** tenant (Monitor tier) — do not reuse the public sandbox key.
2. Issue an API key for that tenant; store as GitHub secret `QTANGL_DOGFOOD_API_KEY`.
3. Run a manual live scan against `www.qtangl.com` to seed the first bundle.
4. Verify: `GET /pqc/dogfood/latest` returns `verification.valid: true`.
5. Run `python scripts/verify_production_rollout.py --full` with the dogfood key after env is set.
6. Enable daily `pqc-dogfood.yml` live job and `dogfood-freshness.yml` monitor.

## Public Assess live demo (`test.openquantumsafe.org`)

For **Scan test.openquantumsafe.org** on https://www.qtangl.com/assess:

```
QTANGL_PQC_ENABLE_LIVE_SCAN=true
QTANGL_PQC_SCAN_ALLOWLIST=test.openquantumsafe.org,qtangl.com,www.qtangl.com
```

`QTANGL_SECRETS_KEY` must be a valid Fernet key (see troubleshooting below). Live scans update sandbox trial counters in Postgres — that path encrypts tenant settings.

## Troubleshooting: `Fernet key must be 32 url-safe base64-encoded bytes`

**Symptom:** `POST /pqc/scan` returns 500 on live scans; Assess UI shows the Fernet error.

**Cause:** `QTANGL_SECRETS_KEY` on Railway is missing, truncated, or not a Fernet key (common mistake: reusing another secret).

**Fix:**

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

1. Set `QTANGL_SECRETS_KEY` on **API and worker** to the generated value (same on both).
2. Redeploy API + worker.
3. Confirm: `curl -s https://api.qtangl.com/health/ready` → `secretsKey.valid` is `true`.

If you change the key after data was encrypted with an old key, re-save tenant settings or accept a one-time decrypt fallback (logged server-side).

## Smoke test

```bash
# Health only (no API key required)
python backend/scripts/production_smoke.py --health-only

# Full scan → PDF → verify → bundle (requires valid QTANGL_API_KEY)
QTANGL_API_BASE=https://api.qtangl.com \
QTANGL_API_KEY=your-key \
python backend/scripts/production_smoke.py
```

Production health verified: `GET /health/ready` returns `status: ready` with `persistenceEnabled: true`.

## Release acceptance checklist

After every production deploy:

```bash
python backend/scripts/verify_production_rollout.py --full
```

See [`docs/runbooks/release-acceptance-checklist.md`](../../docs/runbooks/release-acceptance-checklist.md), [`docs/runbooks/dogfood-production-enablement.md`](../../docs/runbooks/dogfood-production-enablement.md), and [`docs/runbooks/trust-visibility-go-live.md`](../../docs/runbooks/trust-visibility-go-live.md).

## Seed Command Center monitor estate (internal HQ)

After deploy (API or worker shell; `WORKDIR` is `/app`):

```bash
python scripts/seed_monitor_estate.py --email charley@qtangl.com
```

Dry run: append `--dry-run`. Requires `DATABASE_URL`. Live schedule ticks still need worker + `QTANGL_ENABLE_SCHEDULER=true` + `REDIS_URL`.

## Report unavailable (`scan_not_found`, `bundle_not_persisted`)

After deploy, the assess UI calls `POST /pqc/scan/{scanId}/persist` with the scan JSON so reports work even if the worker missed a DB write.

| `missingReason` | Meaning |
|-----------------|--------|
| `scan_not_found` | No `scan_jobs` row — API missing `DATABASE_URL`, worker not running, or `create_job` failed |
| `wrong_tenant` | Row exists under another tenant; Vercel API key ≠ Railway `QTANGL_API_KEY` tenant |
| `bundle_not_persisted` | Row exists but `bundle_json` empty and blob missing — re-scan or use persist |
| `scan_running` | Job still in queue |

Checklist:

1. **Both** Railway services (API + worker) reference the **same** `DATABASE_URL` from Postgres (not only on the Redis plugin).
2. `QTANGL_INLINE_JOBS=false` when `REDIS_URL` is set; worker runs `python -m app.worker`.
3. No `QTANGL_BUNDLE_STORAGE_URI=file://` (Postgres `bundle_json` or `s3://` only).
4. Redeploy **API + worker + Vercel** after pulling fixes (`POST /pqc/scan/{id}/persist`, RLS-safe scan DB session).
5. Vercel `NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY` must equal Railway `QTANGL_API_KEY` byte-for-byte.

## Vercel (web)

```
NEXT_PUBLIC_QTANGL_API_BASE_URL=https://api.qtangl.com
NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY=<matches QTANGL_API_KEY or demo tenant key>
```

## Stripe self-serve (optional)

```
QTANGL_STRIPE_SECRET_KEY=sk_...
QTANGL_STRIPE_MONITOR_PRICE_ID=price_...
QTANGL_STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook URL: `https://api.qtangl.com/public/stripe-webhook`
