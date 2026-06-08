"""Tests for log reconstruction against anchors."""

from __future__ import annotations

from app.pqc.transparency import detect_anchor_drift


def test_no_drift_without_witness():
    result = detect_anchor_drift(root_hash="a" * 64, merkle_root="b" * 64)
    assert result.get("drift") is False
