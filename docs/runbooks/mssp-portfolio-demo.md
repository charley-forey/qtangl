# MSSP portfolio demo path

Prove continuous monitoring and readiness at scale for parent tenants.

## Quick start (recommended)

1. Seed a demo parent + 3 children:
   ```bash
   python backend/scripts/provision_mssp_demo.py
   ```
2. Sign in as the parent admin and open **Dashboard → Portfolio**.
3. If the portfolio is empty, use the **MSSP onboarding wizard** (4 steps):
   - Partner profile + co-brand (`reportBranding` / `portalBranding`)
   - Create customer workspace (`POST /tenant/partner/provision-child`)
   - Invite customer executive (WorkOS invite + branded welcome email)
   - Open customer workspace or return to portfolio

## Legacy manual setup

1. Provision parent (MSSP) tenant: `python backend/scripts/provision_tenant.py --tier enterprise --name "Demo MSSP"`
2. Provision child tenants (e.g. `dogfood`, pilot customer)
3. Link children: `PUT /admin/tenants/{child}/mssp-parent` with `parentTenantId`

## Demo script (15 min)

1. Parent **Portfolio** tab — aggregate readiness, below-threshold count, open alerts
2. **Customer tenants** table — readiness, schedules column, last scan age
3. **Open workspace** on child — delegated access lands in child Monitor tab
4. **Partner command center** at `/partner` — bulk digest, QBR export, deal registration
5. Optional: `POST /tenant/ai/explain-portfolio` for executive brief

## Pass criteria

- Parent sees ≥2 children with readiness scores
- At least one child shows **active schedules**
- Child switcher / Open workspace lands in correct tenant dashboard
- Portfolio board PDF downloads from `/tenant/partner/portfolio-board?format=pdf`

See [`trust-visibility-persona-playbooks.md`](../guides/trust-visibility-persona-playbooks.md) (Platform engineer path).
