# Release acceptance checklist

Run after every production API/web deploy and before marketing trust claims.

## Automated (CI / scripts)

| Check | Command |
|-------|---------|
| Trust copy gate | `node scripts/trust-copy-check.mjs` |
| Backend tests | `cd backend && python -m pytest tests/test_dogfood_latest.py tests/test_recommendations.py -q` |
| Typecheck | `cd web && npx tsc --noEmit` |
| Trust golden path E2E | `cd web && npx playwright test tests/e2e/trust-golden-path.spec.ts` |
| Production rollout | `QTANGL_API_BASE=https://api.qtangl.com python backend/scripts/verify_production_rollout.py --full` |

## Manual smoke (5 min)

| Check | Pass |
|-------|------|
| `GET /health/ready` → `status: ready` | |
| `GET /pqc/dogfood/summary` → `allFresh: true` | |
| `/trust` widget loads | |
| `/status` overall state | |

## Weekly (founder ritual)

See acceptance scorecard in [`trust-program-tracker.md`](../compliance/trust-program-tracker.md).
