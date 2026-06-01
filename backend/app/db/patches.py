from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

_COLUMN_PATCHES: list[tuple[str, str, str]] = [
    ("api_keys", "role", "VARCHAR(16) NOT NULL DEFAULT 'admin'"),
    ("scheduled_scans", "import_payload_json", "TEXT"),
    (
        "remediation_status",
        "asset_id",
        "VARCHAR(80)",
    ),
    (
        "remediation_status",
        "target_date",
        "TIMESTAMP WITH TIME ZONE",
    ),
    (
        "remediation_status",
        "verify_scan_id",
        "VARCHAR(80)",
    ),
]


def apply_schema_patches(engine: Engine) -> None:
    insp = inspect(engine)
    existing_tables = set(insp.get_table_names())
    with engine.begin() as conn:
        for table, column, ddl in _COLUMN_PATCHES:
            if table not in existing_tables:
                continue
            cols = {c["name"] for c in insp.get_columns(table)}
            if column in cols:
                continue
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}"))
