# Mini-Assessment Onboarding Drip

Five-email sequence for leads who complete `/assess/mini`. Backend stub: `backend/app/notifications/onboarding.py`.

| Day | Subject | CTA |
|-----|---------|-----|
| 0 | Your Q-Day readiness snapshot | Continue mini-assessment |
| 2 | Three assets to prioritize first | Re-run assess |
| 5 | How to verify a signed Qtangl report | /verify |
| 9 | Schedule monitoring before drift hits | /pricing (Monitor) |
| 14 | Book a 20-minute readiness review | /access |

## Email 1 — Your Q-Day readiness snapshot

**Subject:** Your Q-Day readiness snapshot

**Preview:** Finish your 10-minute inventory and see your readiness band.

**Body highlights:**
- Thank them for starting the mini-assessment
- Link: https://www.qtangl.com/assess/mini
- Set expectation: band + top 3 remediation themes

## Email 2 — Three assets to prioritize first

**Subject:** Three assets to prioritize first

**Preview:** TLS certs, signing keys, and VPN — where most teams start.

**Body highlights:**
- Public TLS certificates
- Code-signing and document signing keys
- VPN / remote access concentrators
- CTA: deepen scan or upload a cert bundle

## Email 3 — How to verify a signed Qtangl report

**Subject:** How to verify a signed Qtangl report

**Preview:** Independent verification — no dashboard login required.

**Body highlights:**
- Content hash + ML-DSA / Ed25519 signature
- Link: https://www.qtangl.com/verify
- Reference: docs/verify-spec.md

## Email 4 — Schedule monitoring before drift hits

**Subject:** Schedule monitoring before drift hits

**Preview:** Weekly re-scans and drift diffs catch regressions early.

**Body highlights:**
- Monitor tier: schedules, webhooks, scan diff
- Link: https://www.qtangl.com/pricing
- Honest scope: inventory aid, validate in your environment

## Email 5 — Book a 20-minute readiness review

**Subject:** Book a 20-minute readiness review

**Preview:** Walk through your snapshot with a Qtangl readiness engineer.

**Body highlights:**
- Personalized review of mini-assessment results
- Link: https://www.qtangl.com/access
- Optional: invite security architect or GRC lead

## Operational notes

- Trigger: mini-assessment email capture + step counter in CRM
- Unsubscribe: honor marketing opt-out; transactional scan emails separate
- A/B test subject lines after 500 sends per step
