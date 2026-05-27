#!/usr/bin/env python3
"""Interactive helper to inspect editorial draft coverage."""

from __future__ import annotations

import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
DRAFTS_PATH = WORKSPACE / "web" / "lib" / "copy" / "library-editorial.drafts.json"
EDITORIAL_TS = WORKSPACE / "web" / "lib" / "copy" / "library-editorial.ts"


def main() -> int:
    drafts = json.loads(DRAFTS_PATH.read_text(encoding="utf-8"))
    editorial_text = EDITORIAL_TS.read_text(encoding="utf-8")
    print(f"Hand-written entries in library-editorial.ts")
    print(f"Draft entries: {len(drafts)}")
    print("\nSample drafts:")
    for slug in list(drafts.keys())[:10]:
        print(f"  - {slug}: {drafts[slug]['summary'][:80]}...")
    print("\nPromote by copying a draft block into library-editorial.ts and removing it from drafts JSON.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
