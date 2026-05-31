# Database migrations

Qtangl uses SQLAlchemy models in `backend/app/db/models.py`.

When `DATABASE_URL` (or `QTANGL_DATABASE_URL`) is set, the API runs `init_db()` on startup if `QTANGL_DB_AUTO_MIGRATE=true` (default), which creates tables via `Base.metadata.create_all()`.

## Production setup

1. Provision Postgres and set `DATABASE_URL=postgresql+psycopg://...`
2. Optional: provision Redis and set `REDIS_URL=redis://...` for distributed rate limits and job queue notifications
3. Deploy two API instances — scan jobs and upload sessions are stored in Postgres, not process memory

## Local dev

Without `DATABASE_URL`, the API uses in-memory stores (same behavior as before D1).

To test persistence locally:

```bash
export DATABASE_URL=sqlite:///./qtangl-dev.db
export QTANGL_DB_AUTO_MIGRATE=true
uvicorn app.main:app --reload
```

## Environment variables (PQC product)

| Variable | Purpose |
|----------|---------|
| `QTANGL_PUBLIC_URL` | Base URL for email links and share links (default `https://www.qtangl.com`) |
| `QTANGL_REPORT_SIGNING_KEY_B64` | Stable Ed25519 signing key (base64) |
| `QTANGL_ENABLE_SCHEDULER` | `true` to enqueue due scheduled scans in the worker loop |
| `QTANGL_SCHEDULER_INTERVAL_SEC` | Worker scheduler tick interval (default 60) |
| `QTANGL_WORKER_MAX_RETRIES` | Scan job retries with backoff (default 3) |
| `QTANGL_ALERT_READINESS_DROP` | Alert when readiness drops by N points (default 5) |
| `QTANGL_SMTP_HOST` / `PORT` / `USER` / `PASSWORD` / `FROM` | Report email delivery (no-op when unset) |
| `QTANGL_STRIPE_SECRET_KEY` / `QTANGL_STRIPE_MONITOR_PRICE_ID` | Self-serve Monitor checkout |
| `QTANGL_SIGNUP_PROVISION_SECRET` | Manual Monitor tenant provision via `/public/monitor-provision` |
| `QTANGL_PQC_ENABLE_LIVE_SCAN` | Enable live outbound scanning |

New tables (`scheduled_scans`, `remediation_status`, `share_links`, `audit_log`) are created automatically via `create_all()` when persistence is enabled.

## Health checks

- `GET /health` — liveness
- `GET /health/ready` — Postgres + Redis ping when configured
