# Standards & GTM ritual

## Monthly standards currency

Review FIPS 203/204/205, CNSA 2.0 timelines; update `backend/app/pqc/standards.py`.

## External credibility

- [ ] PKI Consortium PQCCM listing submission
- [ ] NIST NCCoE Migration-to-PQC outreach
- [ ] Publish verify spec v1.1 + `qtangl-verify` package
- [ ] Annual Readiness Index report (`docs/readiness-index/`)

## Friday gate

Run `verify_production_rollout.py --full` and weekly gate runbook each release week.
