"""Moat deepening: anchors, benchmarks, merkle metadata."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "008_moat_deepening_core"
down_revision = "007_cloud_pull_drip"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("evidence_anchors", sa.Column("git_commit_sha", sa.String(64), nullable=True))
    op.add_column("evidence_anchors", sa.Column("git_url", sa.String(512), nullable=True))
    op.add_column("evidence_anchors", sa.Column("tsa_token_b64", sa.Text(), nullable=True))
    op.add_column("evidence_anchors", sa.Column("tsa_time", sa.DateTime(timezone=True), nullable=True))
    op.add_column("evidence_anchors", sa.Column("merkle_root", sa.String(64), nullable=True))

    op.create_table(
        "benchmark_aggregates",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("industry", sa.String(64), nullable=False),
        sa.Column("cohort_key", sa.String(128), nullable=False),
        sa.Column("sample_size", sa.Integer(), server_default="0"),
        sa.Column("median_readiness", sa.Float(), nullable=False),
        sa.Column("p25", sa.Float(), nullable=False),
        sa.Column("p75", sa.Float(), nullable=False),
        sa.Column("as_of", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_benchmark_aggregates_cohort", "benchmark_aggregates", ["industry", "cohort_key"])

    op.add_column("signing_keys", sa.Column("kms_provider", sa.String(32), nullable=True))
    op.add_column("signing_keys", sa.Column("kms_key_id", sa.String(512), nullable=True))


def downgrade() -> None:
    op.drop_column("signing_keys", "kms_key_id")
    op.drop_column("signing_keys", "kms_provider")
    op.drop_index("ix_benchmark_aggregates_cohort", table_name="benchmark_aggregates")
    op.drop_table("benchmark_aggregates")
    op.drop_column("evidence_anchors", "merkle_root")
    op.drop_column("evidence_anchors", "tsa_time")
    op.drop_column("evidence_anchors", "tsa_token_b64")
    op.drop_column("evidence_anchors", "git_url")
    op.drop_column("evidence_anchors", "git_commit_sha")
