"""Baseline schema — use on fresh DBs; existing DBs rely on create_all + patches.

Revision ID: 001_baseline
"""

from __future__ import annotations

revision = "001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Fresh installs: app.db.engine init_db() calls create_all.
    # Generate autogenerate revision when schema stabilizes:
    #   alembic revision --autogenerate -m "describe change"
    pass


def downgrade() -> None:
    pass
