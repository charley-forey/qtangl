"""Tests for transparency consistency proofs."""

from __future__ import annotations

from app.pqc.transparency import _entry_hash, consistency_proof


def test_consistency_invalid_range():
    assert consistency_proof(from_seq=5, to_seq=2) is None
