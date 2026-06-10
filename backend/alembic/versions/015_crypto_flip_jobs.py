"""Crypto flip jobs and approval workflow."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "015_crypto_flip_jobs"
down_revision = "014_remediation_program"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "crypto_flip_jobs",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("program_item_id", sa.String(80), sa.ForeignKey("remediation_program_items.id"), nullable=True),
        sa.Column("flip_surface", sa.String(16), nullable=False),
        sa.Column("provider", sa.String(32), nullable=False),
        sa.Column("action", sa.String(64), nullable=False, server_default="flip"),
        sa.Column("target_env", sa.String(16), nullable=False, server_default="staging"),
        sa.Column("status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("dry_run_result_json", sa.Text(), nullable=True),
        sa.Column("request_json", sa.Text(), nullable=True),
        sa.Column("result_json", sa.Text(), nullable=True),
        sa.Column("external_ref", sa.String(256), nullable=True),
        sa.Column("submitted_by", sa.String(255), nullable=True),
        sa.Column("approval_actor", sa.String(255), nullable=True),
        sa.Column("approval_note", sa.Text(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("before_snapshot_id", sa.String(80), nullable=True),
        sa.Column("after_snapshot_id", sa.String(80), nullable=True),
        sa.Column("proof_id", sa.String(80), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_crypto_flip_jobs_tenant_status", "crypto_flip_jobs", ["tenant_id", "status"])
    op.create_index("ix_crypto_flip_jobs_program_item", "crypto_flip_jobs", ["program_item_id"])
    op.create_table(
        "flip_approvals",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("flip_job_id", sa.String(80), sa.ForeignKey("crypto_flip_jobs.id"), nullable=False),
        sa.Column("actor", sa.String(255), nullable=False),
        sa.Column("action", sa.String(32), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_flip_approvals_job", "flip_approvals", ["flip_job_id"])
    op.add_column(
        "remediation_program_items",
        sa.Column("flip_job_id", sa.String(80), nullable=True),
    )
    op.add_column(
        "verification_proofs",
        sa.Column("flip_job_id", sa.String(80), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("verification_proofs", "flip_job_id")
    op.drop_column("remediation_program_items", "flip_job_id")
    op.drop_index("ix_flip_approvals_job", table_name="flip_approvals")
    op.drop_table("flip_approvals")
    op.drop_index("ix_crypto_flip_jobs_program_item", table_name="crypto_flip_jobs")
    op.drop_index("ix_crypto_flip_jobs_tenant_status", table_name="crypto_flip_jobs")
    op.drop_table("crypto_flip_jobs")
