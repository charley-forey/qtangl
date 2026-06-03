# Qtangl 20-Point Crypto Agility Checklist

Post-quantum readiness self-audit worksheet. Automate with Qtangl at https://qtangl.com/assess

## Inventory & visibility

1. Document all TLS endpoints exposed to the internet
2. Inventory code-signing and artifact signing keys
3. Map JWKS and OAuth/OIDC signing algorithms
4. Catalog HSM and KMS key types and sizes
5. Identify third-party SaaS with embedded legacy crypto

## Risk & deadlines

6. Apply Mosca inequality (X + Y > Z) to long-lived data
7. Classify HNDL exposure for archived ciphertext
8. Map findings to NSM-10 / CNSA 2.0 / NIST IR 8547 tiers
9. Set internal migration milestones before regulatory deadlines
10. Prioritize by data sensitivity, not alphabetically

## Migration & proof

11. Assign owners to every quantum-vulnerable finding
12. Define hybrid TLS rollout plan (ML-KEM + legacy fallback)
13. Require re-scan verification after each remediation sprint
14. Export CycloneDX CBOM for CMDB and GRC ingestion
15. Maintain signed evidence pack for each audit cycle

## Operations & monitoring

16. Schedule recurring crypto posture scans (not annual panic)
17. Alert on new quantum-vulnerable endpoints after deploy
18. Detect certificate and cipher suite regressions
19. Track readiness score trend for board reporting
20. Integrate drift alerts with Slack, email, or SIEM webhooks

---

Quantum-vulnerable does not mean broken today. This checklist is an inventory aid — not a formal audit.
