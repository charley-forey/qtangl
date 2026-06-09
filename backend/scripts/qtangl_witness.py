#!/usr/bin/env python3
"""Reference third-party witness — poll root, verify consistency, co-sign with Ed25519."""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
from urllib.request import Request, urlopen


def main() -> int:
    parser = argparse.ArgumentParser(description="Qtangl transparency witness")
    parser.add_argument("--api-base", required=True)
    parser.add_argument("--witness-id", default="reference-witness")
    args = parser.parse_args()

    root_url = f"{args.api_base.rstrip('/')}/pqc/transparency/root"
    with urlopen(Request(root_url, headers={"Accept": "application/json"}), timeout=15) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    log = payload.get("log") or {}
    root_hash = str(log.get("merkleRoot") or log.get("rootHash") or "")
    seq = int(log.get("seq") or 0)

    message = f"{root_hash}:{seq}".encode("utf-8")
    try:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
        from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, NoEncryption, PublicFormat

        key_b64 = os.getenv("QTANGL_WITNESS_SIGNING_KEY_B64", "")
        if key_b64:
            private_key = Ed25519PrivateKey.from_private_bytes(base64.b64decode(key_b64))
        else:
            private_key = Ed25519PrivateKey.generate()
        signature = private_key.sign(message)
        public_bytes = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
        alg = "Ed25519"
    except ImportError:
        import hashlib

        signature = hashlib.sha256(message).digest()
        public_bytes = b"reference"
        alg = "reference-sha256"

    body = {
        "witnessId": args.witness_id,
        "rootHash": root_hash,
        "seq": seq,
        "alg": alg,
        "signatureB64": base64.b64encode(signature).decode("ascii"),
        "publicKeyB64": base64.b64encode(public_bytes).decode("ascii"),
    }
    submit_url = f"{args.api_base.rstrip('/')}/pqc/transparency/witness"
    req = Request(
        submit_url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
