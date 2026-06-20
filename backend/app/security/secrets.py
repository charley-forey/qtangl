"""Encrypt sensitive integration and settings fields at rest."""

from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

_SENSITIVE_KEYS = {"apiToken", "password", "apiKey", "token", "webhookSigningSecret"}

_FERNET_KEY_HELP = (
    "Generate a valid key with: "
    'python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'
)


def is_valid_fernet_key(key: str | None) -> bool:
    if not key or not isinstance(key, str):
        return False
    try:
        from cryptography.fernet import Fernet

        Fernet(key.encode())
        return True
    except (ValueError, TypeError):
        return False


def secrets_key_status() -> dict[str, object]:
    """Health/readiness: whether QTANGL_SECRETS_KEY is present and Fernet-valid."""
    key = os.environ.get("QTANGL_SECRETS_KEY")
    if not key:
        return {"configured": False, "valid": False}
    return {"configured": True, "valid": is_valid_fernet_key(key)}


def _fernet():
    from cryptography.fernet import Fernet

    key = os.environ.get("QTANGL_SECRETS_KEY")
    if not key:
        return None
    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except ValueError:
        logger.error("QTANGL_SECRETS_KEY is set but invalid. %s", _FERNET_KEY_HELP)
        return None


def encrypt_json_blob(data: dict[str, Any]) -> str:
    payload = json.dumps(data)
    f = _fernet()
    if f is None:
        return payload
    return "enc:" + f.encrypt(payload.encode()).decode()


def decrypt_json_blob(stored: str) -> dict[str, Any]:
    if not stored or not stored.startswith("enc:"):
        try:
            return json.loads(stored or "{}")
        except json.JSONDecodeError:
            logger.warning("tenant settings JSON corrupt — using empty defaults")
            return {}
    f = _fernet()
    if f is None:
        logger.warning("cannot decrypt tenant settings — invalid or missing QTANGL_SECRETS_KEY")
        return {}
    try:
        return json.loads(f.decrypt(stored[4:].encode()).decode())
    except Exception:
        logger.warning("tenant settings decrypt failed — using empty defaults")
        return {}


def encrypt_config(config: dict[str, Any]) -> str:
    return encrypt_json_blob(config)


def decrypt_config(stored: str) -> dict[str, Any]:
    return decrypt_json_blob(stored)


def redact_config(config: dict[str, Any]) -> dict[str, Any]:
    redacted = dict(config)
    for key in _SENSITIVE_KEYS:
        if key in redacted and redacted[key]:
            redacted[key] = "***"
    return redacted
