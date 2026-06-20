# Assess funnel dashboard runbook

PostHog (or equivalent) dashboard for the public Assess conversion funnel.

## Canonical events

See `web/lib/analytics/assess-events.ts` for names. Key funnel sequence:

1. `assess_landing_view` — path, mode, intent
2. `assess_intent_selected` — sample | live-demo | my-domain
3. `assess_quick_start` / `assess_my_domain_cta`
4. `assess_wizard_step` — step 1–3
5. `pqc_scan_started` → `pqc_scan_completed` | `pqc_scan_failed`
6. `pqc_report_downloaded` (dashboard / evidence tab)
7. `monitor_proposed` (upsell block)
8. `assess_signup_started` → `assess_signup_completed` (`/assess/start`)

Mini-assessment branch:

- `mini_assessment_view`
- `mini_assess_email_captured` (includes optional `domain`)
- `mini_to_assess_handoff`

Verify branch:

- `verify_viewed` on `/verify` mount

## Suggested PostHog insights

| Insight | Formula |
|---------|---------|
| Scan completion rate | `pqc_scan_completed` / `pqc_scan_started` (target >95%) |
| Intent mix | Breakdown of `assess_intent_selected` |
| Autorun success | `pqc_scan_completed` where `autorun=true` |
| Signup conversion | `assess_signup_completed` / `assess_signup_started` |
| Mini → Assess | `mini_to_assess_handoff` after `mini_assess_email_captured` |

## Filters

- `assessMode`: `demo` vs `production`
- `source`: autorun, assess_start, email_gate, mini-assessment-*

## Alerts

- Scan completion rate drops below 90% for 24h
- `pqc_scan_failed` spike with `kind=domain_not_allowed`
- `assess_signup_started` without matching `assess_signup_completed` >50% for 1h

## Related

- Enterprise gate: `demos/pqc_migration/assess-enterprise-gate.md`
- E2E smoke: `web/tests/e2e/assess.spec.ts`
- Production signup: `docs/runbooks/assess-production-onboarding.md`
