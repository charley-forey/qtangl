"""Ed25519 signature verification for Qtangl reports."""

from __future__ import annotations

import base64
from typing import Any


def verify_ed25519(*, content_hash: str, signature_b64: str, public_key_b64: str) -> dict[str, Any]:
    try:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
        from cryptography.exceptions import InvalidSignature
    except ImportError:
        return {"valid": False, "reason": "cryptography not installed", "alg": "Ed25519"}

    try:
        pub = Ed25519PublicKey.from_public_bytes(base64.b64decode(public_key_b64))
        signature = base64.b64decode(signature_b64)
        pub.verify(signature, content_hash.encode("utf-8"))
        return {"valid": True, "alg": "Ed25519", "contentHash": content_hash}
    except InvalidSignature:
        return {"valid": False, "reason": "Invalid Ed25519 signature", "alg": "Ed25519", "contentHash": content_hash}
    except Exception as exc:
        return {"valid": False, "reason": str(exc), "alg": "Ed25519", "contentHash": content_hash}
