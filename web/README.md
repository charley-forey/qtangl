# Qtangl Web

> **Canonical product overview:** [root README](../README.md) · **Architecture:** [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) · **Development:** [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)

**Next.js 16** frontend for the Qtangl post-quantum readiness platform — marketing journey (Assess → Monitor → Convert), authenticated dashboard, public docs site, learn library, blog, and trust center.

---

## Stack

| Technology | Version |
|------------|---------|
| Next.js | 16 (App Router) |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| WorkOS AuthKit | Dashboard SSO |
| `@qtangl/sdk` + `@qtangl/sdk-react` | Monorepo file deps |

---

## Local development

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_QTANGL_API_BASE_URL=http://127.0.0.1:8000
npm ci
npm run dev
```

App: http://localhost:3000

**Backend must be running** at the URL in `.env.local` (default demo key: `qtangl-demo-key`).

**Docker Compose API:** `docker compose up` from repo root, then `npm run dev` here.

---

## Key routes

| Route | Purpose |
|-------|---------|
| `/assess`, `/assess/start` | Q-Day assessment funnel |
| `/monitor`, `/convert` | Journey marketing |
| `/dashboard` | Authenticated tenant workspace |
| `/verify`, `/trust` | Evidence verification |
| `/docs/*` | **Public** product documentation |
| `/learn/*` | Quantum software library |
| `/demo/hospital` | Optimization demo (expansion) |

Primary nav: Platform · Assess · Monitor · Convert · Pricing · Docs

---

## Dashboard

Six tabs: **Overview** · **Scans** · **Monitor** · **Remediate** · **Settings** · **Portfolio** (MSSP)

Auth: WorkOS SSO (primary) or legacy API key — see `web/.env.example`.

---

## Deploy (Vercel)

Set **Root Directory: `web`**.

`vercel.json` builds monorepo SDK packages on install.

Required env: `NEXT_PUBLIC_QTANGL_API_BASE_URL=https://api.qtangl.com`, WorkOS vars, `QTANGL_BFF_SESSION_SECRET`.

---

## Scripts

```bash
npm run dev
npm run lint
npm run build              # runs prebuild codegen
npm run test:e2e           # Playwright
npm run check:docs         # docs coverage gates
npm run generate:docs-index
```

---

## Project structure

```
web/
├── app/           # App Router pages
├── components/    # React components (dashboard, pqc, docs, marketing)
├── content/       # Learn library, readiness blog
├── lib/           # Nav, copy, assess config, docs index
├── public/        # Static assets, marketing screenshots
├── scripts/       # Prebuild, docs gates
└── tests/e2e/     # Playwright specs
```

> Public docs content lives here (`app/docs/`). Internal ops runbooks are in repo-root `docs/`.
