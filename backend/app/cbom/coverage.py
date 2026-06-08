"""Coverage-confidence scoring for multi-source CBOM inventory."""

from __future__ import annotations

from typing import Any


def _component_field(component: Any, key: str, default: Any = None) -> Any:
    if isinstance(component, dict):
        return component.get(key, default)
    if key == "verified":
        prov = getattr(component, "provenance", None)
        if prov is None:
            return default
        return getattr(prov, "verification_status", default) == "verified"
    if key == "verificationStatus":
        prov = getattr(component, "provenance", None)
        return getattr(prov, "verification_status", default) if prov else default
    if key in {"sourceType", "source_type"}:
        prov = getattr(component, "provenance", None)
        return getattr(prov, "source_type", default) if prov else default
    return getattr(component, key, default)


def compute_coverage_confidence(
    *,
    components: list[Any],
    sources: list[dict[str, Any]],
) -> dict[str, Any]:
    if not components:
        return {
            "score": 0.0,
            "band": "unknown",
            "verifiedShare": 0.0,
            "sourceDiversity": 0,
            "methodWeights": {},
            "notes": ["No components ingested"],
        }

    verified = sum(
        1
        for c in components
        if _component_field(c, "verified")
        or _component_field(c, "verificationStatus") == "verified"
    )
    unverified = sum(
        1 for c in components if _component_field(c, "verificationStatus") == "unverified-source"
    )
    total = len(components)
    verified_share = verified / total if total else 0.0

    source_types = {str(s.get("sourceType") or s.get("source_type") or "unknown") for s in sources}
    diversity = len(source_types)

    method_weights = {
        "live_scan": 1.0,
        "cloud_pull": 0.85,
        "third-party": 0.7,
        "upload": 0.6,
    }
    weighted = 0.0
    weight_sum = 0.0
    for c in components:
        st = str(_component_field(c, "sourceType") or _component_field(c, "source_type") or "third-party")
        w = method_weights.get(st, 0.5)
        weighted += w
        weight_sum += 1.0
    method_factor = weighted / weight_sum if weight_sum else 0.5

    penalty = min(0.3, unverified * 0.02)
    raw = (verified_share * 0.5 + method_factor * 0.3 + min(1.0, diversity / 4) * 0.2) - penalty
    score = round(max(0.0, min(100.0, raw * 100)), 1)

    if score >= 75:
        band = "high"
    elif score >= 50:
        band = "moderate"
    elif score >= 25:
        band = "low"
    else:
        band = "minimal"

    notes: list[str] = []
    if unverified:
        notes.append(f"{unverified} component(s) from unverified sources")
    if diversity < 2:
        notes.append("Single source type — diversify ingest for higher confidence")

    return {
        "score": score,
        "band": band,
        "verifiedShare": round(verified_share * 100, 1),
        "sourceDiversity": diversity,
        "sourceTypes": sorted(source_types),
        "methodWeights": method_weights,
        "unverifiedCount": unverified,
        "notes": notes,
    }
