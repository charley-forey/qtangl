# Assess launch checklist and rollback

## Feature flag

- `NEXT_PUBLIC_ASSESS_WIZARD_V2` — default on; set `false` to disable wizard v2 layout
- Rollback: flip env in Vercel → redeploy (<5 min)

## Pre-launch baseline (capture 7-day avg)

- `/assess` page views, `assess_landing_view`, `pqc_scan_started`, `pqc_scan_completed`
- `/demo/pqc` redirect volume (should decay after R0)
- Mini-assessment conversion; access forms with `source=assess*`

## Launch day

- [ ] Production smoke: fixture scan → PDF → verify on https://www.qtangl.com/assess
- [ ] Autorun bank scenario on production
- [ ] `/demo/pqc` redirects correctly
- [ ] `/status` green
- [ ] Sales link sheet updated (`assess-sales-demo-script.md`)
- [x] `npm run check:no-demo-pqc-links` passes in CI
- [x] `assess.spec.ts` in CI merge gate
- [x] Daily `assess_web_smoke.py` on production

## Post-launch reviews

| When | Review |
|------|--------|
| Day 7 | Funnel vs baseline; scan completion rate |
| Day 30 | ≥1 critical finding + Monitor CTA clicks |
| Day 60 | Peer index cohort; assess → access conversion |
| Day 90 | Retire wizard flag if stable; redirect traffic near zero |
