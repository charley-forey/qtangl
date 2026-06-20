# Monitor pilot template

Standard delivery for continuous endpoint scanning (Monitor tier).

## Provision

```bash
python backend/scripts/provision_tenant.py \
  --name "Acme Pilot" \
  --tenant-id acme-pilot \
  --tier monitor \
  --domains api.acme.com,auth.acme.com
```

## Customer onboarding (week 1)

| Day | Action |
|-----|--------|
| 0 | Send dashboard login; customer authorizes domains |
| 1 | Baseline scan (fixture or live) |
| 2 | Create weekly schedule per authorized endpoint |
| 3 | Enable weekly digest + webhook (optional) |
| 7 | Review drift summary + recommendations |

## Ops verification

- Monitor tab shows **last run** per schedule
- `/health/ready` → `schedulerStale: false`
- PostHog: `schedule_created` event after upgrade

## Deliverables

- Signed PDF + CBOM from baseline
- Proof pack metadata (`generate_tenant_proof_pack.py`)
- Executive digest after week 1

## Upgrade path

Free/Assess → Monitor checkout → schedule enabled (`maxSchedules: 10`).
