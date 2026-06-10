# SOC 2 — sensor controls evidence pack

## CC6.1 Logical access

- mTLS agent certificates with 90-day TTL and revocation on agent revoke
- bcrypt-hashed enrollment tokens with nonce rotation

## CC7.2 System monitoring

- Discovery SLO metrics: ingest latency, queue depth, heartbeat lag, DLQ rate
- PagerDuty alerts per `discovery-slos.md`

## CC8.1 Change management

- cosign-signed sensor releases (sensor-build workflow)
- Scanner version lock + golden CBOM contract tests in CI

## Evidence artifacts

- `discovery-provenance.json` in evidence vault bundles
- Pen test report (external) — required before customer pilot case study
