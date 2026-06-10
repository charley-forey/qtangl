from __future__ import annotations

from typing import Any

from app.monitoring.drift_snapshots import get_latest_snapshots


def diff_snapshot_payloads(previous: dict[str, Any], current: dict[str, Any]) -> dict[str, Any]:
    """Generic set-diff for snapshot payloads with findingIds or componentIds."""
    prev_ids = set(previous.get("findingIds") or previous.get("componentIds") or [])
    curr_ids = set(current.get("findingIds") or current.get("componentIds") or [])
    added = sorted(curr_ids - prev_ids)
    removed = sorted(prev_ids - curr_ids)
    unchanged = len(curr_ids & prev_ids)

    delta: dict[str, Any] = {
        "addedCount": len(added),
        "removedCount": len(removed),
        "unchangedCount": unchanged,
        "addedIds": added[:100],
        "removedIds": removed[:100],
        "hasBaseline": True,
    }

    prev_qv = previous.get("quantumVulnerableCount")
    curr_qv = current.get("quantumVulnerableCount")
    if prev_qv is not None and curr_qv is not None:
        delta["quantumVulnerableDelta"] = int(curr_qv) - int(prev_qv)

    prev_runtime = set(previous.get("runtimeOnly") or [])
    curr_runtime = set(current.get("runtimeOnly") or [])
    prev_source = set(previous.get("sourceOnly") or [])
    curr_source = set(current.get("sourceOnly") or [])
    runtime_added = sorted(curr_runtime - prev_runtime)
    source_added = sorted(curr_source - prev_source)
    if runtime_added or source_added:
        delta["sourceRuntimeDrift"] = {
            "runtimeOnlyAdded": runtime_added[:50],
            "sourceOnlyAdded": source_added[:50],
        }

    return delta


class UnifiedDiffService:
    @staticmethod
    def compute_delta(
        *,
        tenant_id: str,
        source_type: str,
        scope_key: str,
    ) -> dict[str, Any]:
        snaps = get_latest_snapshots(
            tenant_id=tenant_id,
            source_type=source_type,
            scope_key=scope_key,
            limit=2,
        )
        if not snaps:
            return {
                "available": False,
                "hasBaseline": False,
                "sourceType": source_type,
                "scopeKey": scope_key,
            }
        if len(snaps) < 2:
            return {
                "available": True,
                "hasBaseline": False,
                "sourceType": source_type,
                "scopeKey": scope_key,
                "currentSnapshotId": snaps[0]["id"],
                "capturedAt": snaps[0]["capturedAt"],
            }
        current = snaps[0]["payload"]
        previous = snaps[1]["payload"]
        delta = diff_snapshot_payloads(previous, current)
        return {
            "available": True,
            "sourceType": source_type,
            "scopeKey": scope_key,
            "currentSnapshotId": snaps[0]["id"],
            "previousSnapshotId": snaps[1]["id"],
            "capturedAt": snaps[0]["capturedAt"],
            "previousCapturedAt": snaps[1]["capturedAt"],
            **delta,
        }

    @staticmethod
    def summarize_tenant(
        *,
        tenant_id: str,
        since_days: int = 7,
    ) -> dict[str, Any]:
        from datetime import datetime, timedelta, timezone

        from app.monitoring.drift_snapshots import list_snapshots_for_tenant

        since = datetime.now(timezone.utc) - timedelta(days=since_days)
        snaps = list_snapshots_for_tenant(tenant_id=tenant_id, since=since, limit=500)
        by_source: dict[str, dict[str, int]] = {}
        scopes_seen: set[tuple[str, str]] = set()
        total_added = 0
        total_removed = 0

        scope_latest: dict[tuple[str, str], list[dict[str, Any]]] = {}
        for s in snaps:
            key = (s["sourceType"], s["scopeKey"])
            scopes_seen.add(key)
            scope_latest.setdefault(key, []).append(s)

        for key, scope_snaps in scope_latest.items():
            source_type, scope_key = key
            if len(scope_snaps) >= 2:
                delta = diff_snapshot_payloads(scope_snaps[1]["payload"], scope_snaps[0]["payload"])
                total_added += delta.get("addedCount", 0)
                total_removed += delta.get("removedCount", 0)
            by_source.setdefault(source_type, {"scopes": 0, "added": 0, "removed": 0})
            by_source[source_type]["scopes"] += 1
            if len(scope_snaps) >= 2:
                d = diff_snapshot_payloads(scope_snaps[1]["payload"], scope_snaps[0]["payload"])
                by_source[source_type]["added"] += d.get("addedCount", 0)
                by_source[source_type]["removed"] += d.get("removedCount", 0)

        return {
            "sinceDays": since_days,
            "scopeCount": len(scopes_seen),
            "totalAdded": total_added,
            "totalRemoved": total_removed,
            "bySource": by_source,
            "snapshotCount": len(snaps),
        }
