# Weekly Friday Gate Runbook

Operational checklist for balanced GTM + product motion. Run every Friday before end of week.

---

## Automated checks

```bash
export QTANGL_API_BASE=https://api.qtangl.com
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

## Post-Moat completion checklist

Run after Moat Deepening (`72163b9`) activation:

| Workstream | Check | Command / URL |
|------------|-------|---------------|
| WS0 | Cloud routes split (`/integrations/cloud/*` vs GRC) | `pytest tests/test_tenant_cloud_routes.py` |
| WS1 | Migrations through **009** on Railway API + worker | `alembic current` → `009_moat_phase7` |
| WS1 | Transparency log live + inclusion | `verify_production_rollout.py --full` exit 0 |
| WS2 | Dual signing in prod OR documented Ed25519 fallback | Report JSON `signatures[]` length ≥ 1 |
| WS3 | Git witness + TSA configured | Trust page Git link; `reconstruct_log_from_anchors.py` |
| WS4 | Stripe Monitor + SMTP | `conversion_smoke.py --gtm` exit 0 |
| WS5 | Peer panel + index page live | Dashboard peer band; `GET /pqc/index` |
| WS6 | K8s + CLM + Keyfactor pulls | `pytest tests/test_pull_integrations.py` |
| WS7 | PyPI verifier published | `pip install qtangl-verify` |
| WS8 | Dynamic playbooks + Report drawer | Dashboard Remediation + Reports |
| WS9 | DR scripts + OIDC JWKS | `backup_evidence_log.py`; `GET /tenant/audit/export` |
| WS10 | Drift intel UI | `GET /tenant/drift-intel`; CohortDriftPanel |
| WS12 | Terms + privacy live | `/terms`, `/privacy` |
| WS13 | Cosign workflow | `.github/workflows/supply-chain-sign.yml` on tag |
| WS14 | Runbooks synced | This checklist + [evidence-layer-rollout.md](./evidence-layer-rollout.md) |

```bash
python backend/scripts/conversion_smoke.py --gtm
python backend/scripts/verify_production_rollout.py --gtm
```

---

## Escalation

| Failure | Action |
|---------|--------|
| Rollout script FAIL | Pause feature work; fix prod migrations/env |
| Transparency inclusion missing | Confirm `QTANGL_ENABLE_TRANSPARENCY_LOG=true` on API + worker |
| Stripe webhook errors | Check `QTANGL_STRIPE_WEBHOOK_SECRET` + event types in Dashboard |
| Cloud pull auth failures | Integration disabled — notify tenant via dashboard status |
