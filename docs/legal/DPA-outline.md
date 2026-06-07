# Data Processing Agreement — Outline (Counsel Review Required)

> **Status:** Placeholder template. Do not use without legal review.

## 1. Scope & roles

- **Controller:** Customer
- **Processor:** Qtangl, Inc.
- **Subject matter:** Q-Day cryptographic inventory scans and signed reports

## 2. Personal data categories

- Contact emails for report delivery and alerts
- Optional SSO identity attributes (if enabled)
- Scan metadata (domains, certificate fingerprints — typically not PII)

## 3. Processing purposes

- Perform scans requested by Customer
- Generate and sign migration reports
- Retain evidence per Customer retention settings
- Send transactional notifications

## 4. Sub-processors

- Reference current list at `/trust/subprocessors`
- [30]-day notice for material changes
- Customer objection rights per GDPR Art. 28

## 5. Security measures

- Encryption in transit (TLS 1.2+)
- Tenant API keys hashed at rest
- Report content hashing and post-quantum/classical signatures
- Access controls and audit logging (admin role)

## 6. Data subject rights

- Customer responsible for DSAR routing
- Qtangl assists per reasonable commercial terms

## 7. Breach notification

- Notify Customer without undue delay upon confirmed breach affecting Customer data

## 8. Data location & transfers

- Primary region: [US / EU — per Order Form]
- Standard Contractual Clauses if applicable

## 9. Deletion & return

- On termination: delete or return Customer data within [30] days
- Evidence vault objects honor configured retention then purge

## 10. Audits

- Customer may request SOC 2 report or security questionnaire annually

---

*Attach to MSA as Exhibit B. Update sub-processor schedule before signature.*
