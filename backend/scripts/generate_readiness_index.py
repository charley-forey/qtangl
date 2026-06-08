#!/usr/bin/env python3
"""Generate anonymized Readiness Index annual report artifact."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Readiness Index report")
    parser.add_argument("--output", type=Path, default=Path("docs/readiness-index/latest.json"))
    parser.add_argument("--industry", default="financial")
    args = parser.parse_args()

    from app.data.benchmarks import readiness_index_snapshot

    snapshot = readiness_index_snapshot(industry=args.industry)
    report = {
        "title": "Qtangl Quantum Readiness Index",
        "year": "2026",
        "industry": args.industry,
        "snapshot": snapshot,
        "disclaimer": "Anonymized aggregate from opted-in tenants. Not attestation.",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
