# Legal review checklist — privacy & terms (pre–Stripe self-serve)

**Gate:** Complete before enabling public Monitor checkout (`/access`, Stripe webhook provisioning).  
**Related:** Track H5 (self-serve PQC), K12-004 in [09-epics-and-backlog.md](../../roadmap/quantum-readiness/09-epics-and-backlog.md)

Counsel must review and approve all customer-facing legal documents. Outlines in `docs/legal/` are **not** executable contracts.

---

## 1. Documents for counsel review

| Document | Outline path | Publish target | Reviewed |
|----------|--------------|----------------|----------|
| Terms of Service | [docs/legal/ToS-outline.md](../legal/ToS-outline.md) | `web/app/terms/page.tsx` or `/legal/terms` | [ ] |
| Privacy Policy | (draft from ToS §7 + DPA data categories) | `web/app/privacy/page.tsx` | [ ] |
| Data Processing Agreement | [docs/legal/DPA-outline.md](../legal/DPA-outline.md) | Enterprise + self-serve download | [ ] |
| Cookie / analytics notice | PostHog / GA if enabled | Privacy policy § cookies | [ ] |
| Sub-processor list | Live at `/trust/subprocessors` | Trust center | [ ] |

---

## 2. Stripe self-serve specific items

- [ ] Checkout flow discloses subscription terms, renewal, and cancellation path
- [ ] Welcome email uses **one-time onboarding link** — no plaintext API key in email body (see `provision_monitor_tenant` in `app/billing/service.py`)
- [ ] Refund and chargeback policy documented
- [ ] Tax / VAT handling confirmed for target markets
- [ ] Stripe Customer Portal terms linked from billing settings
- [ ] Webhook provisioning (`checkout.session.completed`) mapped to ToS acceptance timestamp

---

## 3. Privacy program

- [ ] Lawful basis for processing documented (contract / legitimate interest per tier)
- [ ] Data subject rights process (access, deletion, portability) — ties to tenant offboarding API
- [ ] Retention schedules aligned: scan artifacts, evidence vault, audit log, transparency log exemption
- [ ] International transfers: SCCs or UK IDTA if EU/UK customers
- [ ] Breach notification SLA (72h GDPR) in incident runbook
- [ ] `QTANGL_SMTP_*` and Resend subprocessors listed on trust center

---

## 4. Product copy alignment

- [ ] Marketing pages do not claim SOC 2 certification until report received
- [ ] Reports labeled advisory — not legal or compliance certification (per ToS §2)
- [ ] Acceptable use: authorized scan targets only (ToS §4)
- [ ] Monitor tier limits match published pricing page

---

## 5. Operational readiness

- [ ] Legal entity name and address on all published policies
- [ ] Contact email for privacy requests (`privacy@qtangl.com` or counsel-approved alias)
- [ ] Version history / effective date on each policy page
- [ ] RSS or changelog note when policies change materially

---

## 6. Sign-off before go-live

| Item | Counsel initial | Date | Founder sign-off |
|------|-----------------|------|------------------|
| ToS live | | | |
| Privacy Policy live | | | |
| DPA template ready | | | |
| Stripe products match tier names | | | |
| Trust center sub-processors current | | | |

---

## 7. Post-launch

- [ ] Annual policy review calendar
- [ ] Trigger review on new sub-processor or new data category (e.g. OIDC SSO attributes)
- [ ] Log counsel review in weekly KPI review ([weekly-kpi-review.md](../gtm/weekly-kpi-review.md))

---

*Checklist version: 2026-06-08*
