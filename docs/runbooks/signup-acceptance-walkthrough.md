# Signup acceptance walkthrough

Manual verification of the customer golden path. Record results in the weekly scorecard ([`trust-program-tracker.md`](../compliance/trust-program-tracker.md)).

## Setup

- Use a **fresh email** never used on Qtangl prod
- Browser: incognito / clean profile
- Environment: production (`https://www.qtangl.com`)

## Path A — Dashboard self-serve

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/dashboard` → Sign in (WorkOS) | Lands on Overview |
| 2 | DevTools → `/api/dashboard/me` | `authenticated: true`, `tenantId`, `role: admin` |
| 3 | Onboarding wizard: company + authorized domain | Domain saved |
| 4 | Scans → fixture baseline (`bank-tls-inventory`) | Scan `done` |
| 5 | Overview | KPIs populated, checklist baseline checked |
| 6 | Action queue | Recommendations visible (baseline/schedule) |
| 7 | Monitor → create schedule | **Free tier:** upgrade CTA (not silent fail) |
| 8 | Export PDF/CBOM; `/verify?scanId=…` | `verification.valid: true` |

## Path B — Live trial (optional)

- Run **one** live scan on allowlisted domain
- Second live attempt → `assess_payment_required` + coaching banner

## Path C — `@qtangl.com` employee

- `DogfoodPostureCard` on Overview
- `/ops/dogfood` accessible (not redirected to login)

## Record template

```
Date:
Email:
Tenant ID:
Scan ID:
Sign-in: pass/fail
Fixture baseline: pass/fail
Recommendations (top 3):
Maturity stage:
Free schedule block: pass/fail
Verify valid: pass/fail
Dogfood allFresh: pass/fail
Notes:
```
