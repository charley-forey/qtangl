# Mobile CTA audit — `/assess/mini` and `/pricing`

Quick checklist for mobile website optimization (from product backlog).

---

## Pages

| Page | CTA | Check |
|------|-----|-------|
| `/` homepage | Primary → `/assess/mini` or `/platform` | Touch target ≥44px |
| `/assess/mini` | Email gate submit | Form fields full-width on ≤390px |
| `/assess/mini` | Verify sample link | Uses `scanId=` param |
| `/pricing` | Monitor → `/access` | Stripe/contact path visible above fold |
| `/trust` | Transparency live widget | No horizontal scroll |

---

## Fixes applied

- Mini-assessment verify CTA → `/verify?scanId=golden-bank-tls-inventory`
- Dashboard cloud pull + passport panels responsive (flex-wrap on buttons)

---

## Remaining (optional)

- Sticky mobile nav CTA on long `/platform` page
- Reduce hero padding on `max-width: 390px` in global CSS

---

## Verify

Manual: iPhone 14 / Pixel 7 viewports in DevTools  
Automated: `web/e2e/demo-cta.spec.ts` (homepage → demo path)
