#!/usr/bin/env python3
"""Fetch public dogfood auditor bundle JSON for SOC/board packages."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=os.environ.get("QTANGL_API_BASE_URL", "https://api.qtangl.com"))
    parser.add_argument("--out", default="dogfood-auditor-bundle.json")
    args = parser.parse_args()

    url = f"{args.base_url.rstrip('/')}/pqc/dogfood/auditor-bundle"
    try:
        with urllib.request.urlopen(url, timeout=60) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        print(f"Failed to fetch auditor bundle: {exc}", file=sys.stderr)
        return 1

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)
    print(f"Wrote {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
