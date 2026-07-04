from __future__ import annotations

from typing import Any

from app.demo.registry import DemoResource
from app.demo.store import list_resources, upsert_resource


SCENES: dict[str, dict[str, Any]] = {
    "trigger-hndl-breach": {
        "title": "Trigger HNDL breach",
        "description": "Mark payment and auth assets as harvest-exposed with classical crypto.",
    },
    "rollout-pqc-fleet": {
        "title": "Roll out PQC fleet-wide",
        "description": "Move all TLS endpoints to hybrid or PQC posture.",
    },
    "cert-expiry-crisis": {
        "title": "Cert expiry crisis",
        "description": "Inject imminent certificate expiry across critical services.",
    },
    "downgrade-attack": {
        "title": "Downgrade attack",
        "description": "Simulate algorithm downgrade on edge and API assets.",
    },
    "reset-baseline": {
        "title": "Reset baseline",
        "description": "Restore the seeded enterprise fleet baseline.",
    },
}


def list_scenes() -> list[dict[str, Any]]:
    return [{"id": sid, **meta} for sid, meta in SCENES.items()]


def apply_scene(scene_id: str) -> dict[str, Any]:
    if scene_id not in SCENES:
        raise ValueError(f"Unknown scene: {scene_id}")
    if scene_id == "reset-baseline":
        from app.demo.seed import seed_enterprise_fleet
        from app.demo.store import replace_all_resources

        fleet = seed_enterprise_fleet()
        replace_all_resources(fleet)
        return {"sceneId": scene_id, "title": SCENES[scene_id]["title"], "changed": len(fleet)}

    resources = list_resources()
    changed = 0
    for resource in resources:
        updated = _apply_scene_to_resource(scene_id, resource)
        if updated:
            upsert_resource(updated)
            changed += 1
    return {"sceneId": scene_id, "title": SCENES[scene_id]["title"], "changed": changed}


def _apply_scene_to_resource(scene_id: str, resource: DemoResource) -> DemoResource | None:
    if scene_id == "trigger-hndl-breach":
        if resource.business_unit in {"Payments", "Identity"}:
            resource.posture = "classical"
            resource.active_events = list(set(resource.active_events + ["harvested"]))
            return resource
        return None
    if scene_id == "rollout-pqc-fleet":
        if resource.kind in {"tls", "db_tls", "email"}:
            resource.posture = "pqc" if resource.business_unit == "Platform" else "hybrid"
            resource.active_events = [e for e in resource.active_events if e != "downgrade"]
            return resource
        if resource.kind == "jwks":
            resource.posture = "hybrid"
            return resource
        return None
    if scene_id == "cert-expiry-crisis":
        if resource.business_unit in {"Payments", "Platform", "Identity"}:
            resource.active_events = list(set(resource.active_events + ["cert_expiry"]))
            return resource
        return None
    if scene_id == "downgrade-attack":
        if resource.business_unit in {"Platform", "Payments"}:
            resource.posture = "classical"
            resource.active_events = list(set(resource.active_events + ["downgrade"]))
            return resource
        return None
    return None
