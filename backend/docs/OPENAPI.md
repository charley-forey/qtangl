# OpenAPI / SDK

FastAPI exposes OpenAPI 3 schema automatically:

- **JSON:** `GET /openapi.json` (canonical artifact: `backend/docs/openapi.json`, synced to `web/public/openapi.json` in CI)
- **Swagger UI:** `GET /docs` (disable in production if desired)

Regenerate committed artifacts:

```bash
cd backend && python scripts/export_openapi.py
python scripts/generate_sdk_types.py
```

CI runs `python scripts/check_openapi_sync.py` to fail on drift.

## Official SDKs (v0.9 alpha)

| Language | Package | Path |
|----------|---------|------|
| Python | `qtangl` | [sdk/python/](../../sdk/python/) |
| TypeScript | `@qtangl/sdk` | [sdk/typescript/](../../sdk/typescript/) |

Scoped v0.1 alpha coverage: scan (+ poll), public verify, transparency log, tenant schedules. Includes retries, `Idempotency-Key` helpers, and offline verify via `qtangl-verify` (Python).

Legacy thin clients (deprecated): `sdk/python/qtangl_client.py`, `sdk/typescript/qtangl.ts`.

## Key endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/pqc/scan` | Bearer | Start scan |
| GET | `/pqc/report/{id}?format=pdf` | Bearer or api_key query | Download report |
| GET | `/pqc/verify/{id}` | Public | Verify signature + log inclusion |
| POST | `/pqc/verify` | Public | Verify pasted report JSON |
| GET | `/pqc/transparency/root` | Public | Current append-only log root |
| GET | `/pqc/transparency/keys` | Public | Signing key history |
| GET | `/pqc/transparency/{contentHash}` | Public | Inclusion proof for hash |
| POST | `/pqc/cbom/ingest` | Bearer | Ingest CycloneDX CBOM (1.6/1.7) |
| GET | `/pqc/cbom/sources` | Bearer | List CBOM ingest sources |
| GET | `/pqc/cbom/aggregate` | Bearer | Merged tenant CBOM + readiness view |
| GET | `/pqc/cbom/conflicts` | Bearer | Open merge conflicts |
| PUT | `/pqc/cbom/conflicts/{id}` | Bearer | Resolve merge conflict |
| GET | `/tenant/scans` | Bearer | List tenant scans |
| POST | `/tenant/schedules` | Bearer (write) | Create monitor schedule |
| POST | `/public/monitor-signup` | Public | Stripe checkout |

Export Postman collection: import `/openapi.json` into Postman (Track D4).
