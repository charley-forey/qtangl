"""Export OpenAPI JSON from FastAPI app for CI and static hosting."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.main import app  # noqa: E402


def main() -> None:
    out_web = ROOT.parent / "web" / "public" / "openapi.json"
    out_backend = ROOT / "docs" / "openapi.json"
    payload = app.openapi()
    text = json.dumps(payload, indent=2) + "\n"
    out_web.parent.mkdir(parents=True, exist_ok=True)
    out_web.write_text(text, encoding="utf-8")
    out_backend.parent.mkdir(parents=True, exist_ok=True)
    out_backend.write_text(text, encoding="utf-8")
    print(f"Wrote {out_web} and {out_backend} ({len(payload.get('paths', {}))} paths)")


if __name__ == "__main__":
    main()
