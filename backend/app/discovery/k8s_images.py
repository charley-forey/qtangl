"""Bridge K8s workload image enumeration to binary_scan jobs."""

from __future__ import annotations

from typing import Any

from app.discovery.jobs import create_discovery_job


def enqueue_workload_image_scans(*, tenant_id: str, images: list[str]) -> list[str]:
    job_ids: list[str] = []
    for image_ref in images[:50]:
        job_id = create_discovery_job(
            tenant_id=tenant_id,
            job_type="binary_scan",
            payload={"imageRef": image_ref},
            target_id=image_ref,
        )
        job_ids.append(job_id)
    return job_ids


def images_from_k8s_pull_result(pull: dict[str, Any]) -> list[str]:
    images: list[str] = []
    for item in pull.get("workloads") or pull.get("components") or []:
        if isinstance(item, dict):
            ref = item.get("image") or item.get("imageRef")
            if ref:
                images.append(str(ref))
    return images
