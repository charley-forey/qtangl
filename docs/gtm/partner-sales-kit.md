# Partner sales kit

Materials for first MSSP revenue conversations and co-branded demos.

## 15-minute demo script

1. **Hook (2 min)** — Portfolio aggregate readiness across customer tenants; one pane for MSSP QBR prep.
2. **Sensor proof (3 min)** — Host fleet enrollment, push findings, remediate deep link from `HostFindingDetail`.
3. **Customer workspace (3 min)** — Provision child via wizard; invite `customer_executive`; show simplified dashboard (Overview + Scans only).
4. **White-label (4 min)** — Co-branded PDF board pack, portal theme, `/verify` co-brand header.
5. **Close (3 min)** — Partner tier path (Registered → Advanced → Premier custom domain).

Full runbook: [`mssp-portfolio-demo.md`](../runbooks/mssp-portfolio-demo.md).

## Objection handling

| Objection | Response |
|-----------|----------|
| "We already have consultants" | Qtangl is evidence infrastructure — consultants keep relationships; you deliver continuous readiness scores and audit-ready exports. |
| "Customers won't log in" | Executive digest + board PDF email; customer_viewer role is read-only with no partner APIs. |
| "We need our brand, not yours" | `reportBranding` + `portalBranding` on Advanced; Premier adds custom subdomain. |
| "How do we bill end customers?" | v1: parent Stripe customer + usage CSV export (`GET /tenant/partner/usage-export`); partner invoices offline. |

## Co-branded one-pager (talk track)

- **Prepared by {MSSP}** for each customer board export and weekly digest
- **Verify link** on every scan report — customer trust without Qtangl logo (Premier `hideQtanglBadge`)
- **Deal registration** at `/partner` — ops follow-up within 1 business day

## PostHog events (instrumented)

- `partner_provision_child` — wizard completes customer workspace step
- `partner_deal_registered` — deal reg form submitted
- `partner_bulk_digest` — bulk weekly digest enabled
- `dashboard_portfolio_click` — Open workspace on child tenant

## Pilot checklist

- [ ] Parent on enterprise/convert tier with `orgType: mssp`
- [ ] ≥2 child tenants with baselines
- [ ] Delegated access verified (`test_partner_delegation_security.py`)
- [ ] Customer invite received branded welcome email
- [ ] Portfolio board PDF exported for QBR
