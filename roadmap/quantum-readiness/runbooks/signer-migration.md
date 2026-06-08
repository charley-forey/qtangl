# Signer algorithm migration

1. Add new algorithm to `QTANGL_SIGNING_ALGS` (e.g. `slh-dsa`).
2. Deploy with dual signing — old reports remain verifiable via key registry.
3. Retire prior keys via `POST /pqc/transparency/keys/retire` after overlap period.
4. Update verify spec minor version; document in trust page.

Verify policy: `QTANGL_VERIFY_POLICY=any` (default) or `all`.
