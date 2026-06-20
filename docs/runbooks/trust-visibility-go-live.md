# Trust visibility go-live — execution plan

**Goal:** Ship trust visibility work to production, turn on live dogfood proof, verify the customer signup golden path once, and start the weekly scorecard ritual.

**Time budget:** ~3–4 hours active work on day 1; dogfood “7-day green” is calendar time.

**Prerequisites:** Railway admin, Vercel admin, GitHub repo admin (`QTANGL_ADMIN_SECRET`, secrets, workflow dispatch).

---

## Phase 0 — Deploy (30–45 min)

Deploy code from `main` so public trust surfaces and dashboard changes are live before dogfood config.

### 0.1 Merge / push

- Confirm CI green on the trust visibility commit on `main`.
- Vercel auto-deploys `www.qtangl.com` from `main`.
- Railway auto-deploys API + worker from `main` (or trigger manual deploy).

### 0.2 Railway sanity

| Check | Command / action |
|-------|------------------|
| API + worker share `DATABASE_URL` | Railway dashboard → both services |
| Worker running | `python -m app.worker` with `QTANGL_INLINE_JOBS=false` when Redis set |
| Health | `curl -s https://api.qtangl.com/health/ready` → `status: ready` |

### 0.3 Vercel sanity

| Variable | Expected |
|----------|----------|
| `NEXT_PUBLIC_QTANGL_API_BASE_URL` | `https://api.qtangl.com` |
| WorkOS keys | Present (dashboard sign-in) |

### 0.4 Post-deploy smoke

```bash
curl -sf https://api.qtangl.com/health/ready | jq -e '.status == "ready"'
QTANGL_API_BASE=https://api.qtangl.com python backend/scripts/verify_production_rollout.py
```

Full gate (after dogfood in Phase 1):

```bash
QTANGL_API_BASE=https://api.qtangl.com python backend/scripts/verify_production_rollout.py --full
```

### 0.5 Quick web smoke (no dogfood yet)

| URL | Expect |
|-----|--------|
| `/trust/dogfood` | Page loads (data may be empty until Phase 1) |
| `/status` | Platform status heading + API row |
| `/trust` | Trust center loads |

**Phase 0 done when:** `health/ready` is `ready`, web deploy is current, smoke script passes (non-`--full`).

**Runbook:** [`release-acceptance-checklist.md`](release-acceptance-checklist.md)

---

## Phase 1 — Dogfood production (60–90 min + 7 calendar days)

Turn the public trust loop from “code” into “proof.”

### 1.1 Provision tenant

From a machine with network access to prod API:

```bash
cd backend
export QTANGL_API_BASE_URL=https://api.qtangl.com
export QTANGL_ADMIN_SECRET=<your-admin-secret>

python scripts/provision_dogfood.py --admin-secret "$QTANGL_ADMIN_SECRET"
```

Save the printed API key securely. Optional: `--hq-tenant-id <your-hq-tenant>` to mirror dogfood on HQ Overview.

### 1.2 GitHub secret

Repo → Settings → Secrets → Actions:

- `QTANGL_DOGFOOD_API_KEY` = key from step 1.1

### 1.3 Railway env (API + worker)

| Variable | Value |
|----------|--------|
| `QTANGL_DOGFOOD_TENANT_ID` | `dogfood` |
| `QTANGL_PQC_ENABLE_LIVE_SCAN` | `true` |
| `QTANGL_ENABLE_TRANSPARENCY_LOG` | `true` |
| Domain allowlist vars | Per [`dogfood-production-enablement.md`](dogfood-production-enablement.md) / `.env.example` |

Redeploy API and worker after env changes.

### 1.4 First live CI scan

GitHub → Actions → **PQC dogfood scan** → Run workflow → `live: true`.

Wait for green. Then:

```bash
curl -s https://api.qtangl.com/pqc/dogfood/summary | jq '.freshness, .targets'
```

Pass: `allFresh: true`, targets have `scanId`.

### 1.5 Public trust checklist (30 min)

| # | Check | Pass |
|---|-------|------|
| 1 | `curl …/pqc/dogfood/summary` | `allFresh: true` |
| 2 | `/trust` | Widget scores + signature valid |
| 3 | `/trust/dogfood` | Multi-domain table, transparency link |
| 4 | `/verify?scanId=…` | Valid signature |
| 5 | `/status` | API OK, dogfood Operational |
| 6 | Footer on marketing page | Dogfood badge visible |
| 7 | `/.well-known/security.txt` | Valid |

### 1.6 Freshness monitor (calendar)

- `dogfood-freshness.yml` runs daily — confirm **7 consecutive green** runs.
- Optional: `DOGFOOD_SLACK_WEBHOOK_URL` for stale alerts.

**Phase 1 done when:** `allFresh` true today + 7-day freshness streak (or explicit waiver documented in tracker).

**Runbook:** [`dogfood-production-enablement.md`](dogfood-production-enablement.md), failure recovery [`dogfood-ci-failure.md`](dogfood-ci-failure.md)

---

## Phase 2 — Signup walkthrough (30–45 min)

Prove the **customer** loop separately from dogfood. Use a **new email** never used on prod.

### 2.1 Path A — Dashboard self-serve

| Step | Action | Pass |
|------|--------|------|
| 1 | `/dashboard` → WorkOS sign-in | Overview loads |
| 2 | `/api/dashboard/me` | `authenticated`, `tenantId`, `role: admin` |
| 3 | Onboarding: company + authorized domain | Saved |
| 4 | Scans → fixture `bank-tls-inventory` | Scan `done` |
| 5 | Overview | KPIs, checklist baseline cleared |
| 6 | Action queue | Recommendations visible |
| 7 | Monitor → create schedule | **Upgrade CTA** (free tier, not silent fail) |
| 8 | `/verify?scanId=…` | `verification.valid: true` |

### 2.2 Path C — Employee (if `@qtangl.com`)

- `DogfoodPostureCard` on HQ Overview
- `/ops/dogfood` loads (not login redirect)

### 2.3 Record evidence

Copy template from [`signup-acceptance-walkthrough.md`](signup-acceptance-walkthrough.md) into tracker or a private ops note:

```
Date:
Email:
Tenant ID:
Scan ID:
Sign-in: pass/fail
Fixture baseline: pass/fail
Free schedule block: pass/fail
Verify valid: pass/fail
Dogfood allFresh: pass/fail
```

**Phase 2 done when:** Path A steps 1–8 pass; IDs recorded.

**Runbook:** [`signup-acceptance-walkthrough.md`](signup-acceptance-walkthrough.md)

---

## Phase 3 — Scorecard ritual (15 min, then weekly)

Start the founder Monday ritual and fill **first row** of metrics.

### 3.1 First scorecard entry

Open [`trust-program-tracker.md`](../compliance/trust-program-tracker.md) → **Weekly acceptance scorecard**.

| Metric | How to fill (day 1) |
|--------|---------------------|
| Dogfood freshness pass rate | 100% if Phase 1.4 passed; else 0% |
| Trust → verify time | Manual: `/trust` → verify link (&lt;60s) or Playwright timing |
| Signup → first scan (TTFV) | From walkthrough wall-clock or PostHog `dashboard_ttfv` |
| Trust → assess signup | PostHog or “baseline TBD” |
| Monitor schedule within 14d | N/A until first Monitor upgrade |
| Recommendation CTR | N/A until traffic; note “first walkthrough only” |
| Maturity 1→3 in 30d | N/A until pilots |

### 3.2 Weekly ritual (every Monday, ~5 min)

1. Dogfood CI green? (`dogfood-freshness.yml`, no open `dogfood-stale` issues)
2. Funnel snapshot `/ops/funnel` (HQ) or PostHog
3. Update scorecard **Current** column
4. Rotate one persona walkthrough ([`trust-visibility-persona-playbooks.md`](../guides/trust-visibility-persona-playbooks.md))

### 3.3 Tracker row updates

In the same doc, update **Last verified** for:

- Live dogfood CI → `done` when 7-day green
- Signup acceptance walkthrough → date of Phase 2

**Phase 3 done when:** Scorecard has first real numbers + ritual scheduled (calendar reminder).

---

## Timeline (recommended)

```text
Day 0 (today)
  ├── Phase 0 Deploy          (~45 min)
  ├── Phase 1.1–1.5 Dogfood   (~90 min)
  └── Phase 2 Walkthrough     (~45 min)
  └── Phase 3 First scorecard (~15 min)

Day 1–7
  └── Phase 1.6 Watch dogfood-freshness.yml (passive)

Day 7
  └── Mark dogfood 7-day green in tracker; run verify_production_rollout.py --full
```

---

## Decision gates (do not skip)

| Gate | Blocker if red |
|------|----------------|
| `health/ready` not `ready` | Fix Railway DB/worker before dogfood |
| Dogfood `allFresh` false | Do not claim live self-scan in marketing |
| Signup verify fails | Fix auth/provisioning before pilots |
| Free schedule silently fails | Fix tier gating UX before Monitor sales |

---

## What comes after this plan

| When | Next action |
|------|-------------|
| Dogfood 7-day green | Outreach can cite `/trust/dogfood` in MSSP deck |
| First Monitor upgrade | [`monitor-pilot-template.md`](monitor-pilot-template.md) |
| First audit request | [`customer-proof-pack.md`](customer-proof-pack.md) + `generate_tenant_proof_pack.py` |
| Partner demo | [`mssp-portfolio-demo.md`](mssp-portfolio-demo.md) |
| Convert checkout | Only after Convert rec CTR ≥15% and 3+ verify-fix pilots (see trust visibility roadmap) |

---

## Quick reference links

| Doc | Purpose |
|-----|---------|
| [release-acceptance-checklist.md](release-acceptance-checklist.md) | Every deploy |
| [dogfood-production-enablement.md](dogfood-production-enablement.md) | Dogfood config |
| [signup-acceptance-walkthrough.md](signup-acceptance-walkthrough.md) | Customer golden path |
| [trust-program-tracker.md](../compliance/trust-program-tracker.md) | Scorecard + program status |
| [RAILWAY_DEPLOY.md](../../backend/docs/RAILWAY_DEPLOY.md) | Infra env reference |
