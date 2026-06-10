# Discovery depth — customer pilot playbook (500+ agents)

## Preconditions

- G3/G4/G5 engineering gates checked in [discovery-g3-g5-checklist.md](../ops/discovery-g3-g5-checklist.md)
- Tenant on Enterprise tier with all discovery flags enabled
- MSA + DPA sensor addendum executed

## Week 1–2: Deploy

1. Create production fleet; distribute MSI/Helm/deb packages
2. Target 500+ agents across Linux + Windows (+ macOS if in scope)
3. Verify mTLS enroll success rate >95%

## Week 3–6: Steady state

| Metric | Target |
|--------|--------|
| Stale agents (7d no heartbeat) | <5% |
| Findings in merged CBOM | >0 per active host |
| CMDB coverage | >80% if ServiceNow wired |

## Week 7–8: Case study

- Named metrics (agents, findings, readiness delta)
- Publish blog + battlecard footnote removal
- Optional: bump `discoveryDepth` radar to 5

## Rollback

If pilot fails SLOs: revert public copy to partial; disable Ring 3 flags; publish errata.
