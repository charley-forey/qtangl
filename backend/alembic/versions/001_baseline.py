"""Baseline schema — all tables from SQLAlchemy models."""

from __future__ import annotations

from alembic import op

revision = "001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    from app.db.base import Base
    import app.db.models  # noqa: F401

    bind = op.get_bind()
    Base.metadata.create_all(bind)


def downgrade() -> None:
    from app.db.base import Base
    import app.db.models  # noqa: F401

    bind = op.get_bind()
    Base.metadata.drop_all(bind)
