# MSSP portfolio demo path

Prove continuous monitoring and readiness at scale for parent tenants.

## Setup

1. Provision parent (MSSP) tenant: `python backend/scripts/provision_tenant.py --tier enterprise --name "Demo MSSP"`
2. Provision child tenants (e.g. `dogfood`, pilot customer)
3. Link children: `PUT /admin/tenants/{child}/mssp-parent` with `parentTenantId`

## Demo script (15 min)

1. Parent **Portfolio** tab — aggregate readiness, below-threshold count, open alerts
2. **Customer tenants** table — readiness, schedules column, last scan age
3. **Open workspace** on child — show Monitor schedules + last run status
4. **Command center** heatmap (Overview) when business units configured
5. Optional: `POST /tenant/ai/explain-portfolio` for executive brief

## Pass criteria

- Parent sees ≥2 children with readiness scores
- At least one child shows **active schedules**
- Child switcher lands in correct tenant dashboard

See [`trust-visibility-persona-playbooks.md`](../guides/trust-visibility-persona-playbooks.md) (Platform engineer path).
