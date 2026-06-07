"""Cloud pull schedules and onboarding drip leads."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "007_cloud_pull_drip"
down_revision = "006_passport_evidence_vault"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "scheduled_scans",
        sa.Column("job_type", sa.String(32), server_default="scan", nullable=False),
    )
    op.add_column(
        "scheduled_scans",
        sa.Column("integration_provider", sa.String(32), nullable=True),
    )

    op.create_table(
        "onboarding_leads",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("source", sa.String(128), server_default="mini-assessment"),
        sa.Column("scenario", sa.String(64), server_default=""),
        sa.Column("steps_sent", sa.Integer(), server_default="0"),
        sa.Column("next_step_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unsubscribed", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_onboarding_leads_email", "onboarding_leads", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_onboarding_leads_email", table_name="onboarding_leads")
    op.drop_table("onboarding_leads")
    op.drop_column("scheduled_scans", "integration_provider")
    op.drop_column("scheduled_scans", "job_type")
