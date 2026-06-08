# Convert tier — re-scan proof and MSSP kit

## Re-scan proof loop

1. Remediation item marked fixed → trigger verify scan (`POST /tenant/scans/{id}/remediation/verify`).
2. Signed report includes updated asset state; content hash changes.
3. Transparency log inclusion proves fix was attested at a point in time.

## Per-asset playbooks

- TLS hybrid KEX migration
- JWKS rotation for OIDC providers
- SSH host key upgrade
- Code signing certificate rotation

## MSSP co-sell

Passport handoff: share link + verify URL + evidence bundle export for partner delivery.
