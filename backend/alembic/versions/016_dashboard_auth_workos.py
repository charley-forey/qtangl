"""Dashboard auth via WorkOS — org mapping, users, memberships, session keys."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import add_column_if_absent, create_index_if_absent, create_table_if_absent

revision = "016_dashboard_auth_workos"
down_revision = "015_crypto_flip_jobs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    add_column_if_absent("tenants", sa.Column("workos_org_id", sa.String(128), nullable=True))
    add_column_if_absent(
        "tenants",
        sa.Column("auth_mode", sa.String(32), nullable=False, server_default="magic_link"),
    )
    create_index_if_absent("ix_tenants_workos_org_id", "tenants", ["workos_org_id"], unique=True)

    add_column_if_absent("api_keys", sa.Column("key_prefix", sa.String(16), nullable=True))
    add_column_if_absent("api_keys", sa.Column("created_by_user_id", sa.String(64), nullable=True))
    add_column_if_absent("api_keys", sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True))

    create_table_if_absent(
        "users",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("workos_user_id", sa.String(128), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_index_if_absent("ix_users_workos_user_id", "users", ["workos_user_id"], unique=True)
    create_index_if_absent("ix_users_email", "users", ["email"])

    create_table_if_absent(
        "tenant_memberships",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(16), nullable=False, server_default="operator"),
        sa.Column("workos_membership_id", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("tenant_id", "user_id", name="uq_tenant_user"),
    )
    create_index_if_absent("ix_tenant_memberships_tenant_id", "tenant_memberships", ["tenant_id"])
    create_index_if_absent("ix_tenant_memberships_user_id", "tenant_memberships", ["user_id"])
    create_index_if_absent(
        "ix_tenant_memberships_workos_membership_id",
        "tenant_memberships",
        ["workos_membership_id"],
        unique=True,
    )

    create_table_if_absent(
        "tenant_invites",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("role", sa.String(16), nullable=False, server_default="operator"),
        sa.Column("workos_invite_id", sa.String(128), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_index_if_absent("ix_tenant_invites_tenant_id", "tenant_invites", ["tenant_id"])
    create_index_if_absent(
        "ix_tenant_invites_workos_invite_id",
        "tenant_invites",
        ["workos_invite_id"],
        unique=True,
    )

    create_table_if_absent(
        "dashboard_session_keys",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("tenant_id", sa.String(64), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("key_hash", sa.String(128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    create_index_if_absent("ix_dashboard_session_keys_tenant_id", "dashboard_session_keys", ["tenant_id"])
    create_index_if_absent("ix_dashboard_session_keys_user_id", "dashboard_session_keys", ["user_id"])
    create_index_if_absent(
        "ix_dashboard_session_keys_key_hash",
        "dashboard_session_keys",
        ["key_hash"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_table("dashboard_session_keys")
    op.drop_table("tenant_invites")
    op.drop_table("tenant_memberships")
    op.drop_table("users")
    op.drop_column("api_keys", "last_used_at")
    op.drop_column("api_keys", "created_by_user_id")
    op.drop_column("api_keys", "key_prefix")
    op.drop_column("tenants", "auth_mode")
    op.drop_column("tenants", "workos_org_id")
