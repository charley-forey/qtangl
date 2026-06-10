# Trust program tracker

Review weekly (founder ritual). Update **Last verified** when evidence is checked.

| Phase | Item | Owner | Status | Last verified | Evidence |
|-------|------|-------|--------|---------------|----------|
| HS | Dependabot + security-audit CI | Eng | done | 2026-06-10 | `.github/dependabot.yml`, `ci.yml` |
| HS | SECURITY.md + trust copy gate | Eng | done | 2026-06-10 | `.github/SECURITY.md`, `scripts/trust-copy-check.mjs` |
| HS | Policy v0.1 drafts | Founder | done | 2026-06-10 | `docs/compliance/employee-security-policy.md` |
| HS | Vanta/Drata connect | Founder | pending | | Manual — connect GitHub in vendor UI |
| 0 | trust.ts + charley@ contacts | Eng | in-progress | | `web/lib/copy/trust.ts` |
| 0 | MFA on all admin systems | Founder | pending | | Access matrix |
| 1 | Live dogfood CI | Eng | pending | | `pqc-dogfood.yml` |
| 1 | `/pqc/dogfood/latest` | Eng | pending | | API + tests |
| 2 | `/trust/disclosure` | Eng | pending | | |
| 2 | Security overview PDF | Founder | pending | | |
| 5A | Railway Enterprise + SOC 2 II report | Founder | blocked | | Requires ~$1K/mo funding |
| 5B | CPA SOC 2 Type I observation | Founder | pending | | ~$15–40K |

**Metrics**

| Metric | Target | Current |
|--------|--------|---------|
| Dogfood pass rate | 100% | — |
| Disclosure ack SLA | ≤ 2 business days | — |
| Trust subprocessors updated | ≤ 30 days | 2026-06-10 |
