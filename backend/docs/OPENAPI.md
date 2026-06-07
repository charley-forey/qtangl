# OpenAPI / SDK

FastAPI exposes OpenAPI 3 schema automatically:

- **JSON:** `GET /openapi.json`
- **Swagger UI:** `GET /docs` (disable in production if desired)

## Official SDKs (v0.1)

| Language | Path |
|----------|------|
| Python | [sdk/python/qtangl_client.py](../../sdk/python/qtangl_client.py) |
| TypeScript | [sdk/typescript/qtangl.ts](../../sdk/typescript/qtangl.ts) |

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
