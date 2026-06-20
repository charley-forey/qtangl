# Dogfood CI failure runbook

When `pqc-dogfood.yml` or `dogfood-freshness.yml` fails, or `/pqc/dogfood/latest` is stale.

## 1. Identify which target failed

Open the [PQC dogfood workflow](https://github.com/charley-forey/qtangl/actions/workflows/pqc-dogfood.yml) run logs. CI scans:

- `www.qtangl.com`
- `qtangl.com`
- `api.qtangl.com`

Note HTTP errors, scanner timeouts, or signature verification failures per target.

## 2. Verify production environment

On Railway **API + worker**:

| Variable | Expected |
|----------|----------|
| `QTANGL_DOGFOOD_TENANT_ID` | `dogfood` |
| `QTANGL_PQC_ENABLE_LIVE_SCAN` | `true` |
| `QTANGL_PQC_SCAN_ALLOWLIST` | includes all dogfood domains |
| `QTANGL_ENABLE_TRANSPARENCY_LOG` | `true` |
| `DATABASE_URL` | same on API and worker |

Confirm worker is running and Redis is available if schedules are used.

## 3. Manual re-scan

GitHub Actions → **PQC dogfood scan** → **Run workflow** → set `live: true`.

After completion:

```bash
curl -s https://api.qtangl.com/pqc/dogfood/summary | jq .
curl -s https://api.qtangl.com/pqc/dogfood/latest | jq .verification
```

Expect `verification.valid: true` and `freshness.allFresh: true`.

## 4. Signature invalid

- Check signing key rotation on API — no mismatch between sign and verify paths.
- Re-run scan after keys are stable; old bundles may not verify under a new key.

## 5. 404 on `/pqc/dogfood/latest`

- Dogfood tenant missing or no completed scans with persisted bundles.
- `QTANGL_DOGFOOD_TENANT_ID` mismatch vs CI tenant.
- GitHub secret `QTANGL_DOGFOOD_API_KEY` not issued for `dogfood` tenant.

Provision: `python backend/scripts/provision_dogfood.py`

## 6. Trust copy honesty

Only keep `dogfoodLiveEnabled = true` in `web/lib/copy/trust.ts` when production scans are fresh. If dogfood is down for >8 days, flip to interim copy until green again.

## 7. Escalation

- Internal ops: `/ops/dogfood` (requires `@qtangl.com` login)
- Freshness monitor opens `dogfood-stale` GitHub issue on schedule failure
- Optional Slack: `DOGFOOD_SLACK_WEBHOOK_URL` in `dogfood-freshness.yml`

## 8. Quarterly incident drill (30 min)

1. **Simulate stale** — block CI temporarily or point freshness check at stale fixture; confirm workflow fails.
2. **Run this runbook** steps 1–3 under time pressure.
3. **Verify alerts** — GitHub `dogfood-stale` issue; Slack if configured.
4. **Status page** — `/status` should show **degraded** when dogfood is stale (crypto self-assessment row).
5. **Recovery** — manual `workflow_dispatch` live scan; confirm trust copy stays honest until green.
6. **Record** — update weekly scorecard in [`trust-program-tracker.md`](../compliance/trust-program-tracker.md).

## 9. Signature rotation drill

- Rotate signing key in staging; confirm old bundles fail verify with clear error.
- Document rotation in runbook appendix before production key rotation.
