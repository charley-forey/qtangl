"""Shared pytest hooks for backend tests."""

from __future__ import annotations

import os

import pytest


@pytest.fixture(scope="session", autouse=True)
def _ensure_ci_database_schema() -> None:
    """Create tables when DATABASE_URL is set (CI uses sqlite:///./ci_test.db)."""
    if not (os.getenv("DATABASE_URL") or os.getenv("QTANGL_DATABASE_URL")):
        return
    from app.db.engine import init_db

    init_db()
