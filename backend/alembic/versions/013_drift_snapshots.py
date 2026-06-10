"""Drift snapshots and schedule drift linkage."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "013_drift_snapshots"
down_revision = "012_agent_certs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "drift_snapshots",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("source_type", sa.String(32), nullable=False),
        sa.Column("scope_key", sa.String(512), nullable=False),
        sa.Column("snapshot_hash", sa.String(64), nullable=False),
        sa.Column("payload_json", sa.Text(), nullable=False),
        sa.Column("job_id", sa.String(80), nullable=True),
        sa.Column("scan_id", sa.String(80), nullable=True),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(
        "ix_drift_snapshots_tenant_source_scope",
        "drift_snapshots",
        ["tenant_id", "source_type", "scope_key", "captured_at"],
    )
    op.create_index("ix_drift_snapshots_tenant_captured", "drift_snapshots", ["tenant_id", "captured_at"])
    op.add_column(
        "scheduled_scans",
        sa.Column("last_drift_snapshot_id", sa.String(80), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("scheduled_scans", "last_drift_snapshot_id")
    op.drop_index("ix_drift_snapshots_tenant_captured", table_name="drift_snapshots")
    op.drop_index("ix_drift_snapshots_tenant_source_scope", table_name="drift_snapshots")
    op.drop_table("drift_snapshots")
