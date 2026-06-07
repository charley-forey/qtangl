"""Append-only transparency log for signed report content hashes."""

from __future__ import annotations

import hashlib
import logging
import os
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

_FLAG = "QTANGL_ENABLE_TRANSPARENCY_LOG"
_GENESIS = "0" * 64


def transparency_log_enabled() -> bool:
    raw = os.getenv(_FLAG, "false").lower()
    return raw in {"1", "true", "yes", "on"}


def _entry_hash(prev_entry_hash: str, content_hash: str, seq: int) -> str:
    payload = f"{prev_entry_hash}:{content_hash}:{seq}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def append_entry(
    content_hash: str,
    signature_block: dict[str, Any],
    *,
    tenant_id: str | None = None,
) -> dict[str, Any] | None:
    """Append content_hash to the transparency log. Idempotent; fail-safe (returns None on error)."""
    if not transparency_log_enabled():
        return None
    if not content_hash or len(content_hash) != 64:
        return None

    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceLogEntry
    except Exception as exc:
        logger.debug("transparency log unavailable: %s", exc)
        return None

    key_fingerprint = str(signature_block.get("keyFingerprint") or "")
    alg = str(signature_block.get("alg") or "")
    signed_at = str(signature_block.get("signedAt") or "")

    try:
        with db_session() as session:
            existing = (
                session.query(EvidenceLogEntry)
                .filter(EvidenceLogEntry.content_hash == content_hash)
                .one_or_none()
            )
            if existing:
                return _receipt_from_row(existing)

            last = (
                session.query(EvidenceLogEntry)
                .order_by(EvidenceLogEntry.seq.desc())
                .first()
            )
            prev_hash = last.entry_hash if last else _GENESIS
            seq = (last.seq + 1) if last else 1
            entry_hash = _entry_hash(prev_hash, content_hash, seq)

            row = EvidenceLogEntry(
                seq=seq,
                content_hash=content_hash,
                key_fingerprint=key_fingerprint,
                alg=alg,
                signed_at=signed_at,
                prev_entry_hash=prev_hash,
                entry_hash=entry_hash,
                tenant_id=tenant_id,
            )
            session.add(row)
            session.flush()
            receipt = _receipt_from_row(row)
            from app.pqc.anchoring import maybe_anchor_on_milestone

            maybe_anchor_on_milestone(seq=seq, root_hash=entry_hash, entry_count=seq)
            return receipt
    except Exception as exc:
        logger.warning("transparency append failed (non-fatal): %s", exc)
        return None


def current_root() -> dict[str, Any]:
    """Return the current log root (seq + entry_hash)."""
    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceLogEntry
    except Exception:
        return {"seq": 0, "rootHash": _GENESIS, "entryCount": 0}

    try:
        with db_session() as session:
            count = session.query(EvidenceLogEntry).count()
            last = (
                session.query(EvidenceLogEntry)
                .order_by(EvidenceLogEntry.seq.desc())
                .first()
            )
            if last is None:
                return {"seq": 0, "rootHash": _GENESIS, "entryCount": 0}
            root = {
                "seq": last.seq,
                "rootHash": last.entry_hash,
                "entryCount": count,
                "updatedAt": last.created_at.isoformat() if last.created_at else None,
            }
            from app.pqc.anchoring import latest_anchor_for_root

            anchor = latest_anchor_for_root(last.entry_hash)
            if anchor:
                root["anchor"] = anchor
            return root
    except Exception as exc:
        logger.debug("current_root failed: %s", exc)
        return {"seq": 0, "rootHash": _GENESIS, "entryCount": 0}


def inclusion_proof(content_hash: str) -> dict[str, Any] | None:
    """Return inclusion receipt for a content hash if present in the log."""
    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceLogEntry
    except Exception:
        return None

    try:
        with db_session() as session:
            row = (
                session.query(EvidenceLogEntry)
                .filter(EvidenceLogEntry.content_hash == content_hash)
                .one_or_none()
            )
            if row is None:
                return None
            root_row = (
                session.query(EvidenceLogEntry)
                .order_by(EvidenceLogEntry.seq.desc())
                .first()
            )
            receipt = _receipt_from_row(row)
            receipt["rootHash"] = root_row.entry_hash if root_row else _GENESIS
            receipt["rootSeq"] = root_row.seq if root_row else 0
            return receipt
    except Exception as exc:
        logger.debug("inclusion_proof failed: %s", exc)
        return None


def log_inclusion_block(content_hash: str) -> dict[str, Any] | None:
    """Compact block for verify responses."""
    proof = inclusion_proof(content_hash)
    if proof is None:
        return None
    return {
        "included": True,
        "seq": proof.get("seq"),
        "entryHash": proof.get("entryHash"),
        "rootHash": proof.get("rootHash"),
        "rootSeq": proof.get("rootSeq"),
        "signedAt": proof.get("signedAt"),
        "alg": proof.get("alg"),
        "keyFingerprint": proof.get("keyFingerprint"),
    }


def _receipt_from_row(row: Any) -> dict[str, Any]:
    created = row.created_at.isoformat() if row.created_at else None
    if created and created.endswith("+00:00"):
        created = created  # keep UTC suffix
    elif created and "+" not in created and "Z" not in created:
        created = f"{created}+00:00"
    return {
        "seq": row.seq,
        "contentHash": row.content_hash,
        "entryHash": row.entry_hash,
        "prevEntryHash": row.prev_entry_hash,
        "keyFingerprint": row.key_fingerprint,
        "alg": row.alg,
        "signedAt": row.signed_at,
        "createdAt": created,
    }


def safe_append_after_sign(
    report_payload: dict[str, Any],
    signature_block: dict[str, Any],
    *,
    tenant_id: str | None = None,
) -> dict[str, Any] | None:
    """Fail-safe wrapper: never raises."""
    content_hash = signature_block.get("contentHash")
    if not content_hash:
        from app.pqc.signing import content_hash_for_payload

        content_hash = content_hash_for_payload(report_payload)
    try:
        from app.pqc.key_registry import register_signing_key

        register_signing_key(
            alg=str(signature_block.get("alg") or ""),
            public_key_b64=str(signature_block.get("publicKeyB64") or ""),
            key_fingerprint=str(signature_block.get("keyFingerprint") or ""),
        )
    except Exception:
        pass
    return append_entry(str(content_hash), signature_block, tenant_id=tenant_id)
