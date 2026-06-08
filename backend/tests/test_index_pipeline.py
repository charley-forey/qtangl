"""Tests for Readiness Index pipeline — k-anonymity and no PII."""

from __future__ import annotations

from app.data.index_pipeline import aggregate_cohort, run_index_pipeline


def test_cohort_below_threshold_not_published(monkeypatch):
    monkeypatch.setenv("QTANGL_INDEX_MIN_COHORT", "10")
    scores = [float(i) for i in range(5)]
    assert aggregate_cohort(industry="financial", scores=scores) is None


def test_cohort_at_threshold_published(monkeypatch):
    monkeypatch.setenv("QTANGL_INDEX_MIN_COHORT", "10")
    scores = [float(i) for i in range(10)]
    agg = aggregate_cohort(industry="financial", scores=scores)
    assert agg is not None
    assert agg["sampleSize"] == 10
    assert "tenant" not in str(agg).lower()
    assert "email" not in str(agg).lower()


def test_pipeline_disabled(monkeypatch):
    monkeypatch.setenv("QTANGL_INDEX_ENABLED", "false")
    result = run_index_pipeline()
    assert result["status"] == "disabled"
