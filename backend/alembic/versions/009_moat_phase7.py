"""Phase 7: witnesses, drift aggregates, OIDC config."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import add_column_if_absent, create_index_if_absent, create_table_if_absent

revision = "009_moat_phase7"
down_revision = "008_moat_deepening_core"
branch_labels = None
depends_on = None


def upgrade() -> None:
    create_table_if_absent(
        "witness_cosignatures",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("witness_id", sa.String(64), nullable=False, index=True),
        sa.Column("root_hash", sa.String(64), nullable=False, index=True),
        sa.Column("seq", sa.Integer(), nullable=False),
        sa.Column("alg", sa.String(32), nullable=False),
        sa.Column("signature_b64", sa.Text(), nullable=False),
        sa.Column("public_key_b64", sa.Text(), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
    )

    create_table_if_absent(
        "drift_aggregates",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("industry", sa.String(64), nullable=False),
        sa.Column("cohort_key", sa.String(128), nullable=False),
        sa.Column("pattern_type", sa.String(64), nullable=False),
        sa.Column("sample_size", sa.Integer(), server_default="0"),
        sa.Column("metric_json", sa.Text(), default="{}"),
        sa.Column("as_of", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    create_table_if_absent(
        "tenant_oidc_config",
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), primary_key=True),
        sa.Column("issuer_url", sa.String(512), nullable=False),
        sa.Column("client_id", sa.String(255), nullable=False),
        sa.Column("client_secret_enc", sa.Text(), default=""),
        sa.Column("enabled", sa.Boolean(), server_default="false"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("tenant_oidc_config")
    op.drop_table("drift_aggregates")
    op.drop_table("witness_cosignatures")
