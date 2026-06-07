"""Evidence layer: transparency log, signing key registry, anchor records."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "004_evidence_layer"
down_revision = "003_row_level_security"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "signing_keys",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("alg", sa.String(32), nullable=False),
        sa.Column("public_key_b64", sa.Text(), nullable=False),
        sa.Column("key_fingerprint", sa.String(64), nullable=False),
        sa.Column("status", sa.String(16), server_default="active"),
        sa.Column("activated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("retired_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("key_fingerprint", name="uq_signing_keys_fingerprint"),
    )
    op.create_index("ix_signing_keys_fingerprint", "signing_keys", ["key_fingerprint"])

    op.create_table(
        "evidence_log",
        sa.Column("id", sa.Integer(), autoincrement=True, primary_key=True),
        sa.Column("seq", sa.Integer(), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("key_fingerprint", sa.String(64), server_default=""),
        sa.Column("alg", sa.String(32), server_default=""),
        sa.Column("signed_at", sa.String(64), server_default=""),
        sa.Column("prev_entry_hash", sa.String(64), nullable=False),
        sa.Column("entry_hash", sa.String(64), nullable=False),
        sa.Column("tenant_id", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("content_hash", name="uq_evidence_log_content_hash"),
        sa.UniqueConstraint("seq", name="uq_evidence_log_seq"),
    )
    op.create_index("ix_evidence_log_seq", "evidence_log", ["seq"])
    op.create_index("ix_evidence_log_tenant_id", "evidence_log", ["tenant_id"])

    op.create_table(
        "evidence_anchors",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("root_hash", sa.String(64), nullable=False),
        sa.Column("seq", sa.Integer(), server_default="0"),
        sa.Column("entry_count", sa.Integer(), server_default="0"),
        sa.Column("witness_id", sa.String(32), nullable=False),
        sa.Column("method", sa.String(32), server_default="file_witness"),
        sa.Column("anchored_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_evidence_anchors_root_hash", "evidence_anchors", ["root_hash"])
    op.create_index("ix_evidence_anchors_witness_id", "evidence_anchors", ["witness_id"])


def downgrade() -> None:
    op.drop_index("ix_evidence_anchors_witness_id", table_name="evidence_anchors")
    op.drop_index("ix_evidence_anchors_root_hash", table_name="evidence_anchors")
    op.drop_table("evidence_anchors")
    op.drop_index("ix_evidence_log_tenant_id", table_name="evidence_log")
    op.drop_index("ix_evidence_log_seq", table_name="evidence_log")
    op.drop_table("evidence_log")
    op.drop_index("ix_signing_keys_fingerprint", table_name="signing_keys")
    op.drop_table("signing_keys")
