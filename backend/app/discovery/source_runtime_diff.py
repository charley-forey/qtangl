"""Source-vs-runtime CBOM diff for code + image discovery."""

from __future__ import annotations

from typing import Any


def _algo_key(item: dict[str, Any]) -> str:
    return str(item.get("algorithm") or item.get("location") or item.get("name") or "").lower()


def compute_source_runtime_diff(
    *,
    source_findings: list[dict[str, Any]],
    runtime_findings: list[dict[str, Any]],
) -> dict[str, Any]:
    source_keys = {_algo_key(f) for f in source_findings if _algo_key(f)}
    runtime_keys = {_algo_key(f) for f in runtime_findings if _algo_key(f)}
    runtime_only = sorted(runtime_keys - source_keys)
    source_only = sorted(source_keys - runtime_keys)
    overlap = sorted(source_keys & runtime_keys)
    return {
        "sourceCount": len(source_keys),
        "runtimeCount": len(runtime_keys),
        "overlapCount": len(overlap),
        "runtimeOnly": runtime_only[:50],
        "sourceOnly": source_only[:50],
    }
