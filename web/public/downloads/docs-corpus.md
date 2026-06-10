# Qtangl Documentation Corpus

> Generated 2026-06-10 | API v0.9.0 | https://qtangl.com/docs

# Qtangl Agent Context

You are helping a user integrate with or evaluate **Qtangl** — a post-quantum readiness platform.

## Product north star

**Assess → Monitor → Convert** with signed evidence auditors can verify independently.

| Tier | Purpose |
|------|---------|
| **Assess** | Baseline cryptographic inventory, Mosca HNDL scoring, CycloneDX CBOM, signed PDF |
| **Monitor** | Scheduled re-scans, drift alerts, SIEM webhooks, remediation board |
| **Convert** | Remediation playbooks, automate fixes, re-scan verification |

## Method honesty (required)

- Qtangl is an **inventory aid, not a formal audit**.
- Quantum-vulnerable algorithms are **not broken today** — we quantify exposure and export signed evidence.
- Verification confirms **report integrity and signing** — not complete estate coverage.
- Do **not** claim certification, CMMC attestation, or Q-Day prediction on the user's behalf.

## API basics

- **Base URL:** `https://api.qtangl.com`
- **Auth:** Bearer API key (`Authorization: Bearer <key>`)
- **Idempotency:** Send `Idempotency-Key` on `POST /pqc/scan`
- **Public verify:** `GET /pqc/verify/{scan_id}` — no API key required

## Primary workflow

1. `POST /pqc/scan` — start inventory (use `useFixture: true` for demos)
2. `GET /pqc/scan/{scanId}` — poll until complete
3. `GET /pqc/report/{scanId}?format=cbom|pdf|json|bundle` — export evidence
4. `GET /pqc/verify/{scanId}` or `qtangl-verify` CLI — independent verification

## Key documentation URLs

- Docs hub: https://qtangl.com/docs
- Concepts: https://qtangl.com/docs/concepts
- Data formats: https://qtangl.com/docs/data-formats
- Verify spec: https://qtangl.com/docs/verify-spec
- OpenAPI: https://qtangl.com/openapi.json
- Machine index: https://qtangl.com/llms.txt
- Full corpus: https://qtangl.com/downloads/docs-corpus.md

## Standards mapping

Reference NSM-10, CNSA 2.0, and NIST IR 8547 when discussing migration — map to exported CBOM fields and readiness index, not generic quantum hype.

## Out of scope for readiness answers

Hybrid scheduling/routing (`POST /optimize`) is a **Labs expansion** — mention only when the user asks about optimization demos.

---

## Documentation index

### Getting Started
- [Overview](https://qtangl.com/docs)
- [Quickstart](https://qtangl.com/docs/quickstart)
- [Authentication & RBAC](https://qtangl.com/docs/authentication)
- [SDKs, CLI & OpenAPI](https://qtangl.com/docs/sdks)
- [API conventions](https://qtangl.com/docs/operations/conventions)

### Core Workflow
- [Assess workflow](https://qtangl.com/docs/guides/assess)
- [Monitor workflow](https://qtangl.com/docs/guides/monitor-workflow)
- [Convert workflow](https://qtangl.com/docs/guides/convert)
- [PQC scanner guide](https://qtangl.com/docs/guides/pqc-demo)
- [Monitor setup](https://qtangl.com/docs/guides/monitor-setup)
- [Dashboard SSO](https://qtangl.com/docs/guides/sso-setup)
- [Concepts](https://qtangl.com/docs/concepts)
- [Data formats](https://qtangl.com/docs/data-formats)

### Verify & Trust
- [Verify specification](https://qtangl.com/docs/verify-spec)
- [Verify concept](https://qtangl.com/docs/guides/verify)
- [Transparency log](https://qtangl.com/docs/guides/transparency)
- [CBOM aggregator](https://qtangl.com/docs/guides/cbom)
- [Readiness Index](https://qtangl.com/docs/guides/readiness-index)
- [Witness onboarding](https://qtangl.com/docs/guides/transparency-witness)

### PQC API reference
- [API guide](https://qtangl.com/docs/api)
- [GET /pqc/inventory](https://qtangl.com/docs/reference/pqc/inventory)
- [GET /pqc/scenarios](https://qtangl.com/docs/reference/pqc/scenarios)
- [GET /pqc/target](https://qtangl.com/docs/reference/pqc/target)
- [GET /pqc/handshake-trace](https://qtangl.com/docs/reference/pqc/handshake-trace)
- [GET /pqc/standards](https://qtangl.com/docs/reference/pqc/standards)
- [POST /pqc/upload-bundle](https://qtangl.com/docs/reference/pqc/upload-bundle)
- [POST /pqc/scan](https://qtangl.com/docs/reference/pqc/scan)
- [GET /pqc/scan/{scanId}](https://qtangl.com/docs/reference/pqc/scan-status)
- [POST /pqc/handshake/prove](https://qtangl.com/docs/reference/pqc/handshake-prove)
- [GET /pqc/report/{scanId}](https://qtangl.com/docs/reference/pqc/report)
- [POST /tenant/scans/{scanId}/share](https://qtangl.com/docs/reference/pqc/passport)
- [POST /pqc/cbom/ingest](https://qtangl.com/docs/reference/pqc/cbom-import)

### Tenant API reference
- [RBAC & scopes](https://qtangl.com/docs/reference/rbac)

### Discovery depth
- [Host sensor deploy](https://qtangl.com/docs/guides/host-sensor-deploy)
- [Code scan CI](https://qtangl.com/docs/guides/code-scan-ci)
- [POST /tenant/discovery/fleets](https://qtangl.com/docs/reference/discovery/fleets-create)
- [GET /tenant/discovery/agents](https://qtangl.com/docs/reference/discovery/agents)
- [POST /tenant/coverage/code-scan](https://qtangl.com/docs/reference/discovery/code-scan)
- [POST /tenant/discovery/binary-scan](https://qtangl.com/docs/reference/discovery/binary-scan)
- [GET /tenant/discovery/jobs/{job_id}](https://qtangl.com/docs/reference/discovery/jobs)

### Integrations
- [Integrations overview](https://qtangl.com/docs/integrations/overview)
- [Webhooks](https://qtangl.com/docs/integrations/webhooks)
- [SIEM webhook v2](https://qtangl.com/docs/integrations/siem-webhook-v2)
- [CI/CD integration](https://qtangl.com/docs/integrations/ci-cd)
- [Cloud KMS import](https://qtangl.com/docs/guides/cloud-import)
- [Portfolio & MSSP](https://qtangl.com/docs/guides/portfolio-mssp)

### Admin & billing
- [Admin & key lifecycle](https://qtangl.com/docs/guides/admin-keys)
- [Billing & onboarding](https://qtangl.com/docs/guides/billing-onboarding)

### Operations
- [Rate limits](https://qtangl.com/docs/operations/rate-limits)
- [Environments](https://qtangl.com/docs/operations/environments)
- [Observability](https://qtangl.com/docs/operations/observability)
- [Security](https://qtangl.com/docs/operations/security)
- [Data retention & lifecycle](https://qtangl.com/docs/operations/data-retention)
- [Tenancy & RLS](https://qtangl.com/docs/guides/data-model)
- [Evidence vault](https://qtangl.com/docs/guides/evidence-retention)
- [CORS](https://qtangl.com/docs/operations/cors)
- [Versioning policy](https://qtangl.com/docs/operations/versioning)

### Trust & compliance
- [Trust Center](https://qtangl.com/trust)
- [Compliance status](https://qtangl.com/docs/trust/compliance-status)
- [Compliance program](https://qtangl.com/docs/trust/compliance-program)
- [Data residency](https://qtangl.com/docs/trust/data-residency)
- [Incident response](https://qtangl.com/docs/trust/incident-response)
- [Legal artifacts](https://qtangl.com/docs/trust/legal)
- [Product SBOM](https://qtangl.com/docs/trust/product-sbom)
- [Sub-processors](https://qtangl.com/trust/subprocessors)

### Resources
- [Glossary](https://qtangl.com/docs/resources/glossary)
- [FAQ](https://qtangl.com/docs/resources/faq)
- [Changelog](https://qtangl.com/docs/resources/changelog)
- [Roadmap](https://qtangl.com/docs/resources/roadmap)
- [Support & SLA](https://qtangl.com/docs/resources/support)
- [Docs contribution](https://qtangl.com/docs/resources/contribution)
- [Errors & status codes](https://qtangl.com/docs/errors)
- [JSON schemas](https://qtangl.com/docs/reference/schemas)

### Labs / optimization (expansion)
- [POST /optimize](https://qtangl.com/docs/reference/optimize)
- [Routing guide](https://qtangl.com/docs/guides/routing)
- [Allocation guide](https://qtangl.com/docs/guides/allocation)
- [Schedule guide](https://qtangl.com/docs/guides/schedule)
- [Hospital demo guide](https://qtangl.com/docs/guides/hospital-demo)
- [Airline demo guide](https://qtangl.com/docs/guides/airline-demo)
- [EV fleet demo guide](https://qtangl.com/docs/guides/ev-fleet-demo)
- [GET /hospital/roster](https://qtangl.com/docs/reference/hospital/roster)
- [GET /hospital/scenarios](https://qtangl.com/docs/reference/hospital/scenarios)
- [GET /hospital/callout](https://qtangl.com/docs/reference/hospital/callout)
- [GET /hospital/qpu-trace](https://qtangl.com/docs/reference/hospital/qpu-trace)
- [POST /hospital/upload-roster](https://qtangl.com/docs/reference/hospital/upload-roster)
- [POST /hospital/callout/solve](https://qtangl.com/docs/reference/hospital/callout-solve)
- [GET /airline/network](https://qtangl.com/docs/reference/airline/network)
- [GET /airline/scenarios](https://qtangl.com/docs/reference/airline/scenarios)
- [GET /airline/disruption](https://qtangl.com/docs/reference/airline/disruption)
- [GET /airline/qpu-trace](https://qtangl.com/docs/reference/airline/qpu-trace)
- [POST /airline/upload-crew](https://qtangl.com/docs/reference/airline/upload-crew)
- [POST /airline/recover/solve](https://qtangl.com/docs/reference/airline/recover-solve)
- [GET /ev-fleet/depot](https://qtangl.com/docs/reference/ev-fleet/depot)
- [GET /ev-fleet/scenarios](https://qtangl.com/docs/reference/ev-fleet/scenarios)
- [GET /ev-fleet/window](https://qtangl.com/docs/reference/ev-fleet/window)
- [GET /ev-fleet/qpu-trace](https://qtangl.com/docs/reference/ev-fleet/qpu-trace)
- [POST /ev-fleet/upload-fleet](https://qtangl.com/docs/reference/ev-fleet/upload-fleet)
- [POST /ev-fleet/upload-stops](https://qtangl.com/docs/reference/ev-fleet/upload-stops)
- [POST /ev-fleet/plan/solve](https://qtangl.com/docs/reference/ev-fleet/plan-solve)


---

## API endpoint summary



---

## JSON schemas (canonical contracts)

### optimize-request.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://qtangl.com/contracts/optimize-request.schema.json",
  "title": "Qtangl Optimize Request",
  "type": "object",
  "required": ["type"],
  "properties": {
    "type": {
      "type": "string",
      "enum": ["schedule", "routing", "allocation"]
    },
    "data": {
      "type": "object",
      "additionalProperties": true
    },
    "constraints": {
      "type": "array",
      "items": { "type": "string" },
      "default": []
    },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "duration"],
        "properties": {
          "id": { "type": "string" },
          "duration": { "type": "integer", "minimum": 1 },
          "crew": { "type": "string" },
          "title": { "type": "string" }
        },
        "additionalProperties": true
      },
      "default": []
    },
    "stops": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id"],
        "properties": {
          "id": { "type": "string" },
          "serviceWindow": { "type": "string" }
        },
        "additionalProperties": true
      },
      "default": []
    },
    "vehicles": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id"],
        "properties": {
          "id": { "type": "string" },
          "capacity": { "type": "integer" }
        },
        "additionalProperties": true
      },
      "default": []
    },
    "shifts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id"],
        "properties": {
          "id": { "type": "string" },
          "requiredSkill": { "type": "string" }
        },
        "additionalProperties": true
      },
      "default": []
    },
    "staff": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "skills": {
            "type": "array",
            "items": { "type": "string" },
            "default": []
          },
          "maxHours": { "type": "integer" }
        },
        "additionalProperties": true
      },
      "default": []
    }
  },
  "additionalProperties": true
}
```

### optimize-response.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://qtangl.com/contracts/optimize-response.schema.json",
  "title": "Qtangl Optimize Response",
  "type": "object",
  "required": ["status", "summary", "solution", "metrics", "method", "details"],
  "properties": {
    "status": {
      "type": "string",
      "const": "success"
    },
    "summary": {
      "type": "string"
    },
    "solution": {
      "oneOf": [
        {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "task": { "type": "string" },
              "startDay": { "type": "integer" },
              "endDay": { "type": "integer" },
              "resource": { "type": ["string", "null"] }
            },
            "additionalProperties": true
          }
        },
        {
          "type": "object",
          "additionalProperties": true
        }
      ]
    },
    "metrics": {
      "type": "object",
      "required": ["constraintViolations", "savingsEstimate"],
      "properties": {
        "constraintViolations": { "type": "integer" },
        "makespanDays": { "type": "integer" },
        "totalCost": { "type": ["integer", "number"] },
        "savingsEstimate": { "type": "string" }
      },
      "additionalProperties": true
    },
    "method": {
      "type": "string",
      "enum": ["classical", "hybrid"]
    },
    "details": {
      "type": "object",
      "required": ["solver", "backend"],
      "properties": {
        "solver": { "type": "string" },
        "backend": { "type": "string" },
        "diagnostics": {
          "type": "object",
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    },
    "visualization": {
      "type": ["object", "null"],
      "additionalProperties": true
    }
  },
  "additionalProperties": false
}
```

### pqc-cbom-ingest-request.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PqcCbomIngestRequest",
  "type": "object",
  "required": ["document"],
  "properties": {
    "document": { "type": "object" },
    "sourceLabel": { "type": "string" },
    "verificationStatus": {
      "type": "string",
      "enum": ["verified", "imported", "unverified-source"]
    }
  }
}
```

### pqc-cbom-ingest-response.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PqcCbomIngestResponse",
  "type": "object",
  "required": ["status", "ok"],
  "properties": {
    "status": { "type": "string", "enum": ["success"] },
    "ok": { "type": "boolean" },
    "idempotent": { "type": "boolean" },
    "ingestJobId": { "type": "string" },
    "sourceId": { "type": "string" },
    "componentCount": { "type": "integer" },
    "newComponents": { "type": "integer" },
    "dedupedCount": { "type": "integer" },
    "conflictCount": { "type": "integer" }
  }
}
```

### pqc-scan-request.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://qtangl.com/contracts/pqc-scan-request.schema.json",
  "title": "Qtangl PQC Scan Request",
  "type": "object",
  "properties": {
    "scenarioId": { "type": "string", "default": "bank-tls-inventory" },
    "useFixture": { "type": "boolean", "default": true },
    "target": { "type": ["string", "null"] },
    "seed": { "type": "integer", "default": 1234 },
    "bundleSessionId": { "type": ["string", "null"] },
    "depth": { "type": ["string", "null"], "default": "standard" }
  },
  "additionalProperties": false
}
```

### pqc-scan-response.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://qtangl.com/contracts/pqc-scan-response.schema.json",
  "title": "Qtangl PQC Scan Response",
  "type": "object",
  "required": ["status"],
  "properties": {
    "status": { "type": "string", "enum": ["success", "running", "error"] },
    "scanId": { "type": "string" },
    "scenario": { "type": "object" },
    "assets": { "type": "array" },
    "remediationBacklog": { "type": "array" },
    "scoreboard": { "type": "object" },
    "handshakeProof": { "type": "object" },
    "report": { "type": "object" },
    "mosca": { "type": "object" },
    "timeline": { "type": "array" },
    "details": { "type": "object" }
  },
  "additionalProperties": true
}
```

### pqc-verify-response.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PqcVerifyResponse",
  "type": "object",
  "required": ["status", "verification"],
  "properties": {
    "status": { "type": "string", "enum": ["success"] },
    "scanId": { "type": "string" },
    "verification": {
      "type": "object",
      "required": ["valid", "contentHash"],
      "properties": {
        "valid": { "type": "boolean" },
        "alg": { "type": "string" },
        "keyFingerprint": { "type": "string" },
        "contentHash": { "type": "string", "pattern": "^[a-f0-9]{64}$" },
        "signedAt": { "type": "string" },
        "reason": { "type": "string" },
        "logInclusion": {
          "type": "object",
          "properties": {
            "included": { "type": "boolean" },
            "seq": { "type": "integer" },
            "entryHash": { "type": "string" },
            "rootHash": { "type": "string" },
            "rootSeq": { "type": "integer" },
            "signedAt": { "type": "string" },
            "alg": { "type": "string" },
            "keyFingerprint": { "type": "string" }
          }
        }
      }
    },
    "readinessBand": { "type": "string" },
    "targetDomain": { "type": "string" }
  }
}
```


---

## Verify specification

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

---

## Bundled artifacts

| Artifact | URL |
|----------|-----|
| OpenAPI JSON | https://qtangl.com/openapi.json |
| Postman collection | https://qtangl.com/postman/qtangl-api.json |
| Agent bundle (zip) | https://qtangl.com/downloads/qtangl-agent-bundle.zip |
| Sample CBOM | https://qtangl.com/samples/sample-cbom-bank-tls-inventory.json |
| llms.txt index | https://qtangl.com/llms.txt |

Source: https://qtangl.com/downloads/docs-corpus.md
