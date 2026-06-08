"""Tests for witness co-signature submission."""

from __future__ import annotations


def test_witness_model_fields():
    from app.db.models import WitnessCosignature

    assert WitnessCosignature.__tablename__ == "witness_cosignatures"
