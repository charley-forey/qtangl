# Trust program tracker

Review weekly (founder ritual). Update **Last verified** when evidence is checked.

## Weekly acceptance scorecard (Monday, ~5 min)

| Metric | Target | Current | Source |
|--------|--------|---------|--------|
| Dogfood freshness pass rate | 100% (7d) | | `dogfood-freshness.yml` |
| Trust → verify time | <60s | | Playwright / manual |
| Signup → first scan (TTFV) | <15 min median | | PostHog `dashboard_ttfv` |
| Trust view → assess signup | Baseline TBD | | `trust_dogfood_viewed` → assess |
| Monitor: schedule within 14d of upgrade | >80% | | `firstScheduleAt` milestone |
| Recommendation CTR | ≥15% | | click vs dismiss events |
| Maturity 1→3 within 30d (active pilots) | Track | | `/ops/funnel` |

**Ritual:** (1) dogfood CI green? (2) open `dogfood-stale` issues? (3) funnel snapshot `/ops/funnel`; (4) one persona walkthrough — rotate CISO / GRC / Platform ([`trust-visibility-persona-playbooks.md`](../guides/trust-visibility-persona-playbooks.md)).

---

| Phase | Item | Owner | Status | Last verified | Evidence |
|-------|------|-------|--------|---------------|----------|
| HS | Dependabot + security-audit CI | Eng | done | 2026-06-10 | `.github/dependabot.yml`, `ci.yml` |
| HS | SECURITY.md + trust copy gate | Eng | done | 2026-06-10 | `.github/SECURITY.md`, `scripts/trust-copy-check.mjs` |
| HS | Policy v0.1 drafts | Founder | done | 2026-06-10 | `docs/compliance/employee-security-policy.md` |
| HS | Vanta/Drata connect | Founder | pending | | Manual — connect GitHub in vendor UI |
| 0 | trust.ts + charley@ contacts | Eng | done | 2026-06-17 | `web/lib/copy/trust.ts` |
| 0 | MFA on all admin systems | Founder | pending | | Access matrix |
| 1 | Live dogfood CI | Eng | in-progress | 2026-06-17 | `pqc-dogfood.yml`, `provision_dogfood.py` |
| 1 | `/pqc/dogfood/latest` + summary/history | Eng | done | 2026-06-17 | API + `test_dogfood_latest.py` |
| 1 | Trust widget + `/trust/dogfood` | Eng | done | 2026-06-17 | `TrustDogfoodSelfScan`, `dogfoodLiveEnabled` |
| 1 | HQ mirror + ops pages | Eng | done | 2026-06-17 | `DogfoodPostureCard`, `/ops/dogfood` |
| 1 | Dogfood CI runbook + drill | Eng | done | 2026-06-17 | `docs/runbooks/dogfood-ci-failure.md` |
| 1 | Release acceptance checklist | Eng | done | 2026-06-17 | `docs/runbooks/release-acceptance-checklist.md` |
| 1 | Signup acceptance walkthrough | Eng | done | 2026-06-17 | `docs/runbooks/signup-acceptance-walkthrough.md` |
| 2 | `/trust/disclosure` | Eng | pending | | |
| 2 | Security overview PDF | Founder | pending | | |
| 5A | Railway Enterprise + SOC 2 II report | Founder | blocked | | Requires ~$1K/mo funding |
| 5B | CPA SOC 2 Type I observation | Founder | pending | | ~$15–40K |

**Metrics (legacy)**

| Metric | Target | Current |
|--------|--------|---------|
| Dogfood pass rate | 100% | — |
| Disclosure ack SLA | ≤ 2 business days | — |
| Trust subprocessors updated | ≤ 30 days | 2026-06-10 |
