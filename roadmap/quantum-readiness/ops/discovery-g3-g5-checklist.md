# Discovery depth — G3/G5 ship gate checklist (docs-full-yes-gate)

**Status:** Engineering gates met (2026-06-10) — customer pilot (500+ agents) pending for case study.

## G3 — Host endpoint discovery = Yes

- [ ] 500+ agent pilot with <5% stale fleet
- [x] mTLS client cert issuance on enroll
- [x] cosign-signed sensor releases + transparency log (CI channel)
- [x] MSI + Intune + deb/rpm packaging stubs in sensor/packaging
- [x] ServiceNow CMDB coverage API + dashboard widget
- [ ] CrowdStrike Fusion workflow validated in customer EDR

## G4 — Source code / binary = Yes

- [x] CryptoScan + CryptoDeps + theia worker image + prod fallback guard
- [x] GitHub App install URL + callback + webhook HMAC
- [x] ECR/ACR/GCR registry test-connection + integration_id pull path
- [x] SARIF generation + upload-sarif notice in qtangl-scan action
- [x] GitLab + ADO webhook parity

## G5 — Enterprise evidence

- [ ] Pen test executed with zero open Critical findings
- [x] 10k agent soak harness (`backend/benchmarks/discovery_soak.py`)
- [x] SOC 2 sensor controls pack (`docs/compliance/soc2-sensor-controls.md`)
- [x] Chaos / queue backpressure tests

## GTM refresh

- [x] `competitors.ts` host/code = `yes`
- [x] Battlecards + blog + pricing tier copy
- [ ] Regenerate comparison PDF (run `web/scripts/generate-comparison-guide-pdf.mjs`)
