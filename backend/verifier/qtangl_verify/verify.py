"""Standalone Qtangl report verification (no app.pqc dependency)."""

from __future__ import annotations

import base64
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from qtangl_verify.content_hash import content_hash_for_payload
from qtangl_verify.ed25519 import verify_ed25519
from qtangl_verify.merkle import verify_merkle_path

VERIFY_SPEC_VERSION = "1.1.0"

# Some published algorithm labels differ from the liboqs runtime mechanism name.
# liboqs >= 0.15 exposes SLH-DSA (FIPS 205) under the slhdsa-c identifier.
_OQS_MECHANISM = {"SLH-DSA-SHA2-128s": "SLH_DSA_PURE_SHA2_128S"}


def _verify_mldsa(*, content_hash: str, signature_block: dict[str, Any]) -> dict[str, Any]:
    alg = signature_block.get("alg") or "ML-DSA-65"
    try:
        import oqs  # type: ignore[import-untyped]
    except ImportError:
        return {"valid": False, "reason": "liboqs-python not installed", "alg": alg, "contentHash": content_hash}

    public_b64 = signature_block.get("publicKeyB64") or ""
    signature_b64 = signature_block.get("signatureB64") or ""
    if not public_b64 or not signature_b64:
        return {"valid": False, "reason": "Missing PQC key material", "alg": alg, "contentHash": content_hash}

    try:
        public_key = base64.b64decode(public_b64)
        signature = base64.b64decode(signature_b64)
        with oqs.Signature(_OQS_MECHANISM.get(alg, alg)) as verifier:
            valid = verifier.verify(content_hash.encode("utf-8"), signature, public_key)
        return {"valid": bool(valid), "alg": alg, "contentHash": content_hash}
    except Exception as exc:
        return {"valid": False, "reason": str(exc), "alg": alg, "contentHash": content_hash}


def _verify_single(content_hash: str, block: dict[str, Any]) -> dict[str, Any]:
    alg = str(block.get("alg") or "")
    if alg == "Ed25519":
        return verify_ed25519(
            content_hash=content_hash,
            signature_b64=str(block.get("signatureB64") or ""),
            public_key_b64=str(block.get("publicKeyB64") or ""),
        )
    if alg in {"ML-DSA-65", "SLH-DSA-SHA2-128s"}:
        return _verify_mldsa(content_hash=content_hash, signature_block=block)
    return {"valid": False, "reason": f"Unsupported algorithm: {alg}", "alg": alg, "contentHash": content_hash}


def verify_report(
    report_json: dict[str, Any],
    signature: dict[str, Any],
    *,
    api_base: str | None = None,
    published_root: str | None = None,
) -> dict[str, Any]:
    content_hash = content_hash_for_payload(report_json)
    expected = signature.get("contentHash")
    if expected and content_hash != expected:
        return {"valid": False, "reason": "Content hash mismatch", "contentHash": content_hash}

    blocks = signature.get("signatures") or []
    if not blocks and signature.get("alg"):
        blocks = [signature]

    if not blocks:
        return {"valid": False, "reason": "No signature present", "contentHash": content_hash}

    per_signature = [_verify_single(content_hash, block) for block in blocks]
    valid = any(item.get("valid") for item in per_signature)
    result: dict[str, Any] = {
        "valid": valid,
        "verifySpecVersion": VERIFY_SPEC_VERSION,
        "contentHash": content_hash,
        "perSignature": per_signature,
    }
    if not valid:
        result["reason"] = next((item.get("reason") for item in per_signature if item.get("reason")), "Invalid")

    if api_base and content_hash:
        inclusion = _fetch_inclusion(api_base, content_hash)
        if inclusion:
            merkle_root = inclusion.get("merkleRoot")
            audit_path = inclusion.get("auditPath") or []
            leaf = inclusion.get("contentHash") or content_hash
            if merkle_root and audit_path:
                inclusion["merkleValid"] = verify_merkle_path(
                    leaf=str(leaf),
                    audit_path=audit_path,
                    root=str(merkle_root),
                )
            if published_root:
                root_hash = merkle_root or inclusion.get("rootHash")
                if root_hash and root_hash != published_root:
                    inclusion["rootMatch"] = False
                    result["valid"] = False
                    result["reason"] = "Log root mismatch vs published anchor"
                else:
                    inclusion["rootMatch"] = True
            result["logInclusion"] = inclusion

    return result


def _fetch_inclusion(api_base: str, content_hash: str) -> dict[str, Any] | None:
    try:
        req = Request(
            f"{api_base.rstrip('/')}/pqc/transparency/{content_hash}",
            headers={"Accept": "application/json"},
        )
        with urlopen(req, timeout=15) as resp:
            import json

            payload = json.loads(resp.read().decode("utf-8"))
            return payload.get("inclusion")
    except (HTTPError, URLError, TimeoutError, ValueError):
        return None
