"""Fail CI when committed OpenAPI / Postman artifacts drift from FastAPI export."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent

sys.path.insert(0, str(ROOT))

from scripts.export_openapi import export_artifacts  # noqa: E402


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def main() -> None:
    openapi_text, postman_text = export_artifacts(dry_run=True)

    targets = [
        (REPO / "backend" / "docs" / "openapi.json", openapi_text),
        (REPO / "web" / "public" / "openapi.json", openapi_text),
        (REPO / "web" / "public" / "postman" / "qtangl-api.json", postman_text),
    ]

    drift: list[str] = []
    for path, expected in targets:
        if not path.exists():
            drift.append(f"missing {path.relative_to(REPO)}")
            continue
        actual = _read(path)
        if actual != expected:
            drift.append(f"drift {path.relative_to(REPO)}")

    if drift:
        print("OpenAPI artifacts are out of sync with FastAPI export.", file=sys.stderr)
        for item in drift:
            print(f"  - {item}", file=sys.stderr)
        print("Run: cd backend && python scripts/export_openapi.py", file=sys.stderr)
        raise SystemExit(1)

    payload = json.loads(openapi_text)
    print(f"OpenAPI sync OK ({len(payload.get('paths', {}))} paths).")


if __name__ == "__main__":
    main()
