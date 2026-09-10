from __future__ import annotations

import uuid
from typing import Any

from app.demo.config import DEMO_SCENARIO_ID
from app.demo.registry import DemoResource, resource_to_uploaded_row
from app.demo.store import list_resources
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.serialize import serialize_bundle


def resources_to_uploaded_rows(resources: list[DemoResource] | None = None) -> list[dict[str, Any]]:
    rows = resources if resources is not None else list_resources(enabled_only=True)
    return [resource_to_uploaded_row(resource) for resource in rows if resource.enabled]


def run_demo_assessment(
    *,
    resources: list[DemoResource] | None = None,
    scan_id: str | None = None,
) -> dict[str, Any]:
    uploaded_rows = resources_to_uploaded_rows(resources)
    dataset = load_dataset()
    scan_id = scan_id or f"demo-{uuid.uuid4().hex[:16]}"
    bundle = run_pqc_scan(
        dataset,
        scenario_id=DEMO_SCENARIO_ID,
        use_fixture=True,
        uploaded_rows=uploaded_rows,
        scan_id=scan_id,
        industry="financial",
    )
    return serialize_bundle(bundle)
