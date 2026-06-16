# MSSP portfolio dashboard

## When it appears

The **Portfolio** tab is visible when your WorkOS user has memberships across multiple customer tenants, or when your tenant is configured as an MSSP parent with linked child tenants.

## API

- `GET /tenant/partner/portfolio-summary` — aggregate readiness, at-risk count, per-child rollup
- `GET /tenant/dashboard/tab/portfolio` — lazy-loaded portfolio bundle for the dashboard UI

## Operator workflow

1. Open **Portfolio** from the dashboard tabs.
2. Review aggregate readiness and **below threshold** KPI.
3. Use the business-unit heatmap to spot weak customers.
4. Click a customer row to switch active tenant (session cookie updated via BFF).
5. Export board evidence from the switched tenant using the evidence toolbar.

## Weekly digest (MSSP)

When `weeklyDigestEnabled` is on for a parent tenant, digest emails include a **Portfolio customers** table with per-child readiness scores.

## Demo script (pilot)

1. Sign in as MSSP admin with portfolio memberships.
2. Show Portfolio tab KPI strip (aggregate, below threshold, at risk).
3. Click a lagging customer → verify tenant switch without reload.
4. Run baseline scan in child context; return to parent Portfolio to see updated rollup.
