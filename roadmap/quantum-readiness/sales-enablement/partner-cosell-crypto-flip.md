# Partner co-sell kit — CLM/KMS orchestration

## Elevator pitch

**Qtangl proves the flip; you own the CLM/KMS.**

We orchestrate PQC migration actions in the customer's existing Venafi, DigiCert, AWS KMS, or Git/K8s estate — and deliver signed before/after evidence auditors verify without our dashboard.

## When to bring Qtangl

- Customer has CLM/KMS but no program-of-record for PQC closure
- Auditor asks for proof that remediation actually improved crypto posture
- Partner delivers migration labor and needs verify links in one system

## Partner motions

| Partner type | Qtangl surface | Partner owns |
|--------------|----------------|--------------|
| CLM (Venafi/DigiCert) | Cert request orchestration | Policy, HSM, installation |
| Cloud MSP | KMS alias / overlay PR | IAM, deploy, rollback |
| MSSP | Child-tenant flip approve | Execution labor |

## Demo flow (15 min)

1. Show discovery finding → program item
2. Dry-run CLM flip (no side effects)
3. Approve staging flip → external ref in Venafi
4. Before/after drift + verify URL

## Collateral

- `partner-brief-venafi-flip.md`, `partner-brief-digicert-flip.md`, `partner-brief-aws-kms-flip.md`
- `/docs/guides/crypto-flip`
