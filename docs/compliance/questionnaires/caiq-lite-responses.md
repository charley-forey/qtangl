# CAIQ Lite — pre-answered controls (draft)

**Version:** 0.1 · **Last updated:** 2026-06-10  
Map to CSA CCM v4; refine during SOC 2 observation.

| Control | Response summary | Evidence |
|---------|------------------|----------|
| AIS-01 | Application security policy draft in employee-security-policy.md | docs/compliance/ |
| BCR-01 | Platform backup runbook + evidence-backup.yml | docs/ops/platform-backup-restore-runbook.md |
| CCC-01 | Change management via GitHub PR + CI gates | .github/workflows/ci.yml |
| CEK-01 | TLS in transit; secrets encrypted at rest | trust/security page |
| DSP-01 | Privacy policy + retention on /trust | web/app/privacy |
| GRM-01 | Risk/threat model in roadmap security docs | threat-model.md |
| IAM-01 | Hashed API keys; MFA on admin consoles | access-control-matrix.md |
| IVS-01 | SSRF tests in test_pqc_safety.py | CI security-audit job |
| LOG-01 | Log redaction policy draft | log-redaction-policy.md |
| SEF-01 | Disclosure policy at /trust/disclosure | security.txt |
| TVM-01 | Dependabot + blocking audits | dependabot.yml, ci.yml |
| UEM-01 | Endpoint policy for founder devices in employee policy | employee-security-policy.md |
| VPM-01 | Vendor assurance binder | vendor-assurance/README.md |

Full responses available under NDA on document request.
