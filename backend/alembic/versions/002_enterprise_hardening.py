"""Enterprise hardening: FKs, indexes, scan metadata columns, unique integrations."""

from __future__ import annotations

import logging

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import add_column_if_absent, create_index_if_absent, create_table_if_absent

revision = "002_enterprise_hardening"
down_revision = "001_baseline"
branch_labels = None
depends_on = None

logger = logging.getLogger(__name__)

_TENANT_TABLES = (
    "upload_sessions",
    "scan_jobs",
    "scheduled_scans",
    "remediation_status",
    "share_links",
    "audit_log",
    "webhook_subscriptions",
    "portfolio_targets",
    "tenant_integrations",
    "tenant_settings",
    "webhook_dead_letters",
    "schedule_run_logs",
    "remediation_external_sync",
    "tenant_subscriptions",
    "partner_child_tenants",
)


def _autocommit_ddl(label: str, fn) -> None:
    """Run optional DDL in its own commit (Postgres aborts the whole txn on failure)."""
    try:
        with op.get_context().autocommit_block():
            fn()
    except Exception as exc:
        logger.warning("Migration 002 skipped %s: %s", label, exc)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "scan_jobs" in existing_tables:
        cols = {c["name"] for c in inspector.get_columns("scan_jobs")}
        if "readiness_score" not in cols:
            _autocommit_ddl(
                "scan_jobs.readiness_score",
                lambda: add_column_if_absent("scan_jobs", sa.Column("readiness_score", sa.Float(), nullable=True)),
            )
        if "target_domain" not in cols:
            _autocommit_ddl(
                "scan_jobs.target_domain",
                lambda: add_column_if_absent("scan_jobs", sa.Column("target_domain", sa.String(255), nullable=True)),
            )
        if "scenario_id" not in cols:
            _autocommit_ddl(
                "scan_jobs.scenario_id",
                lambda: add_column_if_absent("scan_jobs", sa.Column("scenario_id", sa.String(64), nullable=True)),
            )
        if "bundle_storage_key" not in cols:
            _autocommit_ddl(
                "scan_jobs.bundle_storage_key",
                lambda: add_column_if_absent(
                    "scan_jobs", sa.Column("bundle_storage_key", sa.String(512), nullable=True)
                ),
            )

    _create_index_if_missing("ix_scan_jobs_tenant_created", "scan_jobs", ["tenant_id", "created_at"])
    _create_index_if_missing("ix_audit_log_tenant_created", "audit_log", ["tenant_id", "created_at"])

    if "tenant_integrations" in existing_tables:
        indexes = {idx["name"] for idx in inspector.get_indexes("tenant_integrations")}
        if "uq_tenant_integrations_tenant_provider" not in indexes:
            _autocommit_ddl(
                "uq_tenant_integrations_tenant_provider",
                lambda: op.create_unique_constraint(
                    "uq_tenant_integrations_tenant_provider",
                    "tenant_integrations",
                    ["tenant_id", "provider"],
                ),
            )

    for table in _TENANT_TABLES:
        if table not in existing_tables:
            continue
        fks = {fk["name"] for fk in inspector.get_foreign_keys(table)}
        fk_name = f"fk_{table}_tenant_id_tenants"
        if fk_name not in fks and table != "tenant_settings":
            _autocommit_ddl(
                fk_name,
                lambda table=table, fk_name=fk_name: op.create_foreign_key(
                    fk_name, table, "tenants", ["tenant_id"], ["id"]
                ),
            )

    if "remediation_status" in existing_tables:
        fks = {fk["name"] for fk in inspector.get_foreign_keys("remediation_status")}
        if "fk_remediation_status_scan_id" not in fks:
            _autocommit_ddl(
                "fk_remediation_status_scan_id",
                lambda: op.create_foreign_key(
                    "fk_remediation_status_scan_id",
                    "remediation_status",
                    "scan_jobs",
                    ["scan_id"],
                    ["id"],
                    ondelete="CASCADE",
                ),
            )

    if "share_links" in existing_tables:
        fks = {fk["name"] for fk in inspector.get_foreign_keys("share_links")}
        if "fk_share_links_scan_id" not in fks:
            _autocommit_ddl(
                "fk_share_links_scan_id",
                lambda: op.create_foreign_key(
                    "fk_share_links_scan_id",
                    "share_links",
                    "scan_jobs",
                    ["scan_id"],
                    ["id"],
                    ondelete="CASCADE",
                ),
            )


def _create_index_if_missing(name: str, table: str, columns: list[str]) -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if table not in inspector.get_table_names():
        return
    indexes = {idx["name"] for idx in inspector.get_indexes(table)}
    if name not in indexes:
        _autocommit_ddl(name, lambda: create_index_if_absent(name, table, columns))


def downgrade() -> None:
    pass
