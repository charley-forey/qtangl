# Next Development Priorities — Demo runbook (15 minutes)

Repeatable demo for design partners, inbound prospects, and weekly Friday gate validation.

Cross-links: [partner verify kit](../sales-enablement/partner-verify-kit.md) · [verify-spec](../../../docs/verify-spec.md) · [evidence-layer rollout](./evidence-layer-rollout.md)

---

## Prerequisites

| Item | Check |
|------|-------|
| Prod API healthy | `python backend/scripts/verify_production_rollout.py --full` |
| Transparency log enabled | `QTANGL_ENABLE_TRANSPARENCY_LOG=true` |
| Dashboard API key | Monitor-tier tenant with schedules + CBOM enabled |
| Sample CBOM | `backend/tests/fixtures/keyfactor-sample-cbom-16.json` |

---

## Step 1 — Monitor scan (3 min)

1. Open dashboard → run scan on `bank-tls-inventory` (fixture or live target).
2. Wait for completion → download **PDF report**.
3. **Proof point:** Signed report with readiness band and content hash.

---

## Step 2 — Independent verify (2 min)

1. Copy `scanId` from dashboard.
2. Open `https://www.qtangl.com/verify?scanId={scanId}` (no login).
3. **Proof point:** `verification.valid=true` + log inclusion (`seq`, `rootHash`).

Marketing golden scan (no live scan required): `/verify?scanId=golden-bank-tls-inventory`

---

## Step 3 — Multi-source CBOM (4 min)

1. Dashboard → **CBOM aggregation** → import Keyfactor sample JSON.
2. Show **Multi-source inventory** widget counts.
3. Optional: **Cloud integration** → Test + Pull AWS or Azure.
4. **Proof point:** Merged inventory from external source + cloud pull.

---

## Step 4 — Readiness Passport (3 min)

1. From scan row → **Passport** → scope `passport`, label "Q2 board review".
2. Open share URL `/r/{token}` in incognito.
3. Settings → **Active passports** → show list + revoke.
4. **Proof point:** Auditor view without API key; view audit trail.

---

## Step 5 — Trust center (2 min)

1. Open `https://www.qtangl.com/trust`.
2. Show live transparency root + signing key registry.
3. **Proof point:** Public evidence moat — competitors cannot fake retroactively.

---

## Conversion path (optional add-on)

| Step | URL / action |
|------|----------------|
| Mini-assessment | `/assess/mini` → email unlock → drip step 1 |
| Self-serve Monitor | `/access` → Stripe checkout |
| Smoke | `python backend/scripts/conversion_smoke.py` |

---

## Weekly gate log

After each demo dry-run, append one line:

```
YYYY-MM-DD | scanId=... | transparency seq=N | CBOM sources=M | notes
```

See [weekly-gate-runbook.md](./weekly-gate-runbook.md) for KPI snapshot template.
