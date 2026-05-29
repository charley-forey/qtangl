"""Regenerate PQC fixture inventory from templates."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "demos" / "pqc_migration" / "data"
FIXTURES = ROOT / "backend" / "app" / "pqc" / "fixtures"


def main() -> None:
    inventory = json.loads((DATA / "inventory.json").read_text(encoding="utf-8"))
    print(f"Loaded {len(inventory)} inventory assets from {DATA}")
    FIXTURES.mkdir(parents=True, exist_ok=True)
    (FIXTURES / "inventory.json").write_text(json.dumps(inventory, indent=2), encoding="utf-8")
    print(f"Wrote {FIXTURES / 'inventory.json'}")


if __name__ == "__main__":
    main()
