"""Onboarding key tokens for secure post-checkout API key delivery."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "010_onboarding_key_tokens"
down_revision = "009_moat_phase7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "onboarding_key_tokens",
        sa.Column("id", sa.String(80), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("token_hash", sa.String(128), nullable=False, unique=True, index=True),
        sa.Column("payload_encrypted", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("redeemed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("onboarding_key_tokens")
