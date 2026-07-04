from __future__ import annotations

from typing import Any

from app.demo.store import latest_snapshot, list_snapshots


def build_narration(*, previous: dict[str, Any] | None = None, current: dict[str, Any] | None = None) -> str:
    prev = previous or (list_snapshots(limit=2)[-2] if len(list_snapshots(limit=2)) >= 2 else None)
    cur = current or latest_snapshot()
    if cur is None:
        return "Controlled demo estate initialized. Run an assessment to begin tracking posture changes."
    score = float(cur.get("readinessScore") or 0)
    band = str(cur.get("readinessBand") or "unknown")
    alerts = cur.get("alerts") or []
    parts = [f"Portfolio readiness is {score:.0f}/100 ({band})."]
    if prev:
        delta = score - float(prev.get("readinessScore") or 0)
        if abs(delta) >= 0.5:
            direction = "rose" if delta > 0 else "dropped"
            parts.append(f"Readiness {direction} {abs(delta):.1f} points since the previous snapshot.")
    if alerts:
        top = alerts[0]
        parts.append(str(top.get("message") or "New monitoring alert fired."))
    else:
        parts.append("No new critical alerts in the latest assessment cycle.")
    parts.append("This is a controlled simulation — inventory aid, not a formal audit.")
    return " ".join(parts)
