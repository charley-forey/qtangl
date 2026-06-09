# Standards & GTM ritual

## Monthly standards currency

Review FIPS 203/204/205, CNSA 2.0 timelines; update `backend/app/pqc/standards.py`.

```bash
python backend/scripts/standards_currency_check.py
```

## External credibility

- [ ] PKI Consortium PQCCM listing submission
- [ ] NIST NCCoE Migration-to-PQC outreach
- [x] Publish verify spec v1.1 + `qtangl-verify` package (`/docs/verify-spec`, PyPI workflow on `verify-v*` tag)
- [ ] Annual Readiness Index report (`docs/readiness-index/`)

## Friday gate

Run `verify_production_rollout.py --full` and weekly gate runbook each release week.
