"""Qtangl verify CLI — standalone package entrypoint."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from qtangl_verify.verify import verify_report


def _load_report(path: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if "report" in raw and isinstance(raw["report"], dict):
        report_json = dict(raw["report"])
    else:
        report_json = dict(raw)
    signature = report_json.pop("signature", {}) or {}
    return report_json, signature


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify Qtangl signed report offline")
    parser.add_argument("report", type=Path, help="Path to report JSON")
    parser.add_argument("--api-base", default="", help="API base URL for Merkle inclusion check")
    parser.add_argument("--published-root", default="", help="Expected Merkle root from external anchor")
    parser.add_argument("--json", action="store_true", help="Emit JSON result")
    args = parser.parse_args(argv)

    report_json, signature = _load_report(args.report)
    result = verify_report(
        report_json,
        signature,
        api_base=args.api_base or None,
        published_root=args.published_root or None,
    )

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        status = "VALID" if result.get("valid") else "INVALID"
        print(f"{status}: {result.get('reason') or 'signature verified'}")
        if result.get("logInclusion"):
            inc = result["logInclusion"]
            print(f"  log inclusion: {inc.get('included')} merkleValid={inc.get('merkleValid')}")

    return 0 if result.get("valid") else 1


if __name__ == "__main__":
    raise SystemExit(main())
