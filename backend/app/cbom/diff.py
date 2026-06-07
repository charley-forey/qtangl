"""Diff aggregated CBOM snapshots between ingest events."""

from __future__ import annotations

from typing import Any


def diff_cbom_snapshots(
    previous: list[dict[str, Any]],
    current: list[dict[str, Any]],
) -> dict[str, Any]:
    prev_map = {_component_key(row): row for row in previous}
    curr_map = {_component_key(row): row for row in current}

    added_keys = set(curr_map) - set(prev_map)
    removed_keys = set(prev_map) - set(curr_map)
    changed: list[dict[str, Any]] = []

    for key in set(prev_map) & set(curr_map):
        prev_alg = prev_map[key].get("algorithm") or prev_map[key].get("alg")
        curr_alg = curr_map[key].get("algorithm") or curr_map[key].get("alg")
        if prev_alg != curr_alg:
            changed.append(
                {
                    "componentKey": key,
                    "field": "algorithm",
                    "previous": prev_alg,
                    "current": curr_alg,
                }
            )

    return {
        "addedCount": len(added_keys),
        "removedCount": len(removed_keys),
        "changedCount": len(changed),
        "added": [curr_map[k] for k in sorted(added_keys)][:50],
        "removed": [prev_map[k] for k in sorted(removed_keys)][:50],
        "changed": changed[:50],
        "summary": (
            f"+{len(added_keys)} new, -{len(removed_keys)} removed, "
            f"{len(changed)} algorithm change(s)"
        ),
    }


def _component_key(row: dict[str, Any]) -> str:
    return str(
        row.get("componentKey")
        or row.get("component_key")
        or row.get("bomRef")
        or row.get("bom_ref")
        or row.get("name")
        or "unknown"
    )
