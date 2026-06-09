# Discovery depth — G3/G5 ship gate checklist (docs-full-yes-gate)

**Status:** Not yet met — matrix remains `partial` until all items below are verified.

## G3 — Host endpoint discovery = Yes

- [ ] 500+ agent pilot with <5% stale fleet
- [ ] mTLS client cert issuance on enroll
- [ ] cosign-signed sensor releases + transparency log
- [ ] MSI + Intune artifacts in release channel
- [ ] CrowdStrike Fusion workflow validated in customer EDR

## G4 — Source code / binary = Yes

- [ ] CryptoScan + CryptoDeps + theia bundled in CI (not optional on PATH)
- [ ] GitHub App install UI + OAuth
- [ ] ECR/ACR/GCR credential pull for scheduled image scans
- [ ] SARIF upload in qtangl-scan action

## G5 — Enterprise evidence

- [ ] Pen test executed with zero open Critical findings
- [ ] 10k agent soak p99 ingest < 2s
- [ ] SOC 2 auditor attestation for sensor controls

## GTM refresh when gates pass

Update `competitors.ts` host/code to `yes`, regenerate comparison PDF, refresh battlecards and canvas, publish blog "full-stack CPM" narrative.
