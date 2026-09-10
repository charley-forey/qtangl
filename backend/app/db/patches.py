"""Idempotent patches for legacy databases initialized with create_all()."""

from __future__ import annotations

import logging

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)


def _add_columns(
    engine: Engine,
    table: str,
    additions: list[tuple[str, str]],
) -> None:
    if not additions:
        return
    with engine.begin() as connection:
        for name, sql_type in additions:
            connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {sql_type}"))
            logger.info("Applied schema patch: %s.%s", table, name)


def apply_schema_patches(engine: Engine) -> None:
    """Add columns that older create_all() deployments may lack."""
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    dialect = engine.dialect.name

    if "tenants" in tables:
        tenant_cols = {column["name"] for column in inspector.get_columns("tenants")}
        tenant_additions: list[tuple[str, str]] = []
        if "workos_org_id" not in tenant_cols:
            tenant_additions.append(("workos_org_id", "VARCHAR(128)"))
        if "auth_mode" not in tenant_cols:
            tenant_additions.append(("auth_mode", "VARCHAR(32) NOT NULL DEFAULT 'magic_link'"))
        _add_columns(engine, "tenants", tenant_additions)
        from app.db.models import Tenant

        for index in Tenant.__table__.indexes:
            index.create(engine, checkfirst=True)

    if "api_keys" in tables:
        key_cols = {column["name"] for column in inspector.get_columns("api_keys")}
        key_additions: list[tuple[str, str]] = []
        if "role" not in key_cols:
            key_additions.append(("role", "VARCHAR(16) DEFAULT 'admin'"))
        if "key_prefix" not in key_cols:
            key_additions.append(("key_prefix", "VARCHAR(16)"))
        if "created_by_user_id" not in key_cols:
            key_additions.append(("created_by_user_id", "VARCHAR(64)"))
        if "last_used_at" not in key_cols:
            key_additions.append(("last_used_at", "TIMESTAMP WITH TIME ZONE" if dialect == "postgresql" else "DATETIME"))
        _add_columns(engine, "api_keys", key_additions)

    if "scan_jobs" not in tables:
        return

    cols = {column["name"] for column in inspector.get_columns("scan_jobs")}
    scan_additions: list[tuple[str, str]] = []
    if "readiness_score" not in cols:
        scan_additions.append(("readiness_score", "DOUBLE PRECISION" if dialect == "postgresql" else "FLOAT"))
    if "target_domain" not in cols:
        scan_additions.append(("target_domain", "VARCHAR(255)"))
    if "scenario_id" not in cols:
        scan_additions.append(("scenario_id", "VARCHAR(64)"))
    if "bundle_storage_key" not in cols:
        scan_additions.append(("bundle_storage_key", "VARCHAR(512)"))
    _add_columns(engine, "scan_jobs", scan_additions)
