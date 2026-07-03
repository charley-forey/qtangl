"""Command Center Next Wave tables — comments, saved views, war rooms."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import create_table_if_absent

revision = "020_command_center_next_wave"
down_revision = "019_scan_job_provenance"
branch_labels = None
depends_on = None


def upgrade() -> None:
    create_table_if_absent(
        "finding_comments",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("finding_id", sa.String(80), nullable=False, index=True),
        sa.Column("scan_id", sa.String(80), nullable=True),
        sa.Column("author", sa.String(255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("mentions_json", sa.Text(), server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_table_if_absent(
        "saved_views",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("user_id", sa.String(64), nullable=True, index=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("persona", sa.String(32), nullable=True),
        sa.Column("filters_json", sa.Text(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_table_if_absent(
        "war_rooms",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("status", sa.String(16), server_default="active"),
        sa.Column("alert_ids_json", sa.Text(), server_default="[]"),
        sa.Column("assignees_json", sa.Text(), server_default="[]"),
        sa.Column("share_token", sa.String(64), nullable=True, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("war_rooms")
    op.drop_table("saved_views")
    op.drop_table("finding_comments")
