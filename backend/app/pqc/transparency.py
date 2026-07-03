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


def _all_content_hashes() -> list[str]:
    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceLogEntry
    except Exception:
        return []

    try:
        with db_session() as session:
            rows = session.query(EvidenceLogEntry).order_by(EvidenceLogEntry.seq.asc()).all()
            return [r.content_hash for r in rows]
    except Exception:
        return []


def current_merkle_root() -> str:
    from app.pqc.merkle import merkle_root

    leaves = _all_content_hashes()
    return merkle_root(leaves)


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
            merkle = current_merkle_root()
            receipt["merkleRoot"] = merkle
            from app.pqc.anchoring import maybe_anchor_on_milestone

            maybe_anchor_on_milestone(seq=seq, root_hash=entry_hash, entry_count=seq, merkle_root=merkle)
            return receipt
    except Exception as exc:
        logger.warning("transparency append failed (non-fatal): %s", exc)
        return None


def current_root() -> dict[str, Any]:
    """Return the current log root (seq + entry_hash + merkleRoot)."""
    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceLogEntry
    except Exception:
        return {"seq": 0, "rootHash": _GENESIS, "entryCount": 0, "merkleRoot": _GENESIS}

    try:
        with db_session() as session:
            count = session.query(EvidenceLogEntry).count()
            last = (
                session.query(EvidenceLogEntry)
                .order_by(EvidenceLogEntry.seq.desc())
                .first()
            )
            merkle = current_merkle_root()
            if last is None:
                return {"seq": 0, "rootHash": _GENESIS, "entryCount": 0, "merkleRoot": merkle}
            root = {
                "seq": last.seq,
                "rootHash": last.entry_hash,
                "merkleRoot": merkle,
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
        return {"seq": 0, "rootHash": _GENESIS, "entryCount": 0, "merkleRoot": _GENESIS}


def inclusion_proof(content_hash: str) -> dict[str, Any] | None:
    """Return inclusion receipt with Merkle audit path."""
    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceLogEntry
        from app.pqc.merkle import merkle_path, merkle_root
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
            all_rows = session.query(EvidenceLogEntry).order_by(EvidenceLogEntry.seq.asc()).all()
            leaves = [r.content_hash for r in all_rows]
            index = next(i for i, r in enumerate(all_rows) if r.content_hash == content_hash)
            mroot = merkle_root(leaves)
            audit_path = merkle_path(leaves, index)

            root_row = all_rows[-1] if all_rows else None
            receipt = _receipt_from_row(row)
            receipt["rootHash"] = root_row.entry_hash if root_row else _GENESIS
            receipt["rootSeq"] = root_row.seq if root_row else 0
            receipt["merkleRoot"] = mroot
            receipt["auditPath"] = audit_path
            receipt["leafIndex"] = index
            return receipt
    except Exception as exc:
        logger.debug("inclusion_proof failed: %s", exc)
        return None


def consistency_proof(*, from_seq: int, to_seq: int) -> dict[str, Any] | None:
    """Prove append-only between two sequence numbers."""
    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceLogEntry
    except Exception:
        return None

    if from_seq < 0 or to_seq < from_seq:
        return None

    try:
        with db_session() as session:
            start = session.query(EvidenceLogEntry).filter(EvidenceLogEntry.seq == from_seq).one_or_none()
            end = session.query(EvidenceLogEntry).filter(EvidenceLogEntry.seq == to_seq).one_or_none()
            if start is None or end is None:
                return None
            chain: list[str] = []
            rows = (
                session.query(EvidenceLogEntry)
                .filter(EvidenceLogEntry.seq >= from_seq, EvidenceLogEntry.seq <= to_seq)
                .order_by(EvidenceLogEntry.seq.asc())
                .all()
            )
            prev = start.prev_entry_hash
            for row in rows:
                expected = _entry_hash(prev, row.content_hash, row.seq)
                chain.append(expected)
                if expected != row.entry_hash:
                    return {"valid": False, "reason": "chain_break", "seq": row.seq}
                prev = row.entry_hash
            return {
                "valid": True,
                "fromSeq": from_seq,
                "toSeq": to_seq,
                "fromRoot": start.entry_hash,
                "toRoot": end.entry_hash,
                "entryCount": len(rows),
                "chainHashes": chain,
            }
    except Exception as exc:
        logger.debug("consistency_proof failed: %s", exc)
        return None


def detect_anchor_drift(*, root_hash: str, merkle_root: str) -> dict[str, Any]:
    """Compare DB root against last published external witness."""
    from app.pqc.anchoring import latest_anchor_for_root

    anchor = latest_anchor_for_root(root_hash)
    if not anchor:
        return {"drift": False, "reason": "no_witness"}
    witness_root = anchor.get("merkleRoot") or root_hash
    drift = witness_root not in {root_hash, merkle_root}
    return {
        "drift": drift,
        "dbRoot": root_hash,
        "dbMerkleRoot": merkle_root,
        "witnessRoot": witness_root,
        "witnessId": anchor.get("witnessId"),
    }


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
        "merkleRoot": proof.get("merkleRoot"),
        "auditPath": proof.get("auditPath"),
        "leafIndex": proof.get("leafIndex"),
        "signedAt": proof.get("signedAt"),
        "alg": proof.get("alg"),
        "keyFingerprint": proof.get("keyFingerprint"),
    }


def _receipt_from_row(row: Any) -> dict[str, Any]:
    created = row.created_at.isoformat() if row.created_at else None
    if created and created.endswith("+00:00"):
        created = created
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

        blocks = list(signature_block.get("signatures") or [signature_block])
        for block in blocks:
            register_signing_key(
                alg=str(block.get("alg") or ""),
                public_key_b64=str(block.get("publicKeyB64") or ""),
                key_fingerprint=str(block.get("keyFingerprint") or ""),
            )
    except Exception:
        pass
    return append_entry(str(content_hash), signature_block, tenant_id=tenant_id)


def list_recent_entries(*, limit: int = 50) -> list[dict[str, Any]]:
    """Return recent transparency log entries for tenant Command Center viewer."""
    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceLogEntry
    except Exception:
        return []

    try:
        with db_session() as session:
            rows = (
                session.query(EvidenceLogEntry)
                .order_by(EvidenceLogEntry.seq.desc())
                .limit(limit)
                .all()
            )
            return [
                {
                    "seq": row.seq,
                    "content_hash": row.content_hash,
                    "entry_hash": row.entry_hash,
                    "scan_id": None,
                    "created_at": row.signed_at or None,
                    "tenant_id": row.tenant_id,
                }
                for row in rows
            ]
    except Exception as exc:
        logger.debug("list_recent_entries failed: %s", exc)
        return []
