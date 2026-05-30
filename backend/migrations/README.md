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

## Health checks

- `GET /health` — liveness
- `GET /health/ready` — Postgres + Redis ping when configured
