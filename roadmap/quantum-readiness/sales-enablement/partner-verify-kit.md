# Partner Verify Kit

Enablement pack for Qtangl ecosystem partners (VARs, GRC consultancies, PQC vendors) to demonstrate **independent report verification** without dashboard access.

## Audience

- Security architects evaluating Qtangl for a mutual customer
- Auditors validating signed evidence before regulatory submission
- Integration partners embedding Qtangl scans in broader migration programs

## Kit contents

| Asset | Location | Purpose |
|-------|----------|---------|
| Verify spec | [docs/verify-spec.md](../../docs/verify-spec.md) | Open algorithm for signature + transparency log checks |
| Live transparency | `GET /pqc/transparency/root`, `GET /pqc/transparency/keys` | Current log root and signing key history |
| Verify UI | https://www.qtangl.com/verify | Browser-based hash and signature check |
| Trust center | https://www.qtangl.com/trust | Data handling, retention, sub-processors |
| Sample passport | Create via dashboard or `POST /tenant/scans/{scanId}/share` with `scope: passport` | Expiring link for auditor handoff |
| CLI | `python scripts/qtangl_verify.py --report report.json` | Offline verification |

## Partner workflow (15 minutes)

1. **Run or receive a scan** — Customer exports JSON report or shares a Readiness Passport link (`/r/{token}`).
2. **Verify signature** — Use `/verify` or `qtangl_verify.py` against the report JSON content hash.
3. **Check transparency inclusion** — `GET /pqc/transparency/{contentHash}` returns inclusion proof against published root.
4. **Confirm key lineage** — Compare signing key fingerprint against `/pqc/transparency/keys` history.
5. **Document for customer** — Attach verify output + transparency root snapshot to audit worksheet.

## Auditor worksheet checklist

- [ ] Report `contentHash` matches signed payload
- [ ] Signature verifies (ML-DSA-65 or Ed25519 fallback documented in report)
- [ ] Inclusion proof validates against live transparency root
- [ ] Signing key fingerprint appears in public key registry
- [ ] Passport scope matches recipient need (report / bundle / passport)
- [ ] Share link expiry documented

## Co-marketing talking points

- **Honest scope:** Inventory aid, not formal attestation — partners add domain validation
- **Portable evidence:** Signed bundles work offline; no vendor lock-in for verification
- **Multi-source CBOM:** Merge Keyfactor, cloud ACM/Azure, and Qtangl scans in one aggregate

## Support escalation

- Technical verify questions: security@qtangl.com
- Partner program: https://www.qtangl.com/access (subject: Partner Verify Kit)

## Version

- Kit version: 1.0 (Phase 5 strategic plan)
- Last updated: 2026-06-06
