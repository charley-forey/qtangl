"""Tests for Merkle inclusion proofs."""

from __future__ import annotations

from app.pqc.merkle import merkle_path, merkle_root, verify_merkle_path


def test_merkle_root_and_path_roundtrip():
    leaves = [f"{i:064x}" for i in range(1, 8)]
    root = merkle_root(leaves)
    assert len(root) == 64
    for idx in range(len(leaves)):
        path = merkle_path(leaves, idx)
        assert verify_merkle_path(leaf=leaves[idx], audit_path=path, root=root)


def test_empty_merkle_root():
    assert merkle_root([]) == "0" * 64
