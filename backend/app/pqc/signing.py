from __future__ import annotations

import base64
import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Any

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    from cryptography.hazmat.primitives.serialization import (
        Encoding,
        NoEncryption,
        PrivateFormat,
        PublicFormat,
    )

    _HAS_CRYPTO = True
except ImportError:  # pragma: no cover
    _HAS_CRYPTO = False

try:
    import oqs  # type: ignore[import-untyped]

    _HAS_OQS = True
except ImportError:  # pragma: no cover
    _HAS_OQS = False

_SIGNING_KEY_ENV = "QTANGL_REPORT_SIGNING_KEY_B64"
_ML_DSA_SECRET_ENV = "QTANGL_ML_DSA_SECRET_B64"
_ML_DSA_PUBLIC_ENV = "QTANGL_ML_DSA_PUBLIC_B64"
_ML_DSA_ALG = "ML-DSA-65"
_ED25519_ALG = "Ed25519"


def _canonical_json(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def content_hash_for_payload(payload: dict[str, Any]) -> str:
    """Public helper for verify CLI and transparency log."""
    return hashlib.sha256(_canonical_json(payload)).hexdigest()


def _content_hash(payload: dict[str, Any]) -> str:
    return content_hash_for_payload(payload)


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


def sign_report_payload(report_payload: dict[str, Any]) -> dict[str, Any]:
    """Sign canonical report JSON. ML-DSA-65 primary; Ed25519 mandatory fallback."""
    content_hash = _content_hash(report_payload)
    signed_at = datetime.now(timezone.utc).isoformat()

    if _HAS_OQS:
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
                block = {
                    "alg": _ML_DSA_ALG,
                    "signatureB64": base64.b64encode(signature).decode("ascii"),
                    "publicKeyB64": base64.b64encode(public_key).decode("ascii"),
                    "keyFingerprint": hashlib.sha256(public_key).hexdigest()[:16],
                    "contentHash": content_hash,
                    "signedAt": signed_at,
                }
                from app.pqc.key_registry import register_signing_key

                register_signing_key(
                    alg=_ML_DSA_ALG,
                    public_key_b64=block["publicKeyB64"],
                    key_fingerprint=block["keyFingerprint"],
                )
                return block
        except Exception:
            pass

    if not _HAS_CRYPTO:
        return {
            "alg": "none",
            "signatureB64": "",
            "publicKeyB64": "",
            "keyFingerprint": "",
            "contentHash": content_hash,
            "signedAt": signed_at,
            "warning": "Signing unavailable — install cryptography or oqs-python",
        }

    private_key, _ = _load_ed25519_key()
    public_key = private_key.public_key()
    public_bytes = public_key.public_bytes(Encoding.Raw, PublicFormat.Raw)
    signature = private_key.sign(content_hash.encode("utf-8"))
    block = {
        "alg": _ED25519_ALG,
        "signatureB64": base64.b64encode(signature).decode("ascii"),
        "publicKeyB64": base64.b64encode(public_bytes).decode("ascii"),
        "keyFingerprint": hashlib.sha256(public_bytes).hexdigest()[:16],
        "contentHash": content_hash,
        "signedAt": signed_at,
    }
    from app.pqc.key_registry import register_signing_key

    register_signing_key(
        alg=_ED25519_ALG,
        public_key_b64=block["publicKeyB64"],
        key_fingerprint=block["keyFingerprint"],
    )
    return block


def verify_report_signature(
    report_payload: dict[str, Any],
    signature_block: dict[str, Any],
) -> dict[str, Any]:
    content_hash = _content_hash(report_payload)
    expected = signature_block.get("contentHash", "")
    if content_hash != expected:
        return {"valid": False, "reason": "Content hash mismatch", "contentHash": content_hash}

    alg = signature_block.get("alg", "")
    sig_b64 = signature_block.get("signatureB64", "")
    pub_b64 = signature_block.get("publicKeyB64", "")
    if not sig_b64 or alg == "none":
        return {"valid": False, "reason": "No signature present", "contentHash": content_hash}

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
            return {"valid": False, "reason": str(exc), "contentHash": content_hash}

    if alg == _ED25519_ALG and _HAS_CRYPTO:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
        from cryptography.exceptions import InvalidSignature

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
            return {"valid": False, "reason": "Invalid Ed25519 signature", "contentHash": content_hash}

    return {"valid": False, "reason": f"Unsupported algorithm: {alg}", "contentHash": content_hash}
