#!/usr/bin/env python3
"""Cross-check DB transparency log against Git + TSA anchors."""

from __future__ import annotations

import argparse
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description="Reconstruct and validate evidence log")
    args = parser.parse_args()

    from app.pqc.transparency import current_root, detect_anchor_drift

    root = current_root()
    drift = detect_anchor_drift(
        root_hash=str(root.get("rootHash") or ""),
        merkle_root=str(root.get("merkleRoot") or ""),
    )
    if drift.get("drift"):
        print(f"DRIFT DETECTED: {drift}", file=sys.stderr)
        return 1
    print(f"OK seq={root.get('seq')} entries={root.get('entryCount')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
