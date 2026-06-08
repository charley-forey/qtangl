"""Tests for coverage-confidence scoring."""

from __future__ import annotations

from app.cbom.coverage import compute_coverage_confidence


def test_high_verified_share_scores_higher():
    components = [
        {"verified": True, "sourceType": "live_scan"},
        {"verified": True, "sourceType": "cloud_pull"},
    ]
    sources = [{"sourceType": "live_scan"}, {"sourceType": "cloud_pull"}]
    result = compute_coverage_confidence(components=components, sources=sources)
    assert result["score"] >= 50
    assert result["band"] in {"high", "moderate"}


def test_unverified_sources_penalized():
    components = [
        {"verificationStatus": "unverified-source", "sourceType": "third-party"},
    ] * 5
    result = compute_coverage_confidence(components=components, sources=[])
    assert result["unverifiedCount"] == 5
    assert result["score"] < 50
