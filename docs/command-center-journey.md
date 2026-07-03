# Command Center journey display matrix

Per-stage UI expectations for QA (Assess → Monitor → Convert).

| Stage | Tier / billing | Overview | Scans | Monitor | Remediate | Settings |
|-------|----------------|----------|-------|---------|-----------|----------|
| Assess trial | `free`, trial remaining | Hero KPIs, onboarding wizard, first-run checklist | Baseline runner, 1 trial scan | Locked preview + upgrade CTA | Backlog from scan, verify pills | API keys, legal |
| Paid Assess | `assessPaidAt` set | Full KPIs + trend | Monthly quota scans | Schedule upsell if `maxSchedules=0` | Full backlog | Billing, team |
| Monitor | `monitor`+ | Drift + action queue | History + cadence insight | Schedules, drift chart, alerts | Velocity chart | Integrations, audit |
| Convert / Enterprise | `convert` / `enterprise` | Executive digest, compliance | Full export | Fleet + CBOM | Program board, what-if | SSO, audit export |

Provisioning paths: `POST /public/assess-signup`, Stripe assess checkout, `POST /public/monitor-signup`, monitor upgrade webhook, WorkOS self-serve (`provision_dashboard_workspace`).

Method honesty: inventory aid only; verification confirms report signing integrity.
