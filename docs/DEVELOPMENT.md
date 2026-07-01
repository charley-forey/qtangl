# Qtangl development guide

Local setup, environment variables, testing, CI/CD, and automation for the Qtangl monorepo.

| Doc | Purpose |
|-----|---------|
| [Root README](../README.md) | Product overview, quick start, FAQ |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, services, deployment |
| [AGENTS.md](../AGENTS.md) | AI/agent contributor conventions |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | PR checklist and branch protection |

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Environment setup](#environment-setup)
3. [Quick start paths](#quick-start-paths)
4. [Docker Compose (full stack)](#docker-compose-full-stack)
5. [Windows development notes](#windows-development-notes)
6. [Environment variables](#environment-variables)
7. [Common tasks cookbook](#common-tasks-cookbook)
8. [Development workflows](#development-workflows)
9. [Testing](#testing)
10. [CI/CD](#cicd)
11. [Scripts reference](#scripts-reference)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Used by |
|------|---------|---------|
| Python | 3.13 | Backend, scripts, SDK codegen |
| Node.js | 20+ | Web frontend |
| Go | 1.22 | Sensor (optional) |
| Docker | 24+ | Compose stack (optional) |
| make | any | Optional — `Makefile` shortcuts |

**Shortcuts:** `make help` · `./scripts/dev.sh help` · `.\scripts\dev.ps1 help`

---

## Environment setup

Copy the example env files — **never commit real secrets**:

```bash
# From repo root — backend reads .env at root or export vars manually
cp backend/.env.example .env

# Web local overrides
cp web/.env.example web/.env.local
```

Edit `.env` and `web/.env.local` for your machine. Key local defaults:

| File | Variable | Local value |
|------|----------|-------------|
| `.env` | `QTANGL_API_KEY` | `qtangl-demo-key` |
| `.env` | `QTANGL_CORS_ORIGINS` | include `http://localhost:3000` |
| `web/.env.local` | `NEXT_PUBLIC_QTANGL_API_BASE_URL` | `http://127.0.0.1:8000` |

Full annotated lists: [`backend/.env.example`](../backend/.env.example), [`web/.env.example`](../web/.env.example)

---

## Quick start paths

### Path A — Minimal (API + web, in-memory)

```bash
# Terminal 1 — backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.lock -r requirements-dev.lock
uvicorn app.main:app --reload

# Terminal 2 — web
cd web
npm ci
npm run dev
```

- API: http://127.0.0.1:8000
- Web: http://localhost:3000

### Path B — Monitor tier (Postgres + Redis + worker)

```bash
cd backend
python -m alembic upgrade head   # after setting DATABASE_URL

# Terminal 1
set QTANGL_INLINE_JOBS=false
set QTANGL_ENABLE_SCHEDULER=false
uvicorn app.main:app --reload

# Terminal 2
set QTANGL_INLINE_JOBS=false
set QTANGL_ENABLE_SCHEDULER=true
python -m app.worker
```

### Path C — Docker Compose

See [Docker Compose](#docker-compose-full-stack) below.

---

## Docker Compose (full stack)

Runs **Postgres + Redis + API + worker**. Web still runs on the host.

```bash
# From repo root
docker compose up --build

# Verify
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/health/ready

# Web (separate terminal)
cd web
npm ci
npm run dev
```

| Service | Port | Notes |
|---------|------|-------|
| postgres | 5432 | user/pass/db: `qtangl` |
| redis | 6379 | |
| api | 8000 | hot-reload on `backend/app` mount |
| worker | — | scheduler enabled |

**Compose defaults:** `QTANGL_API_KEY=qtangl-demo-key`, `QTANGL_ADMIN_API_KEY=qtangl-admin-dev-key`

Override via `docker-compose.override.yml` (gitignored) or env file.

Images use [`backend/Dockerfile.dev`](../backend/Dockerfile.dev) (no liboqs — faster builds). Production image: [`backend/Dockerfile`](../backend/Dockerfile).

---

## Windows development notes

### Quick start (PowerShell)

```powershell
# One-time setup
Copy-Item backend\.env.example .env
Copy-Item web\.env.example web\.env.local
.\scripts\dev.ps1 install

# Terminal 1 — API
.\scripts\dev.ps1 api

# Terminal 2 — Web
.\scripts\dev.ps1 web
```

### Python virtual environment

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.lock -r requirements-dev.lock
uvicorn app.main:app --reload
```

If script execution is blocked:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Environment variables

PowerShell (current session):

```powershell
$env:QTANGL_API_KEY = "qtangl-demo-key"
$env:DATABASE_URL = "postgresql+psycopg://qtangl:qtangl@localhost:5432/qtangl"
$env:QTANGL_INLINE_JOBS = "false"
$env:QTANGL_CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
```

For Docker Compose on Windows, use `docker compose up --build` from repo root (Docker Desktop required).

### Go sensor

```powershell
cd sensor
go build -o qtangl-sensor.exe .\cmd\qtangl-sensor
.\qtangl-sensor.exe --help
.\qtangl-sensor.exe --push   # after enroll
```

MSI packaging: [`sensor/packaging/msi/README.md`](../sensor/packaging/msi/README.md)

### Playwright E2E

```powershell
cd web
npm ci
npx playwright install chromium
npm run test:e2e
npm run test:e2e:assess   # subset
```

### HTTP / REST from PowerShell

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/pqc/scan `
  -Headers @{ Authorization = "Bearer qtangl-demo-key" } `
  -ContentType "application/json" `
  -Body '{"scenarioId":"bank-tls-inventory","useFixture":true}'
```

Or use `curl.exe` explicitly (not the PowerShell alias):

```powershell
curl.exe http://127.0.0.1:8000/health
```

### Common Windows issues

| Issue | Fix |
|-------|-----|
| `python` not found | Use `py -3.13` or add Python to PATH |
| Long path errors in npm | Enable long paths in Windows or use shorter clone path |
| Docker WSL2 backend | Ensure WSL2 integration enabled in Docker Desktop |
| Line endings in shell scripts | Use `dev.ps1` on Windows; `dev.sh` is for Git Bash/WSL |

---

## Environment variables

### Backend — minimum local

| Variable | Default | Purpose |
|----------|---------|---------|
| `QTANGL_API_KEY` | `qtangl-demo-key` | Demo API key |
| `DATABASE_URL` | *(none)* | Postgres — omit for in-memory |
| `REDIS_URL` | *(none)* | Redis queue |
| `QTANGL_INLINE_JOBS` | `true` | Sync vs queued jobs |
| `QTANGL_ENABLE_QAOA` | `false` | Hybrid optimizer (research) |
| `QTANGL_CORS_ORIGINS` | localhost + qtangl.com | CORS |

### Backend — PQC live scanning

| Variable | Default | Purpose |
|----------|---------|---------|
| `QTANGL_PQC_ENABLE_LIVE_SCAN` | `false` | Master live scan gate |
| `QTANGL_PQC_SCAN_ALLOWLIST` | *(empty)* | Authorized hostnames |
| `QTANGL_PQC_SCAN_TIMEOUT` | `8` | Per-endpoint timeout (s) |
| `QTANGL_PQC_MAX_ENDPOINTS` | `24` | Max probes per scan |

### Backend — production (Railway)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | **Required** — private Postgres URL |
| `REDIS_URL` | Worker queue |
| `QTANGL_SECRETS_KEY` | Fernet encryption for tenant secrets |
| `QTANGL_PUBLIC_URL` | **Web** origin (`https://www.qtangl.com`) — not API hostname |
| `QTANGL_REPORT_SIGNING_KEY_B64` | Stable Ed25519 signing key |
| `QTANGL_ADMIN_API_KEY` | Admin API |
| `QTANGL_INLINE_JOBS` | `false` |
| `QTANGL_ENABLE_SCHEDULER` | `true` on worker |
| `QTANGL_ENABLE_TRANSPARENCY_LOG` | Append-only evidence log |

Generate Fernet key:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Full matrix: [`backend/docs/RAILWAY_DEPLOY.md`](../backend/docs/RAILWAY_DEPLOY.md)

### Web — minimum local

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_QTANGL_API_BASE_URL` | API base URL |
| `NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY` | Assess sandbox key |
| `QTANGL_DASHBOARD_AUTH_WORKOS` | Enable WorkOS SSO |
| `WORKOS_API_KEY`, `WORKOS_CLIENT_ID` | WorkOS credentials |
| `QTANGL_BFF_SESSION_SECRET` | Dashboard session signing — **same value on API + web** |

---

## Common tasks cookbook

### Run a fixture PQC scan

```bash
curl -X POST http://127.0.0.1:8000/pqc/scan \
  -H "Authorization: Bearer qtangl-demo-key" \
  -H "Content-Type: application/json" \
  -d '{"scenarioId":"bank-tls-inventory","useFixture":true}'
```

### Download report (PDF / CBOM)

```bash
curl -H "Authorization: Bearer qtangl-demo-key" \
  "http://127.0.0.1:8000/pqc/report/{scanId}?format=pdf" -o report.pdf

curl -H "Authorization: Bearer qtangl-demo-key" \
  "http://127.0.0.1:8000/pqc/report/{scanId}?format=cbom" -o inventory.json
```

### Verify a report offline

```bash
cd backend
pip install -e verifier
python scripts/qtangl_verify.py path/to/report.json --api-base http://127.0.0.1:8000
```

### Provision a pilot tenant

```bash
export QTANGL_ADMIN_SECRET=your-admin-key   # maps to QTANGL_ADMIN_API_KEY on server
python backend/scripts/provision_tenant.py \
  --base-url http://127.0.0.1:8000 \
  --name "Pilot Co" \
  --tier monitor \
  --domains "customer.example.com"
```

### Enroll and run host sensor

```bash
cd sensor
go build -o qtangl-sensor ./cmd/qtangl-sensor

# Enroll (token from dashboard → Settings → Discovery)
./qtangl-sensor --enroll ENROLLMENT_TOKEN --api-url http://127.0.0.1:8000

# Scan and push
./qtangl-sensor --push
```

### Regenerate OpenAPI + SDK types

```bash
python backend/scripts/export_openapi.py
python scripts/generate_sdk_types.py
git diff backend/docs/openapi.json sdk/python/qtangl/_generated_models.py sdk/typescript/src/generated/schema.d.ts
```

### Run production smoke (against deployed API)

```bash
python backend/scripts/verify_production_rollout.py --full
python backend/scripts/conversion_smoke.py
```

### Run benchmarks

```bash
cd backend
python benchmarks/run_benchmark.py BM-006 --write
python -m pytest tests/test_benchmark_regression.py -q
```

### Refresh Python lockfiles

```bash
cd backend
pip install pip-tools
pip-compile requirements.txt -o requirements.lock --resolver=backtracking --strip-extras
pip-compile requirements-dev.txt -o requirements-dev.lock --constraint requirements.lock --strip-extras
```

---

## Development workflows

### API / schema changes

1. Update Pydantic models and route handlers in `backend/app/`
2. `python backend/scripts/export_openapi.py`
3. `python scripts/generate_sdk_types.py`
4. Update docs under `web/app/docs/`
5. `cd web && npm run generate:docs-index && npm run check:docs`
6. Add entry to `web/lib/docs/changelog.ts` if user-visible

### Docs changes

```bash
cd web
npm run generate:docs-index
npm run generate:docs-export
npm run check:docs
```

### QAOA research mode

```bash
export QTANGL_ENABLE_QAOA=true
export QTANGL_QAOA_MAX_BINARY_VARIABLES=12
python backend/benchmarks/run_benchmark.py BM-001 --write
```

### Parallel web worktrees

See [`scripts/web-worktrees/AGENT_CONTRACT.md`](../scripts/web-worktrees/AGENT_CONTRACT.md)

---

## Testing

### Backend

```bash
cd backend
pip install -r requirements.lock -r requirements-dev.lock
QTANGL_ENABLE_QAOA=false python -m pytest tests/ -q --tb=short
```

Targeted suites:

```bash
python -m pytest tests/test_pqc_safety.py -q           # SSRF
python -m pytest tests/test_crypto_flip.py -q          # Crypto-flip
python -m pytest tests/test_discovery_enterprise.py -q # Discovery
python -m pytest tests/test_benchmark_regression.py -q # BM-001/003/006
```

### Web

```bash
cd web
npm ci
npm run lint
npm run build
npm run test:access
npm run test:assess-config
npm run test:e2e              # full Playwright
npm run test:e2e:assess        # assess subset
```

### SDK

```bash
cd sdk/typescript && npm test
python -m pytest sdk/python/tests -q
python backend/scripts/sdk_smoke.py --local
```

### Sensor

```bash
cd sensor && go test ./...
```

### Pre-commit

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

---

## CI/CD

Workflows: [`.github/workflows/`](../.github/workflows/)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push/PR main, develop | Backend, web, SDK, E2E, OpenAPI sync, gitleaks, benchmarks |
| `sensor-build.yml` | `sensor/**` | Cross-platform Go build |
| `staging-smoke.yml` | cron + manual | Conversion smoke |
| `production-smoke.yml` | daily | Production verification |
| `pqc-dogfood.yml` | cron | Live self-scan of qtangl.com |
| `publish-sdk.yml` | tag `sdk-v*` | PyPI + npm SDK publish |

### Pre-PR commands (match CI)

```bash
cd backend && QTANGL_ENABLE_QAOA=false python -m pytest tests/ -q --tb=short
cd web && npm ci && npm run lint && npm run build && npm run check:docs
node scripts/sync-readme-stats.mjs
node scripts/check-readme-links.mjs
node scripts/alignment-check.mjs
```

### README version sync

CI runs `node scripts/sync-readme-stats.mjs` — ensures README API version badge matches `backend/app/main.py`.

---

## Scripts reference

### Root (`scripts/`)

| Script | Purpose |
|--------|---------|
| `generate_sdk_types.py` | OpenAPI → SDK codegen |
| `sync-readme-stats.mjs` | README auto-stats + version badge gate |
| `check-readme-links.mjs` | Relative link validation in README/docs |
| `alignment-check.mjs` | Marketing tier vs coverage matrix |
| `trust-copy-check.mjs` | Trust page copy consistency |
| `build_library_index.py` | Learn library index |

### Backend (`backend/scripts/`)

| Script | Purpose |
|--------|---------|
| `export_openapi.py` | Export OpenAPI artifact |
| `check_openapi_sync.py` | Verify artifact committed |
| `provision_tenant.py` | Create tenant + API key |
| `verify_production_rollout.py` | Production smoke |
| `qtangl_verify.py` | Offline verify CLI |
| `sdk_smoke.py` | SDK integration smoke |
| `run_benchmark.py` | Benchmark harness |

### Web (`web/scripts/`)

| Script | Purpose |
|--------|---------|
| `prebuild.mjs` | Pre-build codegen |
| `check_docs_*.mjs` | Docs gates |
| `check_schema_sync.mjs` | Schema sync check |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Monitor schedules never fire | No worker or scheduler | Run `python -m app.worker` with `QTANGL_ENABLE_SCHEDULER=true`, Redis, `QTANGL_INLINE_JOBS=false` |
| Live scan returns 403 | Live scan disabled | Set `QTANGL_PQC_ENABLE_LIVE_SCAN=true` + allowlist; use `useFixture: true` for demos |
| CORS error from localhost | Origins not allowed | Add `http://localhost:3000` to `QTANGL_CORS_ORIGINS` |
| Dashboard login fails locally | WorkOS not configured | Set WorkOS vars + matching `QTANGL_BFF_SESSION_SECRET` on API and web; or enable legacy API key mode |
| Verify links point to wrong host | `QTANGL_PUBLIC_URL` wrong | Set to **web** origin (`http://localhost:3000` locally), not API URL |
| `QTANGL_SECRETS_KEY` invalid | Bad Fernet key | Regenerate with cryptography Fernet one-liner above |
| Alembic fails on SQLite | Migration incompatibility | Use Postgres for full feature testing; CI uses SQLite for subset |
| Docker API can't connect DB | Postgres not ready | Wait for healthcheck; `docker compose ps` |
| OpenAPI sync CI failure | Schema changed, artifact stale | Run export + generate_sdk_types, commit artifacts |
| Playwright fails on Windows | Browser not installed | `npx playwright install chromium --with-deps` |

More ops runbooks: [`docs/runbooks/`](../docs/runbooks/), [`backend/docs/RAILWAY_DEPLOY.md`](../backend/docs/RAILWAY_DEPLOY.md)
