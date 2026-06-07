# Weekly Friday Gate Runbook

Operational checklist for balanced GTM + product motion. Run every Friday before end of week.

---

## Automated checks

```bash
export QTANGL_API_BASE=https://your-api.up.railway.app
export QTANGL_API_KEY=your-tenant-key

python backend/scripts/verify_production_rollout.py --full
python backend/scripts/production_smoke.py
python backend/scripts/conversion_smoke.py
# Or combined:
python backend/scripts/verify_production_rollout.py --gtm
```

All must exit 0 (golden verify WARN is acceptable if scan not seeded).

---

## KPI snapshot (record in CRM or ops log)

| Metric | This week | Source |
|--------|-----------|--------|
| Transparency log `entryCount` | | `GET /pqc/transparency/root` |
| Verify page views | | Analytics |
| Mini-assessment unlocks | | `mini_assessment_unlock` events |
| Drip emails sent | | SMTP/Resend logs |
| Stripe checkout starts | | Stripe dashboard |
| Cloud pulls (manual + scheduled) | | Worker logs / API metrics |
| Active passport links | | Dashboard passports panel |

---

## Demo story (one new line)

Update [demo-15-min-readiness.md](./demo-15-min-readiness.md) weekly gate log with what you can show **this week** that you could not show last week.

---

## Doc sync

- [ ] Epic statuses in [09-epics-and-backlog.md](../09-epics-and-backlog.md) match reality
- [ ] Capability map in [03-solution-architecture.md](../03-solution-architecture.md) if new endpoints shipped

---

## Escalation

| Failure | Action |
|---------|--------|
| Rollout script FAIL | Pause feature work; fix prod migrations/env |
| Transparency inclusion missing | Confirm `QTANGL_ENABLE_TRANSPARENCY_LOG=true` on API + worker |
| Stripe webhook errors | Check `QTANGL_STRIPE_WEBHOOK_SECRET` + event types in Dashboard |
| Cloud pull auth failures | Integration disabled — notify tenant via dashboard status |
