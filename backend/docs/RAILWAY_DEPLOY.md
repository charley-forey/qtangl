# Railway production deploy

## Services

| Service | Start command | Required vars |
|---------|---------------|---------------|
| **API** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | `DATABASE_URL`, `QTANGL_API_KEY`, `QTANGL_PUBLIC_URL` |
| **Worker** | `python -m app.worker` | Same as API + `REDIS_URL`, `QTANGL_INLINE_JOBS=false`, `QTANGL_ENABLE_SCHEDULER=true` |
| **Redis** | Railway Redis plugin | `REDIS_URL` (auto-linked) |

Root directory: `backend/` (Dockerfile at `backend/Dockerfile`).

## API environment (minimum)

```
DATABASE_URL=postgresql://...
QTANGL_DB_AUTO_MIGRATE=true
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

## Smoke test

```bash
# Health only (no API key required)
python backend/scripts/production_smoke.py --health-only

# Full scan → PDF → verify → bundle (requires valid QTANGL_API_KEY)
QTANGL_API_BASE=https://your-service.up.railway.app \
QTANGL_API_KEY=your-key \
python backend/scripts/production_smoke.py
```

Production health verified: `GET /health/ready` returns `status: ready` with `persistenceEnabled: true`.

## Vercel (web)

```
NEXT_PUBLIC_QTANGL_API_BASE_URL=https://your-service.up.railway.app
NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY=<matches QTANGL_API_KEY or demo tenant key>
```

## Stripe self-serve (optional)

```
QTANGL_STRIPE_SECRET_KEY=sk_...
QTANGL_STRIPE_MONITOR_PRICE_ID=price_...
QTANGL_STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook URL: `https://your-api/public/stripe-webhook`
