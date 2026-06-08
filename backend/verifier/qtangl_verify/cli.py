"""Qtangl verify CLI package entrypoint."""

from __future__ import annotations

import sys
from pathlib import Path

# Reuse backend script implementation
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))


def main() -> int:
    from scripts.qtangl_verify import main as verify_main

    return verify_main()


if __name__ == "__main__":
    raise SystemExit(main())
