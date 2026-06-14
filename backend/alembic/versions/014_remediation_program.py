"""Remediation program backlog and verification proofs."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import add_column_if_absent, create_index_if_absent, create_table_if_absent

revision = "014_remediation_program"
down_revision = "013_drift_snapshots"
branch_labels = None
depends_on = None


def upgrade() -> None:
    create_table_if_absent(
        "remediation_program_items",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("source_type", sa.String(32), nullable=False),
        sa.Column("source_ref", sa.String(128), nullable=False),
        sa.Column("scan_id", sa.String(80), nullable=True),
        sa.Column("remediation_id", sa.String(80), nullable=True),
        sa.Column("asset_id", sa.String(80), nullable=True),
        sa.Column("title", sa.String(512), nullable=False, server_default=""),
        sa.Column("status", sa.String(32), nullable=False, server_default="open"),
        sa.Column("owner", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("target_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verify_job_id", sa.String(80), nullable=True),
        sa.Column("external_sync_id", sa.String(80), nullable=True),
        sa.Column("deep_link", sa.String(512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_index_if_absent(
        "ix_remediation_program_tenant_status",
        "remediation_program_items",
        ["tenant_id", "status"],
    )
    create_index_if_absent(
        "ix_remediation_program_tenant_source",
        "remediation_program_items",
        ["tenant_id", "source_type", "source_ref"],
        unique=True,
    )
    create_table_if_absent(
        "verification_proofs",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("program_item_id", sa.String(80), sa.ForeignKey("remediation_program_items.id"), nullable=False),
        sa.Column("verify_job_id", sa.String(80), nullable=True),
        sa.Column("verify_scan_id", sa.String(80), nullable=True),
        sa.Column("evidence_hash", sa.String(64), nullable=False, server_default=""),
        sa.Column("verify_url", sa.String(512), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    add_column_if_absent(
        "remediation_external_sync",
        sa.Column("program_item_id", sa.String(80), nullable=True),
    )
    add_column_if_absent(
        "remediation_external_sync",
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=True),
    )
    add_column_if_absent(
        "remediation_external_sync",
        sa.Column("sync_error", sa.Text(), nullable=True),
    )
    add_column_if_absent(
        "remediation_external_sync",
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("remediation_external_sync", "retry_count")
    op.drop_column("remediation_external_sync", "sync_error")
    op.drop_column("remediation_external_sync", "synced_at")
    op.drop_column("remediation_external_sync", "program_item_id")
    op.drop_table("verification_proofs")
    op.drop_index("ix_remediation_program_tenant_source", table_name="remediation_program_items")
    op.drop_index("ix_remediation_program_tenant_status", table_name="remediation_program_items")
    op.drop_table("remediation_program_items")
