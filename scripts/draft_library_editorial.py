#!/usr/bin/env python3
"""Generate editorial drafts for library entries missing hand-written coverage."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
ENTRIES_DIR = WORKSPACE / "web" / "content" / "library" / "entries"
EDITORIAL_TS = WORKSPACE / "web" / "lib" / "copy" / "library-editorial.ts"
DRAFTS_PATH = WORKSPACE / "web" / "lib" / "copy" / "library-editorial.drafts.json"


def load_existing_slugs() -> set[str]:
    text = EDITORIAL_TS.read_text(encoding="utf-8")
    return set(re.findall(r'"([a-z0-9-]+)":\s*\{', text))


def build_draft(entry: dict) -> dict:
    title = entry["title"]
    owner = entry["owner"]
    category = entry["category"]["title"]
    summary = entry.get("summary") or entry.get("description") or f"{title} is an open-source quantum project."
    backends = entry.get("supportedBackendSlugs") or []
    backend_note = (
        f" It commonly appears alongside {', '.join(backends[:3])} in example workflows."
        if backends
        else ""
    )

    return {
        "summary": summary,
        "description": entry.get("description") or summary,
        "whatItIs": [
            f"{title} is maintained by {owner} and sits in the {category} lane of the open-source quantum map.",
            f"{summary}{backend_note}",
        ],
        "whoItsFor": entry.get("whoItsFor")
        or f"Teams evaluating {category.lower()} tooling for research, prototyping, or integration planning.",
        "whatYouCanBuild": entry.get("whatYouCanBuild")
        or [
            f"Understand how {title} frames its core abstractions and workflow boundaries.",
            "Compare this project against nearby tools in the same category.",
            "Decide whether it belongs in a shortlist for a hybrid or classical-first stack.",
        ],
        "lastVerifiedAt": datetime.now(timezone.utc).date().isoformat(),
        "verifiedBy": "Qtangl generator",
    }


def main() -> int:
    existing = load_existing_slugs()
    drafts: dict[str, dict] = {}

    if DRAFTS_PATH.exists():
        drafts = json.loads(DRAFTS_PATH.read_text(encoding="utf-8"))

    for path in sorted(ENTRIES_DIR.glob("*.json")):
        entry = json.loads(path.read_text(encoding="utf-8"))
        slug = entry["slug"]
        if slug in existing:
            continue
        drafts[slug] = build_draft(entry)

    DRAFTS_PATH.write_text(json.dumps(drafts, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(drafts)} drafts to {DRAFTS_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
