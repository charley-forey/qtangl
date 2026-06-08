# Qtangl Open Verify Specification

**Version:** `1.1.0`  
**Status:** Implemented (`backend/app/pqc/signing.py`, `transparency.py`, `merkle.py`, `anchoring.py`)  
**Canonical implementation:** [backend/scripts/qtangl_verify.py](../backend/scripts/qtangl_verify.py)

This document defines how third parties independently verify Qtangl signed reports and transparency log inclusion — without Qtangl credentials or trust in the Qtangl dashboard.

---

## Scope

| In scope | Out of scope |
|----------|--------------|
| Report content hashing | Full CBOM schema validation |
| ML-DSA-65 and Ed25519 signatures (dual `signatures[]`) | Formal audit attestation |
| Transparency log inclusion + Merkle audit path | Tenant-private scan data |
| Git + RFC 3161 external anchors | |

**Honesty note:** Verification confirms report integrity and Qtangl signing — not that the underlying scan is a complete estate inventory.

---

## Versioning

Spec versions follow semver. Implementations MUST include `verifySpecVersion` in API responses when available.

| Version | Date | Changes |
|---------|------|---------|
| `1.1.0` | 2026-06-08 | Dual signatures[], Merkle audit path, Git+TSA anchors, verifySpecVersion |
| `1.0.0` | 2026-06-06 | Initial: signature block, content hash, logInclusion schema |

Breaking changes increment major version. New optional fields increment minor version.

---

## Report content hash

1. Take the report JSON object **without** the `signature` field.
2. Serialize with **canonical JSON**: `sort_keys=true`, separators `(",", ":")`, UTF-8.
3. Compute `SHA-256` of the serialized bytes.
4. Encode as lowercase hex (64 characters).

```
contentHash = sha256(canonical_json(report_without_signature)).hex()
```

Reference: `content_hash_for_payload()` in [signing.py](../backend/app/pqc/signing.py).

---

## Signature block schema

The `signature` object is embedded in report JSON or returned alongside it.

```json
{
  "alg": "ML-DSA-65",
  "signatureB64": "<base64>",
  "publicKeyB64": "<base64>",
  "keyFingerprint": "<16-char hex>",
  "contentHash": "<64-char hex>",
  "signedAt": "<ISO-8601 UTC>"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alg` | string | Yes | `ML-DSA-65` (primary) or `Ed25519` (fallback) |
| `signatureB64` | string | Yes | Base64-encoded signature over `contentHash` UTF-8 bytes |
| `publicKeyB64` | string | Yes | Base64-encoded public key |
| `keyFingerprint` | string | Yes | First 16 hex chars of `sha256(publicKey)` |
| `contentHash` | string | Yes | SHA-256 of canonical report JSON (see above) |
| `signedAt` | string | Yes | ISO-8601 timestamp at signing time |

### Verification algorithm

1. Recompute `contentHash` from report body; MUST match `signature.contentHash`.
2. Decode `signatureB64` and `publicKeyB64`.
3. Verify signature over `contentHash` bytes:
   - **ML-DSA-65:** liboqs / `oqs-python` with algorithm `ML-DSA-65`
   - **Ed25519:** standard Ed25519 verify over `contentHash` UTF-8
4. Optionally cross-check `keyFingerprint` against `GET /pqc/transparency/keys`.

---

## Verification result schema

Returned by `GET /pqc/verify/{scanId}`, `POST /pqc/verify`, and `qtangl_verify.py`.

```json
{
  "valid": true,
  "alg": "ML-DSA-65",
  "keyFingerprint": "a1b2c3d4e5f67890",
  "contentHash": "abc123...",
  "signedAt": "2026-06-06T12:00:00+00:00",
  "logInclusion": {
    "included": true,
    "seq": 42,
    "entryHash": "def456...",
    "rootHash": "789abc...",
    "rootSeq": 100,
    "signedAt": "2026-06-06T12:00:00+00:00",
    "alg": "ML-DSA-65",
    "keyFingerprint": "a1b2c3d4e5f67890"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | `true` iff content hash matches and signature verifies |
| `reason` | string | Present when `valid` is `false` |
| `alg` | string | Algorithm used |
| `keyFingerprint` | string | Signing key fingerprint |
| `contentHash` | string | Recomputed hash |
| `signedAt` | string | From signature block |
| `logInclusion` | object | Optional; present when transparency log enabled and hash found |

---

## logInclusion schema

Compact inclusion receipt embedded in verification responses.

```json
{
  "included": true,
  "seq": 42,
  "entryHash": "<64-char hex>",
  "rootHash": "<64-char hex>",
  "rootSeq": 100,
  "signedAt": "<ISO-8601>",
  "alg": "ML-DSA-65",
  "keyFingerprint": "<16-char hex>"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `included` | boolean | Yes | `true` if `contentHash` is in the transparency log |
| `seq` | integer | When included | Monotonic log sequence number (1-based) |
| `entryHash` | string | When included | SHA-256 chain entry hash for this record |
| `rootHash` | string | When included | Current log root (`entryHash` of latest entry) |
| `rootSeq` | integer | When included | Sequence of the current root |
| `signedAt` | string | Optional | Copied from signature block at append time |
| `alg` | string | Optional | Signing algorithm at append time |
| `keyFingerprint` | string | Optional | Key fingerprint at append time |

### Transparency log entry hash (for independent auditors)

```
entryHash = sha256(f"{prevEntryHash}:{contentHash}:{seq}").hex()
```

Genesis `prevEntryHash` = 64 zeros. Reference: [transparency.py](../backend/app/pqc/transparency.py).

---

## Public API endpoints

| Method | Path | Returns |
|--------|------|---------|
| `GET` | `/pqc/verify/{scanId}` | Full verification + optional `logInclusion` |
| `POST` | `/pqc/verify` | Body: `{ "reportJson": { ... } }` — paste verify |
| `GET` | `/pqc/transparency/root` | `{ log: { seq, rootHash, entryCount, anchor? } }` |
| `GET` | `/pqc/transparency/keys` | `{ keys: [ { alg, publicKeyB64, keyFingerprint, status, ... } ] }` |
| `GET` | `/pqc/transparency/{contentHash}` | `{ inclusion: { seq, contentHash, entryHash, rootHash, ... } }` |

No authentication required. Rate limits may apply.

---

## Offline verification (CLI)

```bash
cd backend
python scripts/qtangl_verify.py path/to/report.json \
  --api-base https://api.qtangl.com \
  --published-root <optional-expected-root-hash> \
  --json
```

Exit code `0` = valid signature; `1` = invalid; `2` = file error.

When `--api-base` is set, the CLI fetches `GET /pqc/transparency/{contentHash}` and attaches `logInclusion`. When `--published-root` is set, mismatched `rootHash` fails verification.

---

## Readiness Passport (evidence bundle)

A Readiness Passport is a shareable package containing:

1. Signed report JSON (with `signature` block)
2. Exported PDF and/or CBOM (optional attachments)
3. Verify URL: `https://www.qtangl.com/verify?scanId=…`
4. Log inclusion receipt (from verify response or transparency API)

Auditors SHOULD verify via offline CLI or paste-verify — not by viewing the Qtangl dashboard.

---

## Security considerations

- Verify the signing key against `/pqc/transparency/keys` — reject unknown or `retired` keys for new reports.
- Compare `rootHash` to published anchor files when available (`QTANGL_TRANSPARENCY_ANCHOR_DIR`).
- Log inclusion proves the hash was recorded — not that scan findings are complete or accurate.
- Qtangl does not provide formal audit attestation; this spec covers cryptographic integrity only.

---

## Changelog

- **1.0.0** — Initial publication: signature block, verification result, logInclusion, public endpoints, CLI usage.

---

## Related

- Rollout: [evidence-layer-rollout.md](../roadmap/quantum-readiness/runbooks/evidence-layer-rollout.md)
- GTM packaging: [06-gtm-and-pricing.md](../roadmap/quantum-readiness/06-gtm-and-pricing.md)
- Implementation: [signing.py](../backend/app/pqc/signing.py), [transparency.py](../backend/app/pqc/transparency.py)
