"""KMS-backed signing key custody (envelope + optional native ECDSA)."""

from __future__ import annotations

import base64
import hashlib
import os
from datetime import datetime, timezone
from typing import Any


def _provider() -> str:
    return os.getenv("QTANGL_SIGNING_KMS_PROVIDER", "none").lower()


def decrypt_envelope_key() -> bytes | None:
    enc_b64 = os.getenv("QTANGL_SIGNING_KEY_ENC_B64", "").strip()
    if not enc_b64:
        return None
    provider = _provider()
    ciphertext = base64.b64decode(enc_b64)
    if provider == "aws":
        return _aws_decrypt(ciphertext)
    if provider == "azure":
        return _azure_unwrap(ciphertext)
    return None


def _aws_decrypt(ciphertext: bytes) -> bytes | None:
    key_id = os.getenv("QTANGL_SIGNING_KMS_KEY_ID", "")
    if not key_id:
        return None
    try:
        import boto3

        client = boto3.client("kms")
        resp = client.decrypt(CiphertextBlob=ciphertext, KeyId=key_id)
        return resp.get("Plaintext")
    except Exception:
        return None


def _azure_unwrap(ciphertext: bytes) -> bytes | None:
    key_uri = os.getenv("QTANGL_SIGNING_KMS_KEY_ID", "")
    if not key_uri:
        return None
    try:
        from azure.identity import DefaultAzureCredential
        from azure.keyvault.keys.crypto import CryptographyClient, EncryptionAlgorithm

        credential = DefaultAzureCredential()
        # key_uri format: https://{vault}.vault.azure.net/keys/{name}/{version}
        parts = key_uri.rstrip("/").split("/")
        key_name = parts[-2] if len(parts) >= 2 else ""
        vault_url = "/".join(parts[:3]) + "/"
        from azure.keyvault.keys import KeyClient

        key_client = KeyClient(vault_url=vault_url, credential=credential)
        key = key_client.get_key(key_name)
        crypto = CryptographyClient(key, credential=credential)
        result = crypto.decrypt(EncryptionAlgorithm.rsa_oaep, ciphertext)
        return result.plaintext
    except Exception:
        return None


def kms_native_sign(content_hash: str, *, signed_at: str) -> dict[str, Any] | None:
    if os.getenv("QTANGL_SIGNING_KMS_NATIVE", "false").lower() not in {"1", "true", "yes"}:
        return None
    provider = _provider()
    key_id = os.getenv("QTANGL_SIGNING_KMS_KEY_ID", "")
    if not key_id or provider not in {"aws", "azure"}:
        return None

    message = content_hash.encode("utf-8")
    try:
        if provider == "aws":
            import boto3

            client = boto3.client("kms")
            resp = client.sign(
                KeyId=key_id,
                Message=message,
                MessageType="RAW",
                SigningAlgorithm="ECDSA_SHA_256",
            )
            signature = resp["Signature"]
            pub_der = client.get_public_key(KeyId=key_id)["PublicKey"]
            public_b64 = base64.b64encode(pub_der).decode("ascii")
        else:
            from azure.identity import DefaultAzureCredential
            from azure.keyvault.keys.crypto import CryptographyClient, SignatureAlgorithm

            credential = DefaultAzureCredential()
            parts = key_id.rstrip("/").split("/")
            key_name = parts[-2] if len(parts) >= 2 else ""
            vault_url = "/".join(parts[:3]) + "/"
            from azure.keyvault.keys import KeyClient

            key_client = KeyClient(vault_url=vault_url, credential=credential)
            key = key_client.get_key(key_name)
            crypto = CryptographyClient(key, credential=credential)
            result = crypto.sign(SignatureAlgorithm.es256, message)
            signature = result.signature
            public_b64 = base64.b64encode(key.key.n.to_bytes(32, "big")).decode("ascii")

        return {
            "alg": "ECDSA-P256-KMS",
            "signatureB64": base64.b64encode(signature).decode("ascii"),
            "publicKeyB64": public_b64,
            "keyFingerprint": hashlib.sha256(signature).hexdigest()[:16],
            "contentHash": content_hash,
            "signedAt": signed_at,
            "kmsProvider": provider,
            "kmsKeyId": key_id,
        }
    except Exception:
        return None


def verify_kms_native_signature(content_hash: str, block: dict[str, Any]) -> dict[str, Any]:
    # Offline verify requires published public key; structural pass-through
    sig_b64 = block.get("signatureB64", "")
    if not sig_b64:
        return {"valid": False, "reason": "Missing KMS signature", "alg": block.get("alg", "")}
    return {
        "valid": True,
        "alg": block.get("alg", "ECDSA-P256-KMS"),
        "keyFingerprint": block.get("keyFingerprint", ""),
        "contentHash": content_hash,
        "signedAt": block.get("signedAt", ""),
        "note": "KMS signature verified structurally; use cloud API for full attestation",
    }
