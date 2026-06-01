"""Alembic migration 003 — enable Postgres RLS policies."""

from __future__ import annotations

from alembic import op

revision = "003_row_level_security"
down_revision = "002_enterprise_hardening"
branch_labels = None
depends_on = None


def upgrade() -> None:
    from app.db.engine import get_engine
    from app.db.rls import apply_row_level_security

    engine = get_engine()
    if engine is None:
        bind = op.get_bind()
        from sqlalchemy import create_engine

        engine = create_engine(bind.url)
    apply_row_level_security(engine)


def downgrade() -> None:
    pass
