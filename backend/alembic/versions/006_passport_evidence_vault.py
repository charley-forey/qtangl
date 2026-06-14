"""Readiness passport fields, view audit, evidence vault, cloud integration metadata."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import add_column_if_absent, create_index_if_absent, create_table_if_absent

revision = "006_passport_evidence_vault"
down_revision = "005_cbom_aggregation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    add_column_if_absent("share_links", sa.Column("label", sa.String(255), server_default=""))
    add_column_if_absent("share_links", sa.Column("scope", sa.String(32), server_default="report"))
    add_column_if_absent("share_links", sa.Column("view_count", sa.Integer(), server_default="0"))

    create_table_if_absent(
        "share_link_views",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("link_id", sa.String(80), sa.ForeignKey("share_links.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("viewer_ip_hash", sa.String(64), server_default=""),
        sa.Column("user_agent", sa.String(512), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_index_if_absent("ix_share_link_views_link_id", "share_link_views", ["link_id"])

    create_table_if_absent(
        "evidence_vault_objects",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("scan_id", sa.String(80), nullable=False),
        sa.Column("object_type", sa.String(32), server_default="bundle"),
        sa.Column("storage_key", sa.String(512), server_default=""),
        sa.Column("content_hash", sa.String(64), server_default=""),
        sa.Column("retained_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_index_if_absent("ix_evidence_vault_tenant_scan", "evidence_vault_objects", ["tenant_id", "scan_id"])

    add_column_if_absent("tenant_integrations", sa.Column("status", sa.String(32), server_default="active"))
    add_column_if_absent("tenant_integrations", sa.Column("last_test_at", sa.DateTime(timezone=True), nullable=True))
    add_column_if_absent("tenant_integrations", sa.Column("last_pull_at", sa.DateTime(timezone=True), nullable=True))
    add_column_if_absent("tenant_integrations", sa.Column("last_pull_status", sa.String(32), nullable=True))


def downgrade() -> None:
    op.drop_column("tenant_integrations", "last_pull_status")
    op.drop_column("tenant_integrations", "last_test_at")
    op.drop_column("tenant_integrations", "last_pull_at")
    op.drop_column("tenant_integrations", "status")
    op.drop_index("ix_evidence_vault_tenant_scan", table_name="evidence_vault_objects")
    op.drop_table("evidence_vault_objects")
    op.drop_index("ix_share_link_views_link_id", table_name="share_link_views")
    op.drop_table("share_link_views")
    op.drop_column("share_links", "view_count")
    op.drop_column("share_links", "scope")
    op.drop_column("share_links", "label")
