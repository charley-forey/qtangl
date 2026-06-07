"""CBOM aggregation tables."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "005_cbom_aggregation"
down_revision = "004_evidence_layer"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cbom_sources",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("source_type", sa.String(32), server_default="third-party"),
        sa.Column("label", sa.String(255), server_default=""),
        sa.Column("status", sa.String(32), server_default="active"),
        sa.Column("last_ingested_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_cbom_sources_tenant_id", "cbom_sources", ["tenant_id"])

    op.create_table(
        "cbom_ingest_jobs",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("source_id", sa.String(80), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("format", sa.String(16), server_default="cdx16"),
        sa.Column("component_count", sa.Integer(), server_default="0"),
        sa.Column("status", sa.String(32), server_default="completed"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("tenant_id", "source_id", "content_hash", name="uq_cbom_ingest_idempotent"),
    )
    op.create_index("ix_cbom_ingest_jobs_tenant_id", "cbom_ingest_jobs", ["tenant_id"])
    op.create_index("ix_cbom_ingest_jobs_source_id", "cbom_ingest_jobs", ["source_id"])

    op.create_table(
        "cbom_components",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("component_key", sa.String(64), nullable=False),
        sa.Column("bom_ref", sa.String(255), server_default=""),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("component_type", sa.String(64), server_default="cryptographic-asset"),
        sa.Column("algorithm", sa.String(128), server_default=""),
        sa.Column("key_size", sa.Integer(), nullable=True),
        sa.Column("location", sa.String(512), server_default=""),
        sa.Column("host", sa.String(255), server_default=""),
        sa.Column("kind", sa.String(32), server_default="imported"),
        sa.Column("vulnerability_status", sa.String(32), server_default="unknown"),
        sa.Column("severity", sa.String(16), server_default="info"),
        sa.Column("pqc_replacement", sa.String(255), server_default=""),
        sa.Column("verification_status", sa.String(32), server_default="unverified-source"),
        sa.Column("provenance_json", sa.Text(), server_default="{}"),
        sa.Column("source_id", sa.String(80), nullable=False),
        sa.Column("ingest_job_id", sa.String(80), nullable=False),
        sa.Column("component_json", sa.Text(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_cbom_components_tenant_id", "cbom_components", ["tenant_id"])
    op.create_index("ix_cbom_components_component_key", "cbom_components", ["component_key"])
    op.create_index("ix_cbom_components_tenant_key", "cbom_components", ["tenant_id", "component_key"])

    op.create_table(
        "cbom_merge_conflicts",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("component_key", sa.String(64), nullable=False),
        sa.Column("field", sa.String(64), nullable=False),
        sa.Column("value_a", sa.Text(), server_default=""),
        sa.Column("value_b", sa.Text(), server_default=""),
        sa.Column("source_a", sa.String(80), server_default=""),
        sa.Column("source_b", sa.String(80), server_default=""),
        sa.Column("resolved_value", sa.Text(), nullable=True),
        sa.Column("status", sa.String(16), server_default="open"),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_cbom_merge_conflicts_tenant_id", "cbom_merge_conflicts", ["tenant_id"])
    op.create_index("ix_cbom_conflicts_tenant_status", "cbom_merge_conflicts", ["tenant_id", "status"])


def downgrade() -> None:
    op.drop_index("ix_cbom_conflicts_tenant_status", table_name="cbom_merge_conflicts")
    op.drop_index("ix_cbom_merge_conflicts_tenant_id", table_name="cbom_merge_conflicts")
    op.drop_table("cbom_merge_conflicts")
    op.drop_index("ix_cbom_components_tenant_key", table_name="cbom_components")
    op.drop_index("ix_cbom_components_component_key", table_name="cbom_components")
    op.drop_index("ix_cbom_components_tenant_id", table_name="cbom_components")
    op.drop_table("cbom_components")
    op.drop_index("ix_cbom_ingest_jobs_source_id", table_name="cbom_ingest_jobs")
    op.drop_index("ix_cbom_ingest_jobs_tenant_id", table_name="cbom_ingest_jobs")
    op.drop_table("cbom_ingest_jobs")
    op.drop_index("ix_cbom_sources_tenant_id", table_name="cbom_sources")
    op.drop_table("cbom_sources")
