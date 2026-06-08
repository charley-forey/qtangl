"""Merkle tree over transparency log content hashes."""

from __future__ import annotations

import hashlib
from typing import Any


def _hash_pair(left: str, right: str) -> str:
    payload = f"{left}:{right}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _pad_layer(layer: list[str]) -> list[str]:
    if len(layer) % 2 == 1:
        return layer + [layer[-1]]
    return layer


def merkle_root(leaves: list[str]) -> str:
    if not leaves:
        return "0" * 64
    layer = list(leaves)
    while len(layer) > 1:
        layer = _pad_layer(layer)
        layer = [_hash_pair(layer[i], layer[i + 1]) for i in range(0, len(layer), 2)]
    return layer[0]


def merkle_path(leaves: list[str], index: int) -> list[dict[str, Any]]:
    if not leaves or index < 0 or index >= len(leaves):
        return []
    path: list[dict[str, Any]] = []
    layer = list(leaves)
    idx = index
    while len(layer) > 1:
        padded = _pad_layer(layer)
        sibling_idx = idx - 1 if idx % 2 == 1 else idx + 1
        if sibling_idx < len(padded):
            path.append(
                {
                    "hash": padded[sibling_idx],
                    "position": "left" if sibling_idx < idx else "right",
                }
            )
        next_layer: list[str] = []
        for i in range(0, len(padded), 2):
            next_layer.append(_hash_pair(padded[i], padded[i + 1]))
        idx //= 2
        layer = next_layer
    return path


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
