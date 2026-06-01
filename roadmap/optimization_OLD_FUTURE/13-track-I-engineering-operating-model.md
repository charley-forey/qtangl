# 13 — Track I: Engineering Operating Model

CI/CD, dependency management, environments, release process, test strategy, and agent/worktree workflow formalization.

---

## Epic overview

| ID | Epic | Status | Effort | Depends on |
|----|------|--------|--------|------------|
| I1 | CI/CD pipeline | `not-started` | M | — |
| I2 | Dependency pinning & reproducibility | `not-started` | S | — |
| I3 | Environment strategy | `not-started` | S | — |
| I4 | Branching, release, versioning | `not-started` | S | I1 |
| I5 | Test strategy & coverage targets | `not-started` | M | I1 |
| I6 | Agent/worktree workflow formalization | `not-started` | S | — |
| I7 | Definition of done (per component) | `not-started` | S | — |

---

## I1 — CI/CD pipeline

### Current state

- **No** `.github/workflows/` or equivalent
- Manual deploy to Railway + Vercel
- Tests run locally only

### Target pipeline

```yaml
# .github/workflows/ci.yml (conceptual)
on: [push, pull_request]
jobs:
  backend:
    - pip install -r requirements.txt
    - pytest backend/tests/
    - ruff check backend/ (optional)
  web:
    - npm ci in web/
    - npm run lint
    - npm run build
    - npx playwright test (on main or nightly)
  security:
    - gitleaks
    - pip audit / npm audit
```

### Deploy pipeline

| Branch | Backend | Web |
|--------|---------|-----|
| `main` | Railway production | Vercel production |
| `develop` | Railway staging | Vercel preview |
| PR | — | Vercel preview |

### Acceptance criteria

- [ ] PR cannot merge with failing backend tests
- [ ] Web build must pass on PR
- [ ] gitleaks runs on every push
- [ ] Deploy to staging on merge to `develop`

---

## I2 — Dependency pinning

### Problem

[backend/requirements.txt](../backend/requirements.txt) is unpinned:

```
fastapi
qiskit
qiskit-aer
...
```

Quantum stack versions drift → QAOA reproducibility breaks.

### Approach

1. Generate `requirements.lock` with `pip-compile` (pip-tools)
2. Pin major qiskit ecosystem to tested version set
3. Document upgrade procedure: run benchmarks after qiskit bump
4. Web: `package-lock.json` already exists — enforce `npm ci` in CI

### Acceptance criteria

- [ ] Lockfile committed; CI installs from lock
- [ ] README documents Python version (3.11+) and install steps
- [ ] Quarterly dependency review scheduled

---

## I3 — Environment strategy

| Env | Purpose | Backend URL | Data |
|-----|---------|-------------|------|
| **local** | Dev | localhost:8000 | In-memory / local Postgres |
| **staging** | Pre-prod QA | staging-api.qtangl.com | Staging Postgres |
| **production** | Customers | api.qtangl.com | Prod Postgres |

### Env var management

- Document all vars in [backend/README.md](../backend/README.md)
- `.env.example` at repo root and `backend/.env.example`
- Never commit secrets (G1)

### Acceptance criteria

- [ ] Staging environment exists and mirrors prod topology
- [ ] Env var diff documented between staging/prod

---

## I4 — Branching, release, versioning

### Model: GitHub Flow + tags

- `main` — always deployable
- Feature branches: `feat/a1-repair-window`, `fix/pqc-ssrf`
- Release tags: `v0.2.0`, `v0.3.0` (semver)

### Version alignment

- Backend: `app.main` version + git tag
- Web: `package.json` version
- Public changelog: [web/app/docs/resources/changelog/page.tsx](../web/app/docs/resources/changelog/page.tsx)

### Acceptance criteria

- [ ] Release checklist documented
- [ ] Changelog updated on each tag

---

## I5 — Test strategy

### Coverage targets

| Area | Current | Target (6 mo) | Target (12 mo) |
|------|---------|---------------|----------------|
| Backend unit | ~50 tests | 100 tests | 200 tests |
| Backend integration | Partial | All API routers | + load tests |
| Web e2e | Playwright specs exist | 4 demo flows CI | Full docs smoke |
| QAOA repro | 1 test | Golden snapshot suite | — |

### Test pyramid

```
        /  E2E (Playwright)  \
       /  Integration (API)   \
      /  Unit (pytest/jest)    \
```

### Critical paths (must have tests before GA)

- [ ] `/optimize` schedule happy path + infeasible
- [ ] `/pqc/scan` fixture + SSRF rejection
- [ ] `/hospital/solve` fixture scoreboard shape
- [ ] Auth: invalid key → 401
- [ ] Tenant isolation (after G3)

### Acceptance criteria

- [ ] CI runs backend tests on every PR
- [ ] Coverage report generated (no hard gate initially)
- [ ] E2E hospital + pqc on nightly build

---

## I6 — Agent/worktree workflow

### Current

[scripts/web-worktrees/AGENT_CONTRACT.md](../scripts/web-worktrees/AGENT_CONTRACT.md) defines scope rules for parallel web agents.

### Formalize for whole repo

1. Extend contract to backend agents
2. Epic branches map 1:1 to backlog epic IDs (e.g. `feat/A1-repair-window`)
3. PR template references epic ID + acceptance criteria checkbox
4. Agent prompts in `scripts/web-worktrees/prompts/` — index in README

### Acceptance criteria

- [ ] `CONTRIBUTING.md` at repo root references agent contract
- [ ] PR template in `.github/pull_request_template.md`

---

## I7 — Definition of done

### Per component

| Component | DoD |
|-----------|-----|
| **API endpoint** | OpenAPI documented, test, auth, error responses, rate limit |
| **Solver change** | Benchmark row updated, diagnostics preserved |
| **Demo vertical** | Fixture + live path documented, e2e test, scoreboard |
| **PQC feature** | SSRF review, safety test, report export |
| **Web page** | lint + build pass, a11y spot check |
| **Roadmap epic** | Acceptance criteria checked, epic status → done |

### Global DoD (every PR)

- [ ] Tests pass locally and in CI
- [ ] No secrets in diff
- [ ] Linked to backlog action item ID
- [ ] Docs updated if API contract changed

---

## Related docs

- Validation: [07-track-C-validation.md](./07-track-C-validation.md)
- Enterprise: [08-track-D-enterprise-scale.md](./08-track-D-enterprise-scale.md)
- Weekly review: [templates/weekly-review-template.md](./templates/weekly-review-template.md)
