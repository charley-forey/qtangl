# Qtangl Backend

> **Canonical product overview:** [root README](../README.md) · **Architecture:** [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) · **Development:** [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)

**Qtangl PQC Readiness API** — FastAPI service for post-quantum crypto inventory, monitoring, remediation, signed evidence, and hybrid optimization demos.

**Version:** see `app/main.py` (currently `0.9.1`)

---

## What this service does

| Domain | Routes | Description |
|--------|--------|-------------|
| **PQC readiness** | `/pqc/*` | Scan lifecycle, reports, verify, transparency, CBOM |
| **Tenant / Monitor** | `/tenant/*` | Schedules, drift, webhooks, integrations, remediation |
| **Discovery** | `/tenant/discovery/*`, `/discovery/agent/*` | Host sensor, code/binary scans |
| **Convert** | `/tenant/remediation/*`, `/tenant/flips/*` | Remediation programs, crypto-flip |
| **Admin** | `/admin/*` | Tenant provisioning (`QTANGL_ADMIN_API_KEY`) |
| **Public** | `/public/*` | Signup, Stripe/WorkOS webhooks |
| **Labs demos** | `/hospital/*`, `/airline/*`, `/ev-fleet/*`, `/optimize` | Hybrid optimization showcases |

---

## Quick start

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.lock -r requirements-dev.lock
uvicorn app.main:app --reload
```

Default API key: `qtangl-demo-key` (`QTANGL_API_KEY`).

**Environment template:** [`backend/.env.example`](./.env.example) — copy to repo root `.env`.

**Docker Compose (Postgres + Redis + worker):** from repo root, `docker compose up --build`

---

## Run modes

| Mode | Requirements | Use |
|------|--------------|-----|
| **In-memory** | None | Local dev, CI — no persistence |
| **Postgres** | `DATABASE_URL` | Tenant data, scan history, RLS |
| **Monitor tier** | Postgres + Redis + worker | Scheduled re-scans, job queue |

```bash
# Worker (Monitor tier)
QTANGL_INLINE_JOBS=false QTANGL_ENABLE_SCHEDULER=true python -m app.worker
python -m alembic upgrade head
```

---

## PQC scanning

| Mode | How | Default |
|------|-----|---------|
| Fixture | `POST /pqc/scan` with `useFixture: true` | **Production default** |
| Live | `useFixture: false` + `target` | Requires `QTANGL_PQC_ENABLE_LIVE_SCAN=true` + allowlist |

```bash
curl -X POST http://127.0.0.1:8000/pqc/scan \
  -H "Authorization: Bearer qtangl-demo-key" \
  -H "Content-Type: application/json" \
  -d '{"scenarioId":"bank-tls-inventory","useFixture":true}'
```

Fixtures: `app/pqc/fixtures/` (mirrored from `demos/pqc_migration/data/`).

---

## Key endpoints

- `GET /health` · `GET /health/ready` · `GET /metrics`
- `POST /pqc/scan` · `GET /pqc/report/{scanId}` · `GET /pqc/verify/{scanId}`
- `GET /pqc/transparency/log` · `POST /pqc/cbom/ingest`

OpenAPI: [`docs/openapi.json`](./docs/openapi.json) · Export: `python scripts/export_openapi.py`

---

## Deploy (Railway)

Root directory: `backend/`. Production Dockerfile: [`Dockerfile`](./Dockerfile) (includes liboqs / ML-DSA).

Full env matrix: [`docs/RAILWAY_DEPLOY.md`](./docs/RAILWAY_DEPLOY.md)

| Service | Command |
|---------|---------|
| API | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Worker | `python -m app.worker` |

**Critical:** `QTANGL_PUBLIC_URL` = web origin (`https://www.qtangl.com`), not `api.qtangl.com`.

---

## Testing

```bash
QTANGL_ENABLE_QAOA=false python -m pytest tests/ -q --tb=short
```

---

## Related

- Offline verifier: [`verifier/`](./verifier/) (`pip install qtangl-verify`)
- Benchmarks: [`benchmarks/`](./benchmarks/) (BM-001 through BM-006)
- Sensor staging smoke: [`docs/SENSOR_STAGING_SMOKE.md`](./docs/SENSOR_STAGING_SMOKE.md)
