# Key rotation runbook (Track G1)

1. Generate new signing key pair; register via normal sign flow (`register_signing_key`).
2. Call `POST /pqc/transparency/keys/retire` with admin API key and old `keyFingerprint`.
3. Update Railway secret `QTANGL_REPORT_SIGNING_KEY_B64` (and ML-DSA vars if used).
4. Publish retired + active fingerprints on `/trust` (TrustTransparencyLive).
5. Verify a new scan with `/verify` — old reports must still verify with retired key listed.

See [evidence-layer-rollout.md](../quantum-readiness/runbooks/evidence-layer-rollout.md).
