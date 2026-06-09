#!/usr/bin/env python3
"""Cross-check DB transparency log against Git + TSA anchors and hash chain."""

from __future__ import annotations

import argparse
import sys


def _validate_hash_chain() -> dict:
    from app.db.engine import db_session
    from app.db.models import EvidenceLogEntry
    from app.pqc.transparency import _entry_hash

    with db_session() as session:
        rows = session.query(EvidenceLogEntry).order_by(EvidenceLogEntry.seq.asc()).all()
        prev = "0" * 64
        for row in rows:
            expected = _entry_hash(prev, row.content_hash, row.seq)
            if expected != row.entry_hash:
                return {"valid": False, "breakSeq": row.seq, "expected": expected, "actual": row.entry_hash}
            prev = row.entry_hash
        return {"valid": True, "entryCount": len(rows), "lastHash": prev}


def main() -> int:
    parser = argparse.ArgumentParser(description="Reconstruct and validate evidence log")
    parser.parse_args()

    from app.pqc.transparency import current_root, detect_anchor_drift

    chain = _validate_hash_chain()
    if not chain.get("valid"):
        print(f"CHAIN BREAK at seq {chain.get('breakSeq')}", file=sys.stderr)
        return 1

    root = current_root()
    drift = detect_anchor_drift(
        root_hash=str(root.get("rootHash") or ""),
        merkle_root=str(root.get("merkleRoot") or ""),
    )
    if drift.get("drift"):
        print(f"DRIFT DETECTED: {drift}", file=sys.stderr)
        return 1
    print(f"OK seq={root.get('seq')} entries={root.get('entryCount')} chain={chain.get('entryCount')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
