# Customer runbook — first production baseline (30 minutes)

For CISO / security admins after receiving a Qtangl onboarding link.

## Before you start

- Open the **dashboard onboarding link** from your welcome email (one-time, 24h TTL).
- Store the tenant API key in your password manager when prompted.
- Confirm your authorized domain(s) were pre-seeded by Qtangl admin (or upload-only for air-gapped).

## Path A — Dashboard-first (recommended)

1. Open `/dashboard?onboarding=TOKEN` from your email.
2. Scroll to **Run baseline assessment**.
3. **Upload** PEM/CSV/cloud export **or** select an **authorized domain**.
4. Choose your **industry** for peer comparison.
5. Click **Run production baseline**.
6. When complete, open **View in Dashboard** — scan appears in history.
7. Download **PDF** or **CBOM** from scan actions.

## Path B — Assess-first

1. Open `/assess?onboarding=TOKEN&mode=production` (secondary link in welcome email).
2. Complete the production wizard (upload-first or authorized domain).
3. On the Evidence tab, click **View in Dashboard**.

## API / CI (optional)

```bash
export QTANGL_API_KEY="qtangl_..."
export QTANGL_API_BASE="https://api.qtangl.com"

# Live scan (domain must be on tenant allowlist)
curl -sS -X POST "$QTANGL_API_BASE/pqc/scan" \
  -H "Authorization: Bearer $QTANGL_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: baseline-$(date +%s)" \
  -d '{"useFixture":false,"target":"api.yourbank.com","industry":"financial"}'

# List scans in dashboard
curl -sS "$QTANGL_API_BASE/tenant/scans" \
  -H "Authorization: Bearer $QTANGL_API_KEY"
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Dashboard empty after scan | Wrong key — ensure production key, not sandbox demo key |
| Domain rejected | Ask admin to add domain via authorized-domains API |
| Upload works, live fails | Expected for air-gapped — bundle path is first-class |
| 402 Payment Required | Monthly scan quota exceeded — contact sales or upgrade tier |

## Demo vs production

- **`/assess`** (no token) = public **demo** — fixture data, sandbox tenant.
- **Onboarding links** = **production** — your tenant, authorized domains only.

Never share fixture autorun links (`?autorun=1`) with production stakeholders.
