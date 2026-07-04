from __future__ import annotations

from typing import Any

from app.demo.registry import DemoResource
from app.demo.store import get_resource, list_resources, upsert_resource


def inject_event(*, event_type: str, resource_id: str | None = None) -> dict[str, Any]:
    mapping = {
        "new-quantum-vulnerable-asset": _inject_new_qv_asset,
        "cert-expiry": _inject_cert_expiry,
        "algorithm-downgrade": _inject_downgrade,
        "hndl-harvest": _inject_harvest,
        "key-reuse": _inject_key_reuse,
    }
    handler = mapping.get(event_type)
    if handler is None:
        raise ValueError(f"Unknown inject event: {event_type}")
    return handler(resource_id=resource_id)


def _inject_cert_expiry(*, resource_id: str | None) -> dict[str, Any]:
    resource = _pick_resource(resource_id)
    resource.active_events = list(set(resource.active_events + ["cert_expiry"]))
    upsert_resource(resource)
    return {"event": "cert-expiry", "resourceId": resource.id, "message": f"Cert expiry injected on {resource.label}."}


def _inject_downgrade(*, resource_id: str | None) -> dict[str, Any]:
    resource = _pick_resource(resource_id)
    resource.posture = "classical"
    resource.active_events = list(set(resource.active_events + ["downgrade"]))
    upsert_resource(resource)
    return {"event": "algorithm-downgrade", "resourceId": resource.id, "message": f"Algorithm downgrade on {resource.label}."}


def _inject_harvest(*, resource_id: str | None) -> dict[str, Any]:
    resource = _pick_resource(resource_id)
    resource.active_events = list(set(resource.active_events + ["harvested"]))
    upsert_resource(resource)
    return {"event": "hndl-harvest", "resourceId": resource.id, "message": f"HNDL harvest marker on {resource.label}."}


def _inject_key_reuse(*, resource_id: str | None) -> dict[str, Any]:
    resource = _pick_resource(resource_id)
    resource.active_events = list(set(resource.active_events + ["key_reuse"]))
    upsert_resource(resource)
    return {"event": "key-reuse", "resourceId": resource.id, "message": f"Key reuse detected on {resource.label}."}


def _inject_new_qv_asset(*, resource_id: str | None) -> dict[str, Any]:
    import uuid

    if resource_id:
        resource = _pick_resource(resource_id)
        resource.posture = "classical"
        resource.enabled = True
        upsert_resource(resource)
        return {"event": "new-quantum-vulnerable-asset", "resourceId": resource.id, "message": f"{resource.label} marked quantum-vulnerable."}
    new = DemoResource(
        id=f"demo-shadow-{uuid.uuid4().hex[:8]}",
        label="Shadow IT TLS",
        kind="tls",
        host="shadow.acme-corp.example",
        port=443,
        business_unit="Unknown",
        posture="classical",
        compliance_target="general",
        enabled=True,
        active_events=[],
    )
    upsert_resource(new)
    return {"event": "new-quantum-vulnerable-asset", "resourceId": new.id, "message": "New shadow TLS endpoint discovered."}


def _pick_resource(resource_id: str | None) -> DemoResource:
    if resource_id:
        resource = get_resource(resource_id)
        if resource is None:
            raise ValueError(f"Resource not found: {resource_id}")
        return resource
    enabled = list_resources(enabled_only=True)
    if not enabled:
        raise ValueError("No enabled demo resources")
    return enabled[0]
