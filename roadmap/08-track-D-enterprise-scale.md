# 08 — Track D: Enterprise Scale

Infrastructure and platform scaling for multi-tenant production. Tenancy/auth details coordinate with Track G.

---

## Epic overview

| ID | Epic | Status | Effort | Depends on |
|----|------|--------|--------|------------|
| D1 | Persistent stores (Postgres + Redis) | `not-started` | L | G2 |
| D2 | Async job workers | `not-started` | M | D1 |
| D3 | Observability (tracing, logs, metrics) | `not-started` | M | I1 |
| D4 | OpenAPI + Postman collection | `not-started` | S | — |
| D5 | Official SDKs (Python + TypeScript) | `not-started` | M | D4 |
| D6 | Horizontal scaling + health checks | `not-started` | M | D1, D2 |

---

## D1 — Persistent stores

### Problem

In-memory state breaks multi-instance deployment:

| Store | Current location |
|-------|------------------|
| PQC report cache | `_report_cache` in [backend/app/api/pqc.py](../backend/app/api/pqc.py) |
| PQC scan jobs | [backend/app/pqc/jobs.py](../backend/app/pqc/jobs.py) |
| PQC upload sessions | [backend/app/pqc/sessions.py](../backend/app/pqc/sessions.py) |
| Hospital/airline/EV sessions | `*/sessions.py` modules |

### Approach

1. **Postgres schema:**
   - `tenants`, `api_keys`, `scan_jobs`, `scan_results`, `upload_sessions`, `remediation_items`
   - Row-level `tenant_id` on all customer data

2. **Redis:**
   - Job queue (RQ, Celery, or ARQ)
   - Rate limit counters
   - Short-lived cache

3. **Migration:** SQLAlchemy or raw SQL migrations in `backend/migrations/`

4. **Env:** `DATABASE_URL`, `REDIS_URL`

### Acceptance criteria

- [ ] Two Railway instances share job state correctly
- [ ] Upload session survives instance restart (24h TTL)
- [ ] Report download works after cache eviction (stored in Postgres)

---

## D2 — Async job workers

### Approach

1. Long-running tasks off HTTP thread:
   - PQC live scan ([backend/app/pqc/jobs.py](../backend/app/pqc/jobs.py) — already async pattern)
   - Large optimize jobs (>5s classical)
   - PDF report generation

2. Worker process: `python -m app.worker` (new module)

3. Poll pattern preserved: `GET /pqc/scan/{id}`

### Acceptance criteria

- [ ] Live PQC scan does not block API worker >2s
- [ ] Failed jobs retry once with backoff
- [ ] Job status visible in API + logs

---

## D3 — Observability

### Approach

1. **Request tracing:** `X-Request-Id` middleware — propagate to logs and response headers
2. **Structured logs:** JSON format with `tenant_id`, `endpoint`, `duration_ms`, `solver_path`
3. **Metrics:** Prometheus `/metrics` or Datadog agent — request count, latency histogram, QAOA attempt rate
4. **Error tracking:** Sentry integration

### Files

- New: `backend/app/middleware/tracing.py`
- Update: [backend/app/main.py](../backend/app/main.py)
- Docs: [web/app/docs/operations/observability/page.tsx](../web/app/docs/operations/observability/page.tsx)

### Acceptance criteria

- [ ] Every response includes `X-Request-Id`
- [ ] Log query finds full solve timeline by request ID
- [ ] Alert on 5xx rate >1% over 5min

---

## D4 — OpenAPI + Postman

### Approach

1. FastAPI auto-generates OpenAPI — export to `backend/openapi.json` in CI
2. Generate Postman collection from OpenAPI
3. Publish at `/docs/api` and link from [web/app/docs/sdks/page.tsx](../web/app/docs/sdks/page.tsx)

### Acceptance criteria

- [ ] `openapi.json` committed or generated on release
- [ ] Postman collection imports all `/pqc/*`, `/hospital/*`, `/optimize` endpoints
- [ ] Schema matches [web/lib/docs/schemas.ts](../web/lib/docs/schemas.ts)

---

## D5 — Official SDKs

### Python SDK

```
pip install qtangl
```

- Typed models mirroring Pydantic schemas
- `QtanglClient(api_key).optimize(...)`, `.pqc.scan(...)`, `.hospital.solve(...)`
- Publish to PyPI

### TypeScript SDK

```
npm install @qtangl/sdk
```

- Generated from OpenAPI (openapi-generator or hey-api)
- Used by web demo clients ([web/lib/api.ts](../web/lib/api.ts))

### Acceptance criteria

- [ ] SDK README with quickstart matching [web/app/docs/quickstart/page.tsx](../web/app/docs/quickstart/page.tsx)
- [ ] Integration test against staging API

---

## D6 — Horizontal scaling

### Approach

1. Stateless API instances behind Railway scaling
2. Health check: `GET /health` + deep check `GET /health/ready` (DB + Redis ping)
3. Connection pooling for Postgres
4. Graceful shutdown for in-flight jobs

### Acceptance criteria

- [ ] Scale to 2+ instances without session loss
- [ ] `/health/ready` fails when DB unreachable
- [ ] Zero-downtime deploy documented

---

## Related docs

- Architecture: [04-architecture-blueprint.md](./04-architecture-blueprint.md)
- Security/tenancy: [11-track-G-security-trust-compliance.md](./11-track-G-security-trust-compliance.md)
- Engineering ops: [13-track-I-engineering-operating-model.md](./13-track-I-engineering-operating-model.md)
