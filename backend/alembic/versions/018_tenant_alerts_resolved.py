"""Add resolved_at lifecycle columns to tenant_alerts."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import add_column_if_absent

revision = "018_tenant_alerts_resolved"
down_revision = "017_tenant_alerts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    add_column_if_absent("tenant_alerts", sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True))
    add_column_if_absent("tenant_alerts", sa.Column("resolved_by", sa.String(80), nullable=True))
    add_column_if_absent("tenant_alerts", sa.Column("resolution", sa.String(32), nullable=True))


def downgrade() -> None:
    op.drop_column("tenant_alerts", "resolution")
    op.drop_column("tenant_alerts", "resolved_by")
    op.drop_column("tenant_alerts", "resolved_at")
