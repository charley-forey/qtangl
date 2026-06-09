#!/usr/bin/env python3
"""Monthly standards currency check — FIPS 203/204/205, CNSA 2.0 references."""

from __future__ import annotations

import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

REQUIRED_REFS = (
    "FIPS 203",
    "FIPS 204",
    "FIPS 205",
    "CNSA 2.0",
    "ML-KEM",
    "ML-DSA",
    "SLH-DSA",
)


def main() -> int:
    from app.pqc import standards

    text = Path(standards.__file__).read_text(encoding="utf-8")
    missing = [ref for ref in REQUIRED_REFS if ref not in text]
    if missing:
        print("FAIL: standards.py missing references:", ", ".join(missing))
        return 1
    print("OK: standards.py contains required PQC references")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
