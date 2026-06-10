"""Source-vs-runtime CBOM diff for code + image discovery."""

from __future__ import annotations

from typing import Any


def _bom_ref_key(item: dict[str, Any]) -> str:
    meta = item.get("metadata") if isinstance(item.get("metadata"), dict) else {}
    bom_ref = meta.get("bomRef") or item.get("bomRef") or item.get("bom-ref")
    if bom_ref:
        return str(bom_ref).lower()
    return str(item.get("algorithm") or item.get("location") or item.get("name") or "").lower()


def compute_source_runtime_diff(
    *,
    source_findings: list[dict[str, Any]],
    runtime_findings: list[dict[str, Any]],
) -> dict[str, Any]:
    source_map = {_bom_ref_key(f): f for f in source_findings if _bom_ref_key(f)}
    runtime_map = {_bom_ref_key(f): f for f in runtime_findings if _bom_ref_key(f)}
    source_keys = set(source_map)
    runtime_keys = set(runtime_map)
    runtime_only_keys = sorted(runtime_keys - source_keys)
    source_only_keys = sorted(source_keys - runtime_keys)
    overlap_keys = sorted(source_keys & runtime_keys)
    return {
        "sourceCount": len(source_keys),
        "runtimeCount": len(runtime_keys),
        "overlapCount": len(overlap_keys),
        "runtimeOnly": [
            {"bomRef": k, "algorithm": runtime_map[k].get("algorithm"), "location": runtime_map[k].get("location")}
            for k in runtime_only_keys[:50]
        ],
        "sourceOnly": [
            {"bomRef": k, "algorithm": source_map[k].get("algorithm"), "location": source_map[k].get("location")}
            for k in source_only_keys[:50]
        ],
        "overlap": [{"bomRef": k} for k in overlap_keys[:50]],
    }
