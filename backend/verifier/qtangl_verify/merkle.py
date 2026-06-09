"""Merkle inclusion path verification (transparency log)."""

from __future__ import annotations

import hashlib
from typing import Any


def _hash_pair(left: str, right: str) -> str:
    return hashlib.sha256(f"{left}:{right}".encode("utf-8")).hexdigest()


def verify_merkle_path(*, leaf: str, audit_path: list[dict[str, Any]], root: str) -> bool:
    current = leaf
    for step in audit_path:
        sibling = str(step.get("hash") or "")
        position = step.get("position", "right")
        if position == "left":
            current = _hash_pair(sibling, current)
        else:
            current = _hash_pair(current, sibling)
    return current == root
