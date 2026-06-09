# MSSP co-sell verify kit

Partner handoff template for Convert tier engagements.

## Passport share URL

```
https://www.qtangl.com/verify?scanId={SCAN_ID}
```

## Verify CLI (customer-side)

```bash
pip install qtangl-verify
curl -s "$API/tenant/scans/$SCAN_ID/report?format=json" -H "Authorization: Bearer $KEY" -o report.json
qtangl-verify report.json --api-base https://api.qtangl.com --json
```

## Slide outline (5 slides)

1. **Problem** — harvest-now-decrypt-later; Mosca inequality
2. **Evidence** — signed report + transparency log inclusion
3. **Inventory** — CBOM multi-source + coverage confidence
4. **Remediation** — dynamic playbooks + re-scan proof (`verifyScanId`)
5. **Peer context** — Readiness Index band (opt-in cohort)

## Deliverables checklist

- [ ] Signed PDF + JSON bundle exported from dashboard Reports drawer
- [ ] Verify URL shared with customer security team
- [ ] Remediation board statuses synced to Jira/ServiceNow (optional)
- [ ] Re-scan scheduled to close the loop

Reference: [convert-tier-maturity.md](../runbooks/convert-tier-maturity.md)
