# Partner brief: DigiCert + Qtangl crypto flip

## Positioning

**Qtangl orchestrates MPKI orders; DigiCert issues and manages trust.**

Qtangl triggers DigiCert Trust Lifecycle Manager certificate orders with hybrid/PQC profiles from remediation program items. DigiCert remains the CA and trust anchor.

## Co-sell motion

1. Qtangl discovery surfaces expiring or quantum-vulnerable certs
2. Program item links to DigiCert inventory via CLM pull
3. Approved flip job calls DigiCert MPKI order API
4. DigiCert fulfills issuance per customer contract
5. Qtangl polls order status, triggers verify scan, attaches signed proof

## What DigiCert keeps

- CA operations, MPKI platform, trust services
- Certificate issuance and renewal billing
- Enterprise support and SLAs

## What Qtangl adds

- Cross-estate prioritization (not just cert inventory)
- Migration program workflow with owners and dates
- Before/after evidence for compliance reporting

## Objection: "DigiCert has PQC offerings"

Correct — DigiCert issues PQC-ready certs. Buyers still need a **program of record** that ties discovery findings → prioritized remediation → verified closure. Qtangl is that layer; DigiCert is the issuance engine.

## Technical requirements

- DigiCert MPKI API key with order + renew scope
- Hybrid/PQC profile ID configured in tenant integration
- External scan target for post-issuance verify
