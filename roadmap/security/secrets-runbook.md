# Secrets management runbook

**Epic:** G1 — Secrets hygiene  
**Owner:** Engineering  
**Last updated:** 2026-05-30

---

## Scope

| Secret | Where stored | Rotation cadence |
|--------|--------------|------------------|
| `QTANGL_API_KEY` | Railway env, local `.env` | 90 days |
| `QISKIT_IBM_TOKEN` | Local only (trace capture) | 30 days |
| `RAILWAY_TOKEN` | Developer machine / CI (if used) | 90 days |
| Vercel project env | Vercel dashboard | 90 days |
| Cursor / GitHub personal tokens | Local `.env` (dev tooling only) | On exposure or 90 days |

Never commit secrets. Use [backend/.env.example](../../backend/.env.example) as the template.

---

## Local development

1. Copy `backend/.env.example` to repo-root `.env` (gitignored).
2. Set `QTANGL_API_KEY=qtangl-demo-key` for local demos unless testing auth.
3. Keep `QTANGL_ENABLE_QAOA=false` unless running QAOA research locally.
4. Do **not** put IBM tokens or production API keys in tracked files.

Verify ignore rules:

```bash
git check-ignore -v .env
# Expected: .gitignore line matching .env
```

---

## Railway (backend staging / production)

1. Railway project → **Variables** (not `railway.toml`).
2. Required:
   - `QTANGL_API_KEY` — strong random value (e.g. `openssl rand -hex 32`)
   - `QTANGL_ENABLE_QAOA=false` (production default)
3. Optional (see [backend/README.md](../../backend/README.md)):
   - `QTANGL_RATE_LIMIT_PER_MINUTE`
   - `QTANGL_CORS_ORIGINS`
   - PQC live-scan vars only when intentionally enabled
4. Redeploy after variable changes.

CLI (optional):

```powershell
$env:RAILWAY_TOKEN = "<token-from-railway-dashboard>"
railway variables set QTANGL_API_KEY="<new-key>"
```

---

## Vercel (web)

1. Vercel project → **Settings** → **Environment Variables**.
2. Typical vars:
   - `NEXT_PUBLIC_API_URL` — backend base URL
   - Any server-side keys (if added later) — **Production / Preview / Development** scopes as appropriate
3. Never prefix server-only secrets with `NEXT_PUBLIC_`.
4. Redeploy or trigger rebuild after rotation.

---

## Secret rotation procedure (90-day API keys)

**Trigger:** Calendar reminder every 90 days, or immediately on suspected exposure.

### QTANGL_API_KEY (Railway)

1. Generate new key: `openssl rand -hex 32` (or platform secret generator).
2. Set `QTANGL_API_KEY` in Railway → redeploy backend.
3. Update Vercel / internal clients / pilot `.env` files with new key.
4. Smoke test: `curl -H "Authorization: Bearer <new-key>" https://<api-host>/health`
5. Revoke old key (overwrite env var; old value no longer valid after redeploy).
6. Log rotation date in team notes (no secret values in git).

### QISKIT_IBM_TOKEN (offline trace capture only)

1. IBM Quantum dashboard → regenerate token.
2. Update local `.env` only.
3. Never set on Railway production (demo uses fixture replay).

### Personal dev tokens (Cursor, GitHub PAT in root `.env`)

If tokens were ever pasted into chat, shared, or committed:

1. **Revoke immediately** at the provider:
   - Cursor: account settings → API keys
   - GitHub: Settings → Developer settings → Personal access tokens
2. Issue new tokens; store only in local `.env`.
3. Run gitleaks (see below) to confirm git history is clean.

**G1-001 checklist (manual — owner must confirm):**

- [ ] Cursor API key rotated if previously shared
- [ ] GitHub PAT rotated if previously shared
- [ ] Railway / Vercel production keys reviewed (not in git)

---

## Scanning for leaked secrets

### CI (every PR)

Gitleaks runs via [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) on full history (`fetch-depth: 0`).

### Local full-history scan

Install [gitleaks](https://github.com/gitleaks/gitleaks) then:

```bash
gitleaks detect --source . --verbose
```

Expected: **no leaks found**. If a leak is reported:

1. Rotate the exposed credential immediately.
2. Remove secret from history only if necessary (prefer rotation over history rewrite).
3. Re-run scan until clean.

---

## Incident response (secret in git)

1. Rotate the credential **before** any public discussion.
2. If pushed to GitHub: assume compromised; rotate all related keys.
3. File item in [risk-register.md](../backlog/risk-register.md) if customer-facing.
4. Do not amend commits that are already on `main` without team agreement.

---

## Related

- [11-track-G-security-trust-compliance.md](../11-track-G-security-trust-compliance.md)
- [threat-model.md](./threat-model.md) — TH-006 secrets in git
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — PR checklist
