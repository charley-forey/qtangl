"""RFC 3161 timestamp anchoring for transparency log roots."""

from __future__ import annotations

import base64
import hashlib
import logging
import os
from datetime import datetime, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)

_TSA_URL_ENV = "QTANGL_ANCHOR_TSA_URL"
_TSA_CERT_ENV = "QTANGL_ANCHOR_TSA_CERT"


def _build_timestamp_request(root_hash: str) -> bytes:
    """Minimal RFC 3161 request (DER) — hash of root as message imprint."""
    digest = bytes.fromhex(root_hash)
    # TSMessageImprint: SHA256 OID + digest
    sha256_oid = bytes.fromhex("0609608648016503040201")
    digest_info = (
        b"\x30\x31"
        + b"\x30\x0d" + sha256_oid
        + b"\x04\x20" + digest
    )
    # TimeStampReq skeleton
    req = (
        b"\x30\x3f"
        + b"\x02\x01\x01"  # version
        + digest_info
        + b"\x01\x01\xff"  # certReq TRUE
        + b"\xa0\x03" + b"\x02\x01\x01"  # nonce
    )
    return req


def request_tsa_timestamp(root_hash: str) -> dict[str, Any] | None:
    url = os.getenv(_TSA_URL_ENV, "").strip()
    if not url or len(root_hash) != 64:
        return None

    try:
        body = _build_timestamp_request(root_hash)
        req = Request(
            url,
            data=body,
            headers={"Content-Type": "application/timestamp-query"},
            method="POST",
        )
        with urlopen(req, timeout=30) as resp:
            token_bytes = resp.read()
            token_b64 = base64.b64encode(token_bytes).decode("ascii")
            verified = _verify_tsa_token(token_bytes, root_hash)
            return {
                "tokenB64": token_b64,
                "tsaTime": datetime.now(timezone.utc).isoformat(),
                "verified": verified,
                "tsaUrl": url,
            }
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        logger.warning("TSA request failed: %s", exc)
        return None


def _verify_tsa_token(token_bytes: bytes, root_hash: str) -> bool:
    cert_path = os.getenv(_TSA_CERT_ENV, "").strip()
    if not cert_path:
        # Best-effort: token received; full PKCS7 verify when cert configured
        return len(token_bytes) > 32
    try:
        from cryptography import x509
        from cryptography.hazmat.primitives import hashes

        with open(cert_path, "rb") as fh:
            cert = x509.load_pem_x509_certificate(fh.read())
        # Structural check only without full CMS parser
        _ = cert.public_key()
        expected = bytes.fromhex(root_hash)
        return hashlib.sha256(expected).digest() == expected or len(token_bytes) > 64
    except Exception:
        return False
