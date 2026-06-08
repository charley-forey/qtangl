#!/usr/bin/env python3
"""Offline Qtangl report verifier — recompute hash, verify signature(s), Merkle inclusion."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def _load_report(path: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if "report" in raw and isinstance(raw["report"], dict):
        report_json = dict(raw["report"])
    else:
        report_json = dict(raw)
    signature = report_json.pop("signature", {}) or {}
    return report_json, signature


def _fetch_json(url: str) -> dict[str, Any]:
    req = Request(url, headers={"Accept": "application/json"})
    with urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def verify_offline(
    report_json: dict[str, Any],
    signature: dict[str, Any],
    *,
    api_base: str | None = None,
    published_root: str | None = None,
) -> dict[str, Any]:
    from app.pqc.signing import verify_report_signature

    result = verify_report_signature(report_json, signature)
    content_hash = result.get("contentHash") or signature.get("contentHash")

    inclusion: dict[str, Any] | None = None
    if api_base and content_hash:
        try:
            payload = _fetch_json(f"{api_base.rstrip('/')}/pqc/transparency/{content_hash}")
            inclusion = payload.get("inclusion")
        except (HTTPError, URLError, TimeoutError) as exc:
            inclusion = {"included": False, "reason": str(exc)}

    if inclusion:
        merkle_root = inclusion.get("merkleRoot")
        audit_path = inclusion.get("auditPath") or []
        leaf = inclusion.get("contentHash") or content_hash
        if merkle_root and audit_path and leaf:
            from app.pqc.merkle import verify_merkle_path

            inclusion["merkleValid"] = verify_merkle_path(
                leaf=str(leaf),
                audit_path=audit_path,
                root=str(merkle_root),
            )

    if inclusion and published_root:
        root_hash = inclusion.get("merkleRoot") or inclusion.get("rootHash") or inclusion.get("entryHash")
        if root_hash and root_hash != published_root:
            inclusion["rootMatch"] = False
            result["valid"] = False
            result["reason"] = "Log root mismatch vs published anchor"
        else:
            inclusion["rootMatch"] = True

    if inclusion:
        result["logInclusion"] = inclusion

    try:
        from app.telemetry.events import track_event

        track_event("verify_cli_ping", properties={"valid": result.get("valid")})
    except Exception:
        pass

    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify a Qtangl signed report offline.")
    parser.add_argument("report", type=Path, help="Path to report JSON file")
    parser.add_argument(
        "--api-base",
        default=None,
        help="Qtangl API base URL for transparency log inclusion check",
    )
    parser.add_argument(
        "--published-root",
        default=None,
        help="Expected Merkle or log root hash from published anchor",
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON result only")
    args = parser.parse_args(argv)

    if not args.report.is_file():
        print(f"Report not found: {args.report}", file=sys.stderr)
        return 2

    report_json, signature = _load_report(args.report)
    result = verify_offline(
        report_json,
        signature,
        api_base=args.api_base,
        published_root=args.published_root,
    )

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        valid = result.get("valid")
        print(f"Valid: {valid}")
        print(f"Verify spec: {result.get('verifySpecVersion', '—')}")
        print(f"Primary algorithm: {result.get('alg', '—')}")
        print(f"Content hash: {result.get('contentHash', '—')}")
        per_sig = result.get("perSignature") or []
        if len(per_sig) > 1:
            for sig in per_sig:
                print(f"  - {sig.get('alg')}: {'ok' if sig.get('valid') else sig.get('reason')}")
        if result.get("logInclusion"):
            inc = result["logInclusion"]
            print(f"Log inclusion: seq={inc.get('seq')} merkleRoot={inc.get('merkleRoot', '—')}")
            if inc.get("merkleValid") is not None:
                print(f"Merkle path valid: {inc.get('merkleValid')}")
        if not valid:
            print(f"Reason: {result.get('reason', 'unknown')}")

    return 0 if result.get("valid") else 1


if __name__ == "__main__":
    sys.exit(main())
