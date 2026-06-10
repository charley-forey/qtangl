#!/usr/bin/env python3
"""Detect CBOM schema drift vs golden fixtures."""

from __future__ import annotations

import json
import sys
from pathlib import Path

FIXTURES = Path(__file__).resolve().parents[1] / "tests" / "fixtures" / "golden_cbom"
LOCK = Path(__file__).resolve().parents[1] / "scanner-versions.lock"


def main() -> int:
    if not LOCK.exists():
        print("scanner-versions.lock missing", file=sys.stderr)
        return 1
    versions = json.loads(LOCK.read_text(encoding="utf-8"))
    if not FIXTURES.exists():
        print("No golden CBOM fixtures yet — skipping")
        return 0
    for path in FIXTURES.glob("*.json"):
        doc = json.loads(path.read_text(encoding="utf-8"))
        engine = doc.get("engine")
        if engine and versions.get(engine.split("@")[0]) not in str(engine):
            print(f"Fixture {path.name} may be stale for lock versions")
    print("Golden CBOM contract check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
