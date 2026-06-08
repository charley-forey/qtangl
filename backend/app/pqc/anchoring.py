"""External anchoring of transparency log roots (file, Git, RFC 3161 TSA)."""

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


def anchor_log_root(
    root_hash: str,
    *,
    seq: int,
    entry_count: int,
    merkle_root: str | None = None,
) -> dict[str, Any] | None:
    """Write anchor record and publish to external witnesses (best-effort)."""
    if not root_hash or root_hash == "0" * 64:
        return None

    anchor_dir = _anchor_dir()
    anchor_dir.mkdir(parents=True, exist_ok=True)
    anchored_at = datetime.now(timezone.utc).isoformat()
    witness_id = hashlib.sha256(f"{root_hash}:{anchored_at}".encode()).hexdigest()[:16]
    record: dict[str, Any] = {
        "rootHash": root_hash,
        "merkleRoot": merkle_root or root_hash,
        "seq": seq,
        "entryCount": entry_count,
        "anchoredAt": anchored_at,
        "witnessId": witness_id,
        "method": "file_witness",
    }

    git_result: dict[str, Any] | None = None
    tsa_result: dict[str, Any] | None = None
    try:
        from app.pqc.anchor_git import publish_git_anchor

        git_result = publish_git_anchor(record)
    except Exception as exc:
        logger.debug("git anchor skipped: %s", exc)

    try:
        from app.pqc.anchor_tsa import request_tsa_timestamp

        anchor_target = merkle_root or root_hash
        tsa_result = request_tsa_timestamp(anchor_target)
    except Exception as exc:
        logger.debug("tsa anchor skipped: %s", exc)

    if git_result or tsa_result:
        record["method"] = "git+tsa" if git_result and tsa_result else ("git" if git_result else "tsa")
    if git_result:
        record["git"] = git_result
    if tsa_result:
        record["tsa"] = tsa_result

    path = anchor_dir / f"anchor-{witness_id}.json"
    path.write_text(json.dumps(record, indent=2, sort_keys=True), encoding="utf-8")
    latest = anchor_dir / "latest.json"
    latest.write_text(json.dumps(record, indent=2, sort_keys=True), encoding="utf-8")

    try:
        from app.db.engine import db_session
        from app.db.models import EvidenceAnchorRecord

        with db_session() as session:
            session.add(
                EvidenceAnchorRecord(
                    id=f"anchor-{witness_id}",
                    root_hash=root_hash,
                    seq=seq,
                    entry_count=entry_count,
                    witness_id=witness_id,
                    method=record["method"],
                    anchored_at=datetime.now(timezone.utc),
                    git_commit_sha=(git_result or {}).get("commitSha"),
                    git_url=(git_result or {}).get("url"),
                    tsa_token_b64=(tsa_result or {}).get("tokenB64"),
                    tsa_time=datetime.now(timezone.utc) if tsa_result else None,
                    merkle_root=merkle_root,
                )
            )
    except Exception as exc:
        logger.debug("anchor DB record skipped: %s", exc)

    logger.info("Anchored transparency root seq=%s witness=%s method=%s", seq, witness_id, record["method"])
    return record


def latest_anchor_for_root(root_hash: str) -> dict[str, Any] | None:
    """Return latest anchor if it matches the given root."""
    anchor_dir = _anchor_dir()
    latest = anchor_dir / "latest.json"
    if latest.is_file():
        try:
            record = json.loads(latest.read_text(encoding="utf-8"))
            if record.get("rootHash") == root_hash or record.get("merkleRoot") == root_hash:
                out: dict[str, Any] = {
                    "witnessId": record.get("witnessId"),
                    "anchoredAt": record.get("anchoredAt"),
                    "method": record.get("method"),
                }
                if record.get("git"):
                    out["git"] = record["git"]
                if record.get("tsa"):
                    out["tsa"] = record["tsa"]
                if record.get("merkleRoot"):
                    out["merkleRoot"] = record["merkleRoot"]
                return out
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
                .filter(
                    (EvidenceAnchorRecord.root_hash == root_hash)
                    | (EvidenceAnchorRecord.merkle_root == root_hash)
                )
                .order_by(EvidenceAnchorRecord.anchored_at.desc())
                .first()
            )
            if row is None:
                return None
            out: dict[str, Any] = {
                "witnessId": row.witness_id,
                "anchoredAt": row.anchored_at.isoformat() if row.anchored_at else None,
                "method": row.method,
            }
            if row.git_commit_sha:
                out["git"] = {"commitSha": row.git_commit_sha, "url": row.git_url}
            if row.tsa_token_b64:
                out["tsa"] = {"tokenB64": row.tsa_token_b64[:32] + "…", "tsaTime": row.tsa_time.isoformat() if row.tsa_time else None}
            if row.merkle_root:
                out["merkleRoot"] = row.merkle_root
            return out
    except Exception:
        return None


def maybe_anchor_on_milestone(
    *,
    seq: int,
    root_hash: str,
    entry_count: int,
    merkle_root: str | None = None,
) -> None:
    """Anchor periodically (every N entries or env-forced)."""
    force = os.getenv("QTANGL_ANCHOR_EVERY_ENTRY", "false").lower() in {"1", "true", "yes"}
    interval = int(os.getenv("QTANGL_ANCHOR_INTERVAL", "100"))
    if force or (seq > 0 and seq % interval == 0):
        anchor_log_root(root_hash, seq=seq, entry_count=entry_count, merkle_root=merkle_root)


def anchor_tick() -> dict[str, Any]:
    """Scheduled anchor + drift detection."""
    from app.pqc.transparency import current_root, detect_anchor_drift

    root = current_root()
    root_hash = str(root.get("rootHash") or "")
    merkle = str(root.get("merkleRoot") or root_hash)
    seq = int(root.get("seq") or 0)
    count = int(root.get("entryCount") or 0)
    if not root_hash or root_hash == "0" * 64:
        return {"status": "empty"}

    drift = detect_anchor_drift(root_hash=root_hash, merkle_root=merkle)
    if drift.get("drift"):
        _fire_anchor_drift_alert(drift)

    record = anchor_log_root(root_hash, seq=seq, entry_count=count, merkle_root=merkle)
    return {"status": "anchored", "drift": drift, "record": record}


def _fire_anchor_drift_alert(drift: dict[str, Any]) -> None:
    try:
        from app.notifications.webhook_store import notify_tenant_event

        notify_tenant_event(
            tenant_id=None,
            event="anchor.drift",
            payload=drift,
        )
    except Exception as exc:
        logger.warning("anchor drift alert failed: %s", exc)
