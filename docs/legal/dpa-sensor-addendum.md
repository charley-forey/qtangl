# DPA addendum — Qtangl Unified Sensor

## Data categories collected

- Certificate metadata (algorithm, expiry, fingerprint, store path)
- Crypto library names and versions
- TLS listener ports
- Hostname and OS version

## Not collected

- Private key bytes or decrypted key material
- File contents beyond cryptographic metadata
- User credentials or PII from non-crypto files

## Retention

Configurable per tenant via `discoveryRetentionDays` (default 90 days).

## Customer attestation

Customer confirms deployment is authorized for the enrolled fleet and complies with internal security policies.
