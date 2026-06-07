"""CBOM ingestion, provenance tagging, and tenant aggregation."""

from app.cbom.service import (
    get_aggregate,
    ingest_cbom_document,
    list_conflicts,
    list_sources,
    resolve_conflict,
    sync_scan_to_aggregate,
)

__all__ = [
    "get_aggregate",
    "ingest_cbom_document",
    "list_conflicts",
    "list_sources",
    "resolve_conflict",
    "sync_scan_to_aggregate",
]
