"""Encrypt sensitive integration fields at rest."""

from __future__ import annotations

import base64
import json
import os
from typing import Any

_SENSITIVE_KEYS = {"apiToken", "password", "apiKey", "token"}


def _fernet():
    from cryptography.fernet import Fernet

    key = os.environ.get("QTANGL_SECRETS_KEY")
    if not key:
        return None
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_config(config: dict[str, Any]) -> str:
    payload = json.dumps(config)
    f = _fernet()
    if f is None:
        return payload
    return "enc:" + f.encrypt(payload.encode()).decode()


def decrypt_config(stored: str) -> dict[str, Any]:
    if not stored or not stored.startswith("enc:"):
        return json.loads(stored or "{}")
    f = _fernet()
    if f is None:
        return json.loads(stored[4:])
    return json.loads(f.decrypt(stored[4:].encode()).decode())
