#!/usr/bin/env python3
"""CI gate: scanner-versions.lock must be valid JSON with required engine keys."""

from __future__ import annotations

import json
import sys
from pathlib import Path

LOCK = Path(__file__).resolve().parents[1] / "scanner-versions.lock"
REQUIRED = ("cryptoscan", "cryptodeps", "theia")


def main() -> int:
    if not LOCK.exists():
        print(f"Missing {LOCK}")
        return 1
    data = json.loads(LOCK.read_text(encoding="utf-8"))
    missing = [k for k in REQUIRED if k not in data]
    if missing:
        print(f"scanner-versions.lock missing keys: {missing}")
        return 1
    for key, version in data.items():
        if not str(version).strip():
            print(f"Empty version for {key}")
            return 1
    print(f"scanner-versions.lock OK ({len(data)} engines)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
