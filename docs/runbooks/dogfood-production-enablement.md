# Dogfood production enablement checklist

Complete before claiming live self-scan on `/trust`. See also [`dogfood-ci-failure.md`](dogfood-ci-failure.md).

## Prerequisites

- Railway API + worker deployed with shared `DATABASE_URL`
- `QTANGL_ADMIN_SECRET` for provisioning
- GitHub repo admin (secrets + workflow dispatch)

## Steps

| # | Action | Verify |
|---|--------|--------|
| 1 | `python backend/scripts/provision_dogfood.py --admin-secret …` | Tenant `dogfood` exists, API key printed |
| 2 | Store key as GitHub secret `QTANGL_DOGFOOD_API_KEY` | Secret visible in repo settings |
| 3 | Railway env (API + worker): `QTANGL_DOGFOOD_TENANT_ID=dogfood`, `QTANGL_PQC_ENABLE_LIVE_SCAN=true`, allowlist, `QTANGL_ENABLE_TRANSPARENCY_LOG=true` | Redeploy complete |
| 4 | GitHub Actions → PQC dogfood scan → Run workflow (`live: true`) | Workflow green |
| 5 | `curl -s https://api.qtangl.com/pqc/dogfood/summary \| jq .freshness` | `allFresh: true` |
| 6 | Open `/trust` and `/trust/dogfood` | Scores + valid signature |
| 7 | Enable `dogfood-freshness.yml` daily; confirm 7 consecutive green runs | No open `dogfood-stale` issues |
| 8 | Optional: `--hq-tenant-id`, `DOGFOOD_SLACK_WEBHOOK_URL` | HQ portfolio + Slack on failure |

## Release gate

After any production deploy:

```bash
python backend/scripts/verify_production_rollout.py --full
curl -sf https://api.qtangl.com/pqc/dogfood/summary | jq -e '.freshness.allFresh == true'
```

See [`release-acceptance-checklist.md`](release-acceptance-checklist.md).
