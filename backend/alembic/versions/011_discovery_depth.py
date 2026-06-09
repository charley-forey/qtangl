"""Discovery depth: fleets, agents, findings, code/image targets, discovery jobs."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "011_discovery_depth"
down_revision = "010_onboarding_key_tokens"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "discovery_fleets",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("enrollment_token_hash", sa.String(128), nullable=False, index=True),
        sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("token_max_uses", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("token_uses", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("policy_json", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "host_agents",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("fleet_id", sa.String(80), sa.ForeignKey("discovery_fleets.id"), nullable=False, index=True),
        sa.Column("hostname", sa.String(255), nullable=False),
        sa.Column("os", sa.String(16), nullable=False, server_default="linux"),
        sa.Column("sensor_version", sa.String(32), nullable=False, server_default="0.1.0"),
        sa.Column("status", sa.String(16), nullable=False, server_default="online"),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True, index=True),
        sa.Column("last_scan_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("findings_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_host_agents_tenant_fleet", "host_agents", ["tenant_id", "fleet_id"])
    op.create_table(
        "host_findings",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("agent_id", sa.String(80), sa.ForeignKey("host_agents.id"), nullable=False, index=True),
        sa.Column("finding_id", sa.String(128), nullable=False),
        sa.Column("finding_type", sa.String(32), nullable=False, server_default="certificate"),
        sa.Column("component_key", sa.String(64), nullable=True, index=True),
        sa.Column("raw_json", sa.Text(), nullable=False),
        sa.Column("ingested_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("tenant_id", "finding_id", name="uq_host_findings_tenant_finding"),
    )
    op.create_table(
        "code_scan_targets",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("provider", sa.String(32), nullable=False, server_default="github"),
        sa.Column("owner", sa.String(255), nullable=False),
        sa.Column("repo", sa.String(255), nullable=False),
        sa.Column("default_ref", sa.String(128), nullable=False, server_default="HEAD"),
        sa.Column("integration_id", sa.String(80), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_scan_job_id", sa.String(80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "image_scan_targets",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("registry", sa.String(32), nullable=False, server_default="ecr"),
        sa.Column("image_ref", sa.String(512), nullable=False),
        sa.Column("integration_id", sa.String(80), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_scan_job_id", sa.String(80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "discovery_jobs",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("job_type", sa.String(32), nullable=False, index=True),
        sa.Column("status", sa.String(16), nullable=False, server_default="running"),
        sa.Column("target_id", sa.String(80), nullable=True),
        sa.Column("payload_json", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("result_json", sa.Text(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("timeline_json", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_discovery_jobs_tenant_status", "discovery_jobs", ["tenant_id", "status"])


def downgrade() -> None:
    op.drop_table("discovery_jobs")
    op.drop_table("image_scan_targets")
    op.drop_table("code_scan_targets")
    op.drop_table("host_findings")
    op.drop_table("host_agents")
    op.drop_table("discovery_fleets")
