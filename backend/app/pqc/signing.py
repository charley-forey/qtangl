from __future__ import annotations

import base64
import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Any

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
    from cryptography.hazmat.primitives.serialization import (
        Encoding,
        NoEncryption,
        PrivateFormat,
        PublicFormat,
    )
    from cryptography.exceptions import InvalidSignature

    _HAS_CRYPTO = True
except ImportError:  # pragma: no cover
    _HAS_CRYPTO = False

try:
    import oqs  # type: ignore[import-untyped]

    _HAS_OQS = True
except ImportError:  # pragma: no cover
    _HAS_OQS = False

_ML_DSA_ALG = "ML-DSA-65"
_ED25519_ALG = "Ed25519"
# Public / verify-spec label (FIPS 205). liboqs >= 0.15 exposes this parameter
# set under the slhdsa-c identifier below, so the mechanism name passed to oqs
# differs from the stored algorithm label.
_SLH_DSA_ALG = "SLH-DSA-SHA2-128s"
_SLH_DSA_MECH = "SLH_DSA_PURE_SHA2_128S"
_VERIFY_SPEC_VERSION = "1.1.0"


def verify_spec_version() -> str:
    return _VERIFY_SPEC_VERSION


def _canonical_json(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def content_hash_for_payload(payload: dict[str, Any]) -> str:
    """Public helper for verify CLI and transparency log."""
    return hashlib.sha256(_canonical_json(payload)).hexdigest()


def _content_hash(payload: dict[str, Any]) -> str:
    return content_hash_for_payload(payload)


def _configured_algs() -> list[str]:
    raw = os.getenv("QTANGL_SIGNING_ALGS", "ml-dsa-65,ed25519").lower()
    return [part.strip() for part in raw.split(",") if part.strip()]


def _verify_policy() -> str:
    return os.getenv("QTANGL_VERIFY_POLICY", "any").lower()


def _load_ed25519_key() -> tuple[Any, bytes]:
    if not _HAS_CRYPTO:
        raise RuntimeError("cryptography package required for report signing")
    from app.pqc.key_registry import load_stable_ed25519_private_bytes

    key_bytes = load_stable_ed25519_private_bytes()
    if key_bytes is None:
        private_key = Ed25519PrivateKey.generate()
        return private_key, private_key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())
    private_key = Ed25519PrivateKey.from_private_bytes(key_bytes)
    return private_key, key_bytes


def _sign_ed25519(content_hash: str, signed_at: str) -> dict[str, Any] | None:
    if not _HAS_CRYPTO:
        return None
    private_key, _ = _load_ed25519_key()
    public_key = private_key.public_key()
    public_bytes = public_key.public_bytes(Encoding.Raw, PublicFormat.Raw)
    signature = private_key.sign(content_hash.encode("utf-8"))
    return {
        "alg": _ED25519_ALG,
        "signatureB64": base64.b64encode(signature).decode("ascii"),
        "publicKeyB64": base64.b64encode(public_bytes).decode("ascii"),
        "keyFingerprint": hashlib.sha256(public_bytes).hexdigest()[:16],
        "contentHash": content_hash,
        "signedAt": signed_at,
    }


def _sign_mldsa(content_hash: str, signed_at: str) -> dict[str, Any] | None:
    if not _HAS_OQS:
        return None
    try:
        from app.pqc.key_registry import load_stable_mldsa_keypair

        with oqs.Signature(_ML_DSA_ALG) as signer:
            keypair = load_stable_mldsa_keypair()
            if keypair:
                secret, public_key = keypair
                signer.secret_key = secret
            else:
                public_key = signer.generate_keypair()
            signature = signer.sign(content_hash.encode("utf-8"))
            return {
                "alg": _ML_DSA_ALG,
                "signatureB64": base64.b64encode(signature).decode("ascii"),
                "publicKeyB64": base64.b64encode(public_key).decode("ascii"),
                "keyFingerprint": hashlib.sha256(public_key).hexdigest()[:16],
                "contentHash": content_hash,
                "signedAt": signed_at,
            }
    except Exception:
        return None


def _sign_slh_dsa(content_hash: str, signed_at: str) -> dict[str, Any] | None:
    if not _HAS_OQS:
        return None
    try:
        with oqs.Signature(_SLH_DSA_MECH) as signer:
            public_key = signer.generate_keypair()
            signature = signer.sign(content_hash.encode("utf-8"))
            return {
                "alg": _SLH_DSA_ALG,
                "signatureB64": base64.b64encode(signature).decode("ascii"),
                "publicKeyB64": base64.b64encode(public_key).decode("ascii"),
                "keyFingerprint": hashlib.sha256(public_key).hexdigest()[:16],
                "contentHash": content_hash,
                "signedAt": signed_at,
            }
    except Exception:
        return None


def _sign_kms_native(content_hash: str, signed_at: str) -> dict[str, Any] | None:
    try:
        from app.pqc.kms_signer import kms_native_sign

        return kms_native_sign(content_hash, signed_at=signed_at)
    except Exception:
        return None


def _register_block(block: dict[str, Any]) -> None:
    from app.pqc.key_registry import register_signing_key

    register_signing_key(
        alg=str(block.get("alg") or ""),
        public_key_b64=str(block.get("publicKeyB64") or ""),
        key_fingerprint=str(block.get("keyFingerprint") or ""),
    )


def sign_report_payload(report_payload: dict[str, Any]) -> dict[str, Any]:
    """Sign canonical report JSON. Dual ML-DSA + Ed25519 when available."""
    content_hash = _content_hash(report_payload)
    signed_at = datetime.now(timezone.utc).isoformat()
    algs = _configured_algs()
    signatures: list[dict[str, Any]] = []

    if "ml-dsa-65" in algs or "mldsa" in algs:
        block = _sign_mldsa(content_hash, signed_at)
        if block:
            signatures.append(block)
            _register_block(block)

    if "ed25519" in algs:
        block = _sign_ed25519(content_hash, signed_at)
        if block:
            signatures.append(block)
            _register_block(block)

    if "slh-dsa" in algs or "slh-dsa-sha2-128s" in algs:
        block = _sign_slh_dsa(content_hash, signed_at)
        if block:
            signatures.append(block)
            _register_block(block)

    kms_block = _sign_kms_native(content_hash, signed_at)
    if kms_block:
        signatures.append(kms_block)
        _register_block(kms_block)

    if not signatures:
        return {
            "alg": "none",
            "signatureB64": "",
            "publicKeyB64": "",
            "keyFingerprint": "",
            "contentHash": content_hash,
            "signedAt": signed_at,
            "signatures": [],
            "warning": "Signing unavailable — install cryptography or oqs-python",
        }

    primary = next((s for s in signatures if s.get("alg") == _ML_DSA_ALG), signatures[0])
    result = dict(primary)
    result["signatures"] = signatures
    result["verifySpecVersion"] = _VERIFY_SPEC_VERSION
    return result


def _verify_single(
    content_hash: str,
    signature_block: dict[str, Any],
) -> dict[str, Any]:
    alg = signature_block.get("alg", "")
    sig_b64 = signature_block.get("signatureB64", "")
    pub_b64 = signature_block.get("publicKeyB64", "")
    if not sig_b64 or alg == "none":
        return {"valid": False, "reason": "No signature present", "alg": alg, "contentHash": content_hash}

    expected = signature_block.get("contentHash", "")
    if content_hash != expected:
        return {"valid": False, "reason": "Content hash mismatch", "alg": alg, "contentHash": content_hash}

    signature = base64.b64decode(sig_b64)
    public_key = base64.b64decode(pub_b64)

    if alg == _ML_DSA_ALG and _HAS_OQS:
        try:
            with oqs.Signature(_ML_DSA_ALG) as verifier:
                verifier.import_public_key(public_key)
                valid = verifier.verify(content_hash.encode("utf-8"), signature)
                return {
                    "valid": bool(valid),
                    "alg": alg,
                    "keyFingerprint": signature_block.get("keyFingerprint", ""),
                    "contentHash": content_hash,
                    "signedAt": signature_block.get("signedAt", ""),
                }
        except Exception as exc:
            return {"valid": False, "reason": str(exc), "alg": alg, "contentHash": content_hash}

    if alg == _SLH_DSA_ALG and _HAS_OQS:
        try:
            with oqs.Signature(_SLH_DSA_MECH) as verifier:
                verifier.import_public_key(public_key)
                valid = verifier.verify(content_hash.encode("utf-8"), signature)
                return {
                    "valid": bool(valid),
                    "alg": alg,
                    "keyFingerprint": signature_block.get("keyFingerprint", ""),
                    "contentHash": content_hash,
                    "signedAt": signature_block.get("signedAt", ""),
                }
        except Exception as exc:
            return {"valid": False, "reason": str(exc), "alg": alg, "contentHash": content_hash}

    if alg == _ED25519_ALG and _HAS_CRYPTO:
        try:
            pub = Ed25519PublicKey.from_public_bytes(public_key)
            pub.verify(signature, content_hash.encode("utf-8"))
            return {
                "valid": True,
                "alg": alg,
                "keyFingerprint": signature_block.get("keyFingerprint", ""),
                "contentHash": content_hash,
                "signedAt": signature_block.get("signedAt", ""),
            }
        except InvalidSignature:
            return {"valid": False, "reason": "Invalid Ed25519 signature", "alg": alg, "contentHash": content_hash}

    if alg.startswith("ECDSA"):
        try:
            from app.pqc.kms_signer import verify_kms_native_signature

            return verify_kms_native_signature(content_hash, signature_block)
        except Exception as exc:
            return {"valid": False, "reason": str(exc), "alg": alg, "contentHash": content_hash}

    return {"valid": False, "reason": f"Unsupported algorithm: {alg}", "alg": alg, "contentHash": content_hash}


def verify_report_signature(
    report_payload: dict[str, Any],
    signature_block: dict[str, Any],
) -> dict[str, Any]:
    content_hash = _content_hash(report_payload)
    expected = signature_block.get("contentHash", "")
    if content_hash != expected:
        return {"valid": False, "reason": "Content hash mismatch", "contentHash": content_hash}

    blocks: list[dict[str, Any]] = list(signature_block.get("signatures") or [])
    if not blocks:
        blocks = [signature_block]

    per_signature = [_verify_single(content_hash, block) for block in blocks]
    policy = _verify_policy()
    if policy == "all":
        valid = all(r.get("valid") for r in per_signature)
    else:
        valid = any(r.get("valid") for r in per_signature)

    primary = next((r for r in per_signature if r.get("valid")), per_signature[0] if per_signature else {})
    result = {
        "valid": valid,
        "contentHash": content_hash,
        "verifySpecVersion": _VERIFY_SPEC_VERSION,
        "verifyPolicy": policy,
        "perSignature": per_signature,
    }
    if primary:
        result.update(
            {
                "alg": primary.get("alg"),
                "keyFingerprint": primary.get("keyFingerprint"),
                "signedAt": primary.get("signedAt"),
            }
        )
    if not valid:
        result["reason"] = primary.get("reason") or "Signature verification failed"
    return result
