"""Agent certificates and fleet enrollment nonce for discovery mTLS."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import add_column_if_absent, create_index_if_absent, create_table_if_absent

revision = "012_agent_certs"
down_revision = "011_discovery_depth"
branch_labels = None
depends_on = None


def upgrade() -> None:
    add_column_if_absent(
        "discovery_fleets",
        sa.Column("enrollment_nonce", sa.String(64), nullable=False, server_default=""),
    )
    create_table_if_absent(
        "agent_certificates",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("agent_id", sa.String(80), sa.ForeignKey("host_agents.id"), nullable=False, index=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("serial", sa.String(64), nullable=False, index=True),
        sa.Column("fingerprint", sa.String(128), nullable=False, index=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_index_if_absent("ix_agent_certs_tenant_agent", "agent_certificates", ["tenant_id", "agent_id"])


def downgrade() -> None:
    op.drop_index("ix_agent_certs_tenant_agent", table_name="agent_certificates")
    op.drop_table("agent_certificates")
    op.drop_column("discovery_fleets", "enrollment_nonce")
