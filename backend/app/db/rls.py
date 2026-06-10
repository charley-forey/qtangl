"""Postgres Row-Level Security helpers (defense in depth)."""

from __future__ import annotations

import logging

from sqlalchemy import text
from sqlalchemy.engine import Engine

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
    "drift_snapshots",
    "remediation_program_items",
    "verification_proofs",
)


def apply_row_level_security(engine: Engine) -> None:
    """Enable RLS policies keyed to app.current_tenant GUC (Postgres only)."""
    if engine.dialect.name != "postgresql":
        return
    from sqlalchemy import inspect

    existing = set(inspect(engine).get_table_names())
    applied = 0
    for table in _TENANT_TABLES:
        if table not in existing:
            continue
        try:
            with engine.begin() as conn:
                conn.execute(text(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY'))
                conn.execute(text(f'DROP POLICY IF EXISTS tenant_isolation ON "{table}"'))
                conn.execute(
                    text(
                        f"""
                        CREATE POLICY tenant_isolation ON "{table}"
                        USING (
                            tenant_id = current_setting('app.current_tenant', true)
                            OR current_setting('app.current_tenant', true) IS NULL
                            OR current_setting('app.current_tenant', true) = ''
                        )
                        """
                    )
                )
            applied += 1
        except Exception as exc:
            logger.warning("RLS skipped for %s: %s", table, exc)
    logger.info("Applied Postgres RLS policies on %d tenant tables", applied)


def set_session_tenant(conn, tenant_id: str) -> None:
    if conn.dialect.name != "postgresql":
        return
    conn.execute(text("SELECT set_config('app.current_tenant', :tid, true)"), {"tid": tenant_id})
