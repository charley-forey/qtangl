"""External anchoring of transparency log roots (git artifact / witness file)."""

from __future__ import annotations

import hashlib
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_ANCHOR_DIR_ENV = "QTANGL_TRANSPARENCY_ANCHOR_DIR"


def _anchor_dir() -> Path:
    raw = os.getenv(_ANCHOR_DIR_ENV)
    if raw:
        return Path(raw)
    from app.pqc.key_registry import _data_dir

    return _data_dir() / "transparency" / "anchors"


def anchor_log_root(root_hash: str, *, seq: int, entry_count: int) -> dict[str, Any] | None:
    """Write an anchor record for the current log root (best-effort)."""
    if not root_hash or root_hash == "0" * 64:
        return None

    anchor_dir = _anchor_dir()
    anchor_dir.mkdir(parents=True, exist_ok=True)
    anchored_at = datetime.now(timezone.utc).isoformat()
    witness_id = hashlib.sha256(f"{root_hash}:{anchored_at}".encode()).hexdigest()[:16]
    record = {
        "rootHash": root_hash,
        "seq": seq,
        "entryCount": entry_count,
        "anchoredAt": anchored_at,
        "witnessId": witness_id,
        "method": "file_witness",
        "note": "Append-only signed log root; external mirror per KR-010 roadmap.",
    }

    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceAnchorRecord
    except Exception:
        EvidenceAnchorRecord = None  # type: ignore[misc, assignment]

    path = anchor_dir / f"anchor-{witness_id}.json"
    path.write_text(json.dumps(record, indent=2, sort_keys=True), encoding="utf-8")
    latest = anchor_dir / "latest.json"
    latest.write_text(json.dumps(record, indent=2, sort_keys=True), encoding="utf-8")

    if EvidenceAnchorRecord is not None:
        try:
            with db_session() as session:
                session.add(
                    EvidenceAnchorRecord(
                        id=f"anchor-{witness_id}",
                        root_hash=root_hash,
                        seq=seq,
                        entry_count=entry_count,
                        witness_id=witness_id,
                        method="file_witness",
                        anchored_at=datetime.now(timezone.utc),
                    )
                )
        except Exception as exc:
            logger.debug("anchor DB record skipped: %s", exc)

    logger.info("Anchored transparency root seq=%s witness=%s", seq, witness_id)
    return record


def latest_anchor_for_root(root_hash: str) -> dict[str, Any] | None:
    """Return latest anchor if it matches the given root."""
    anchor_dir = _anchor_dir()
    latest = anchor_dir / "latest.json"
    if not latest.is_file():
        return _latest_anchor_from_db(root_hash)
    try:
        record = json.loads(latest.read_text(encoding="utf-8"))
        if record.get("rootHash") == root_hash:
            return {
                "witnessId": record.get("witnessId"),
                "anchoredAt": record.get("anchoredAt"),
                "method": record.get("method"),
            }
    except Exception:
        pass
    return _latest_anchor_from_db(root_hash)


def _latest_anchor_from_db(root_hash: str) -> dict[str, Any] | None:
    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceAnchorRecord
    except Exception:
        return None

    try:
        with db_session() as session:
            row = (
                session.query(EvidenceAnchorRecord)
                .filter(EvidenceAnchorRecord.root_hash == root_hash)
                .order_by(EvidenceAnchorRecord.anchored_at.desc())
                .first()
            )
            if row is None:
                return None
            return {
                "witnessId": row.witness_id,
                "anchoredAt": row.anchored_at.isoformat() if row.anchored_at else None,
                "method": row.method,
            }
    except Exception:
        return None


def maybe_anchor_on_milestone(*, seq: int, root_hash: str, entry_count: int) -> None:
    """Anchor periodically (every 100 entries or env-forced)."""
    force = os.getenv("QTANGL_ANCHOR_EVERY_ENTRY", "false").lower() in {"1", "true", "yes"}
    interval = int(os.getenv("QTANGL_ANCHOR_INTERVAL", "100"))
    if force or (seq > 0 and seq % interval == 0):
        anchor_log_root(root_hash, seq=seq, entry_count=entry_count)
