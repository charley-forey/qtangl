"""Incident correlation for alert grouping."""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any

from app.command_center.schemas import CorrelatedIncident, CorrelatedIncidentsResponse
from app.monitoring.correlation import correlation_key_for_finding, normalize_fqdn


def _incident_id(keys: list[str]) -> str:
    digest = hashlib.sha256("|".join(sorted(keys)).encode()).hexdigest()[:16]
    return f"inc_{digest}"


def group_alerts(alerts: list[dict[str, Any]]) -> CorrelatedIncidentsResponse:
    buckets: dict[str, list[dict[str, Any]]] = {}
    for alert in alerts:
        host = normalize_fqdn(str(alert.get("host") or alert.get("target") or ""))
        key = f"host:{host}" if host else f"category:{alert.get('category') or alert.get('type') or 'general'}"
        buckets.setdefault(key, []).append(alert)

    incidents: list[CorrelatedIncident] = []
    now = datetime.now(timezone.utc).isoformat()
    for key, group in buckets.items():
        if len(group) < 1:
            continue
        alert_ids = [str(a.get("id") or a.get("alertId") or "") for a in group if a.get("id") or a.get("alertId")]
        sev = max((str(a.get("severity") or "low") for a in group), key=lambda s: {"critical": 4, "high": 3, "medium": 2}.get(s, 1))
        incidents.append(
            CorrelatedIncident(
                id=_incident_id([key, *alert_ids[:3]]),
                title=group[0].get("title") or f"Correlated alerts on {key}",
                alertIds=alert_ids,
                correlationKeys=[key],
                severity=sev,
                summary=f"{len(group)} related alert(s) share {key}.",
                createdAt=str(group[0].get("createdAt") or now),
            )
        )
    return CorrelatedIncidentsResponse(incidents=incidents[:30])


def correlate_finding_lists(
    findings_a: list[dict[str, Any]],
    findings_b: list[dict[str, Any]],
) -> dict[str, Any]:
    from app.monitoring.correlation import correlate_findings

    return correlate_findings(findings_a, findings_b)
