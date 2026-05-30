# Contributing to Qtangl

Thank you for helping build Qtangl. This guide matches what runs in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Prerequisites

- **Python 3.13** (matches [backend/Dockerfile](backend/Dockerfile))
- **Node.js 20+** and npm
- Python on PATH for web prebuild scripts (`generate:library`, `generate:docs-index`)

## Local development

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.lock -r requirements-dev.lock
uvicorn app.main:app --reload
```

To refresh lockfiles after editing `requirements.txt` or `requirements-dev.txt`:

```bash
cd backend
pip install pip-tools
pip-compile requirements.txt -o requirements.lock --resolver=backtracking --strip-extras
pip-compile requirements-dev.txt -o requirements-dev.lock --constraint requirements.lock --strip-extras
```

Default API key for local demos: `qtangl-demo-key` (override with `QTANGL_API_KEY`).

### Web

```bash
cd web
npm ci
npm run dev
```

## Commands run in CI

Run these before opening a pull request:

```bash
# Backend tests (49+ tests)
cd backend
pip install -r requirements.lock -r requirements-dev.lock
QTANGL_ENABLE_QAOA=false python -m pytest tests/ -q --tb=short

# Web lint and production build
cd web
npm ci
npm run lint
npm run build
```

Optional:

```bash
# Web E2E (not in default CI yet — Phase 0 follow-up)
cd web
npm run test:e2e

# Access validation tests
npm run test:access
```

## Pull request checklist

- [ ] Backend tests pass locally
- [ ] Web lint and build pass locally
- [ ] No secrets or credentials in the diff (see [roadmap/security/secrets-runbook.md](roadmap/security/secrets-runbook.md))
- [ ] API or schema changes update docs under `web/app/docs/`
- [ ] Roadmap action item ID referenced in PR description when applicable (see [roadmap/backlog/action-items.md](roadmap/backlog/action-items.md))

## Branch protection (repository admins)

After the first CI run on `main`, enable branch protection:

1. GitHub → **Settings** → **Branches** → **Add rule** for `main`
2. Require status checks: **Backend (pytest)**, **Web (lint + build)**, **Secret scan (gitleaks)**, **Benchmarks (BM-001, BM-003, BM-006)**
3. Require branches to be up to date before merging

## Implementation roadmap

Engineering priorities and phased backlog: [roadmap/README.md](roadmap/README.md).

Phase 0 (foundation) action items: [roadmap/backlog/action-items.md](roadmap/backlog/action-items.md).

## Agent / worktree workflow

Parallel web work uses isolated git worktrees. See [scripts/web-worktrees/AGENT_CONTRACT.md](scripts/web-worktrees/AGENT_CONTRACT.md).
