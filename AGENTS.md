# Qtangl — agent & contributor context

Guidance for AI coding agents and contributors working in this monorepo.

| Doc | When to read |
|-----|--------------|
| [README.md](./README.md) | Product overview, quick start |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Local setup, testing, env vars |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Services, routes, deployment |
| [docs/COMPLIANCE.md](./docs/COMPLIANCE.md) | Framework → artifact mapping |
| [docs/GTM.md](./docs/GTM.md) | Pricing, competitors, ICP |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | PR checklist |

---

## Product north star

**Assess → Monitor → Convert** with signed evidence auditors can verify independently.

Quantum is the **threat** on the PQC path, not the engine. Hybrid optimization (`POST /optimize`, hospital/airline demos) is the **expansion story** — mention only when relevant.

## Method honesty (required in user-facing copy)

- Qtangl is an **inventory aid, not a formal audit**
- Quantum-vulnerable algorithms are **not broken today** — we quantify exposure
- Verification confirms **report integrity and signing** — not complete estate coverage
- Do **not** claim certification, CMMC attestation, or Q-Day prediction

---

## Monorepo map

```
backend/     FastAPI API (Python 3.13) — source of truth for OpenAPI
web/         Next.js 16 frontend — public docs in web/app/docs/
sensor/      Go host discovery agent
sdk/         python/, typescript/, react/ — generated types from OpenAPI
docs/        Internal ops/compliance — NOT the public docs site
roadmap/     Strategy — quantum-readiness/ is primary initiative
```

**Public docs site:** `web/app/docs/` · **Internal runbooks:** `docs/`

---

## Do not edit (generated)

These files are codegen outputs — regenerate instead of hand-editing:

- `backend/docs/openapi.json`
- `sdk/python/qtangl/_generated_models.py`
- `sdk/typescript/src/generated/schema.d.ts`
- `web/content/library/` index outputs from build scripts

## OpenAPI / SDK sync workflow

After API schema changes:

```bash
python backend/scripts/export_openapi.py
python scripts/generate_sdk_types.py
# Commit openapi.json + both generated type files
```

CI enforces sync via `check_openapi_sync.py` and `git diff` on generated files.

---

## Test commands (CI-equivalent)

```bash
# Backend
cd backend && QTANGL_ENABLE_QAOA=false python -m pytest tests/ -q --tb=short

# Web
cd web && npm ci && npm run lint && npm run build

# README gates
node scripts/sync-readme-stats.mjs
node scripts/check-readme-links.mjs

# Or use Makefile / dev scripts
make test
./scripts/dev.sh test
```

---

## Key conventions

| Topic | Convention |
|-------|------------|
| Python deps | Pin via `requirements.lock` — not raw `requirements.txt` in CI |
| API version | `backend/app/main.py` → sync README badge |
| Live PQC scans | Off by default; use `useFixture: true` in dev/CI |
| Monitor tier | Requires Postgres + Redis + worker + scheduler |
| `QTANGL_PUBLIC_URL` | Web origin for links in PDFs — **not** API hostname |
| Admin provisioning | `QTANGL_ADMIN_API_KEY` on server; scripts use `QTANGL_ADMIN_SECRET` |
| Commits | Only when user explicitly asks |
| Scope | Minimal diffs — match surrounding code style |

---

## Primary API workflow

1. `POST /pqc/scan` — start inventory (`useFixture: true` for demos)
2. `GET /pqc/scan/{scanId}` — poll until complete
3. `GET /pqc/report/{scanId}?format=cbom|pdf|json|bundle` — export
4. `GET /pqc/verify/{scanId}` or `qtangl-verify` CLI — verify signatures

**Base URL:** `https://api.qtangl.com` · **Auth:** `Authorization: Bearer <api-key>`

---

## Parallel web development

Use git worktrees per [`scripts/web-worktrees/AGENT_CONTRACT.md`](./scripts/web-worktrees/AGENT_CONTRACT.md).

---

## External references

- Docs hub: https://www.qtangl.com/docs
- OpenAPI: https://api.qtangl.com/openapi.json
- Trust: https://www.qtangl.com/trust
- Security disclosure: [.github/SECURITY.md](./.github/SECURITY.md)
