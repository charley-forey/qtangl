# Partner brief: Venafi + Qtangl crypto flip

## Positioning

**Qtangl proves the flip; Venafi owns certificate lifecycle.**

Qtangl orchestrates PQC/hybrid certificate requests through the customer's existing Venafi TPP / Firefly deployment. Qtangl does not replace Venafi — it adds discovery-to-proof closure for PQC migration programs.

## Co-sell motion

1. Qtangl Assess/Monitor finds TLS findings and prioritizes backlog
2. Convert program item → approved Venafi flip job
3. Qtangl calls Venafi certificate request API with PQC template
4. Customer PKI team approves in Venafi workflow (existing governance)
5. Qtangl verify re-scan + signed before/after proof for auditors

## What Venafi keeps

- Policy engine, approval workflows, HSM integration
- Certificate installation to application/device targets
- Enterprise PKI operations expertise

## What Qtangl adds

- PQC readiness scoring and program tracking
- Orchestrated request from remediation backlog
- Drift delta and signed evidence (ADR-006 moat)

## Objection: "Why not Venafi alone?"

Venafi excels at CLM operations. Qtangl aggregates multi-source discovery (external scan, code, KMS metadata), prioritizes by quantum risk, and produces auditor-verifiable proof that the flip improved posture — across CLM, overlay, and KMS surfaces.

## Technical requirements

- Venafi API credentials with certificate request + install scope (not admin)
- `writeBackEnabled` tenant integration flag
- PQC-capable certificate template in Venafi policy
