"""Capture or refresh handshake_trace.json fixture."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from app.pqc.handshake import prove_handshake
from app.pqc.serialize import serialize_handshake

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "demos" / "pqc_migration" / "data" / "handshake_trace.json"


def main() -> None:
    proof = prove_handshake(use_fixture=False)
    payload = serialize_handshake(proof)
    payload["capturedAt"] = datetime.now(timezone.utc).isoformat()
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote handshake trace to {OUT}")


if __name__ == "__main__":
    main()
