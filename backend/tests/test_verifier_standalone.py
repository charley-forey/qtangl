"""Standalone qtangl-verify package tests."""

from __future__ import annotations

import base64
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "verifier"))

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, NoEncryption, PrivateFormat, PublicFormat

from qtangl_verify.content_hash import content_hash_for_payload
from qtangl_verify.merkle import verify_merkle_path
from qtangl_verify.verify import verify_report


def test_content_hash_stable():
    payload = {"scanId": "s1", "readinessScore": 42}
    assert content_hash_for_payload(payload) == content_hash_for_payload(dict(payload))


def test_ed25519_verify_roundtrip():
    private = Ed25519PrivateKey.generate()
    public = private.public_key()
    report = {"scanId": "verify-pkg", "readinessScore": 80}
    content_hash = content_hash_for_payload(report)
    signature = private.sign(content_hash.encode("utf-8"))
    block = {
        "alg": "Ed25519",
        "contentHash": content_hash,
        "signatureB64": base64.b64encode(signature).decode("ascii"),
        "publicKeyB64": base64.b64encode(
            public.public_bytes(Encoding.Raw, PublicFormat.Raw)
        ).decode("ascii"),
    }
    result = verify_report(report, {"contentHash": content_hash, "signatures": [block]})
    assert result["valid"] is True


def test_merkle_path_verify():
    from qtangl_verify.merkle import verify_merkle_path

    # leaf + sibling path to root (two-leaf tree)
    left = "aa" * 32
    right = "bb" * 32
    import hashlib

    root = hashlib.sha256(f"{left}:{right}".encode()).hexdigest()
    path = [{"hash": right, "position": "right"}]
    assert verify_merkle_path(leaf=left, audit_path=path, root=root) is True
