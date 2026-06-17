"""Persisted tenant alerts for dashboard notification inbox."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import create_index_if_absent, create_table_if_absent

revision = "017_tenant_alerts"
down_revision = "016_dashboard_auth_workos"
branch_labels = None
depends_on = None


def upgrade() -> None:
    create_table_if_absent(
        "tenant_alerts",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("rule", sa.String(64), nullable=False),
        sa.Column("severity", sa.String(16), nullable=False, server_default="info"),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("source", sa.String(32), nullable=False, server_default="scan"),
        sa.Column("payload_json", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("fired_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
    )
    create_index_if_absent("ix_tenant_alerts_tenant_id", "tenant_alerts", ["tenant_id"])
    create_index_if_absent("ix_tenant_alerts_tenant_fired", "tenant_alerts", ["tenant_id", "fired_at"])


def downgrade() -> None:
    op.drop_index("ix_tenant_alerts_tenant_fired", table_name="tenant_alerts")
    op.drop_index("ix_tenant_alerts_tenant_id", table_name="tenant_alerts")
    op.drop_table("tenant_alerts")
