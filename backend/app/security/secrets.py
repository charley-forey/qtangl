"""Encrypt sensitive integration and settings fields at rest."""

from __future__ import annotations

import json
import os
from typing import Any

_SENSITIVE_KEYS = {"apiToken", "password", "apiKey", "token", "webhookSigningSecret"}


def _fernet():
    from cryptography.fernet import Fernet

    key = os.environ.get("QTANGL_SECRETS_KEY")
    if not key:
        return None
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_json_blob(data: dict[str, Any]) -> str:
    payload = json.dumps(data)
    f = _fernet()
    if f is None:
        return payload
    return "enc:" + f.encrypt(payload.encode()).decode()


def decrypt_json_blob(stored: str) -> dict[str, Any]:
    if not stored or not stored.startswith("enc:"):
        return json.loads(stored or "{}")
    f = _fernet()
    if f is None:
        return json.loads(stored[4:])
    return json.loads(f.decrypt(stored[4:].encode()).decode())


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
