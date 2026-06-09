"""Signing key transparency: stable keys, fingerprint history, public key listing."""

from __future__ import annotations

import base64
import hashlib
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_SIGNING_KEY_ENV = "QTANGL_REPORT_SIGNING_KEY_B64"
_ML_DSA_SECRET_ENV = "QTANGL_ML_DSA_SECRET_B64"
_ML_DSA_PUBLIC_ENV = "QTANGL_ML_DSA_PUBLIC_B64"
_KEY_FILE_ENV = "QTANGL_SIGNING_KEY_FILE"
_ML_DSA_KEY_FILE_ENV = "QTANGL_ML_DSA_KEY_FILE"
_ML_DSA_ALG = "ML-DSA-65"
_ED25519_ALG = "Ed25519"


def _data_dir() -> Path:
    configured = os.getenv("QTANGL_PQC_DATA_DIR")
    if configured:
        return Path(configured)
    return Path(__file__).resolve().parents[2] / "data"


def _ed25519_key_file() -> Path:
    raw = os.getenv(_KEY_FILE_ENV)
    if raw:
        return Path(raw)
    return _data_dir() / ".signing" / "ed25519.key"


def _mldsa_key_file() -> Path:
    raw = os.getenv(_ML_DSA_KEY_FILE_ENV)
    if raw:
        return Path(raw)
    return _data_dir() / ".signing" / "mldsa65.keypair"


def fingerprint_for_public_key(public_key: bytes) -> str:
    return hashlib.sha256(public_key).hexdigest()[:16]


def load_stable_ed25519_private_bytes() -> bytes | None:
    """Return stable Ed25519 private key bytes from env, KMS envelope, or persisted file."""
    try:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
        from cryptography.hazmat.primitives.serialization import Encoding, NoEncryption, PrivateFormat
    except ImportError:
        return None

    try:
        from app.pqc.kms_signer import decrypt_envelope_key

        envelope = decrypt_envelope_key()
        if envelope and len(envelope) == 32:
            return envelope
    except Exception:
        pass

    raw = os.environ.get(_SIGNING_KEY_ENV)
    if raw:
        return base64.b64decode(raw)

    key_file = _ed25519_key_file()
    if key_file.is_file():
        stored = key_file.read_bytes()
        if len(stored) == 32:
            return stored

    private_key = Ed25519PrivateKey.generate()
    key_bytes = private_key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())
    key_file.parent.mkdir(parents=True, exist_ok=True)
    key_file.write_bytes(key_bytes)
    logger.info("Generated stable Ed25519 signing key at %s", key_file)
    return key_bytes


def load_stable_mldsa_keypair() -> tuple[bytes, bytes] | None:
    """Return (secret, public) ML-DSA key bytes from env or persisted file."""
    secret_b64 = os.environ.get(_ML_DSA_SECRET_ENV)
    public_b64 = os.environ.get(_ML_DSA_PUBLIC_ENV)
    if secret_b64 and public_b64:
        return base64.b64decode(secret_b64), base64.b64decode(public_b64)

    key_file = _mldsa_key_file()
    if key_file.is_file():
        payload = key_file.read_text(encoding="utf-8").strip().split("\n")
        if len(payload) >= 2:
            return base64.b64decode(payload[0]), base64.b64decode(payload[1])

    try:
        import oqs  # type: ignore[import-untyped]
    except ImportError:
        return None

    try:
        with oqs.Signature(_ML_DSA_ALG) as signer:
            public_key = signer.generate_keypair()
            secret = signer.secret_key
        key_file.parent.mkdir(parents=True, exist_ok=True)
        key_file.write_text(
            f"{base64.b64encode(secret).decode('ascii')}\n"
            f"{base64.b64encode(public_key).decode('ascii')}\n",
            encoding="utf-8",
        )
        logger.info("Generated stable ML-DSA signing keypair at %s", key_file)
        return secret, public_key
    except Exception as exc:
        logger.warning("ML-DSA key generation failed: %s", exc)
        return None


def register_signing_key(
    *,
    alg: str,
    public_key_b64: str,
    key_fingerprint: str,
    active: bool = True,
) -> None:
    """Persist key metadata for transparency listing (best-effort)."""
    if not public_key_b64 or not key_fingerprint:
        return
    try:
        from app.db.engine import db_session
        from app.db.models import SigningKeyRecord
    except Exception:
        return

    try:
        with db_session() as session:
            existing = (
                session.query(SigningKeyRecord)
                .filter(SigningKeyRecord.key_fingerprint == key_fingerprint)
                .one_or_none()
            )
            now = datetime.now(timezone.utc)
            if existing:
                if active and existing.status != "active":
                    existing.status = "active"
                    existing.retired_at = None
                return
            session.add(
                SigningKeyRecord(
                    id=f"key-{key_fingerprint}",
                    alg=alg,
                    public_key_b64=public_key_b64,
                    key_fingerprint=key_fingerprint,
                    status="active" if active else "retired",
                    activated_at=now,
                )
            )
    except Exception as exc:
        logger.debug("register_signing_key skipped: %s", exc)


def retire_signing_key(*, key_fingerprint: str) -> bool:
    """Mark a signing key retired; historical signatures remain verifiable."""
    if not key_fingerprint:
        return False
    try:
        from app.db.engine import db_session
        from app.db.models import SigningKeyRecord
    except Exception:
        return False

    try:
        with db_session() as session:
            row = (
                session.query(SigningKeyRecord)
                .filter(SigningKeyRecord.key_fingerprint == key_fingerprint)
                .one_or_none()
            )
            if row is None:
                return False
            row.status = "retired"
            row.retired_at = datetime.now(timezone.utc)
            return True
    except Exception as exc:
        logger.warning("retire_signing_key failed: %s", exc)
        return False


def list_public_signing_keys() -> list[dict[str, Any]]:
    """Return public signing keys with fingerprint history for transparency endpoint."""
    keys: list[dict[str, Any]] = []
    try:
        from app.db.engine import db_session
        from app.db.models import SigningKeyRecord
    except Exception:
        return keys

    try:
        with db_session() as session:
            rows = (
                session.query(SigningKeyRecord)
                .order_by(SigningKeyRecord.activated_at.asc())
                .all()
            )
            for row in rows:
                keys.append(
                    {
                        "alg": row.alg,
                        "publicKeyB64": row.public_key_b64,
                        "keyFingerprint": row.key_fingerprint,
                        "status": row.status,
                        "activatedAt": row.activated_at.isoformat() if row.activated_at else None,
                        "retiredAt": row.retired_at.isoformat() if row.retired_at else None,
                    }
                )
    except Exception as exc:
        logger.debug("list_public_signing_keys skipped: %s", exc)
    return keys
