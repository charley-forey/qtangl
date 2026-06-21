"""Batch live scan orchestration for authorized domains."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, status

from app.auth import AuthContext
from app.billing.entitlements import check_batch_production_scan_access, record_production_scan_usage
from app.db.config import use_worker_queue
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.pqc.safety import ScanSafetyError, live_scan_enabled, normalize_host, resolve_scannable
from app.store.scan_jobs import create_job, run_job_async, save_scan_bundle

logger = logging.getLogger(__name__)

DEFAULT_SCENARIO_ID = "bank-tls-inventory"


def normalize_batch_domains(domains: list[str]) -> list[str]:
    cleaned: list[str] = []
    for item in domains:
        host = normalize_host(str(item).strip())
        if host and host not in cleaned:
            cleaned.append(host)
    return cleaned


def start_batch_live_scans(
    *,
    tenant_id: str,
    domains: list[str],
    auth: AuthContext,
    industry: str | None = None,
    depth: str = "standard",
    scenario_id: str = DEFAULT_SCENARIO_ID,
) -> dict[str, Any]:
    if not live_scan_enabled():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Live PQC scanning is disabled on this deployment. "
                "Set QTANGL_PQC_ENABLE_LIVE_SCAN=true or upload a certificate bundle."
            ),
        )

    targets = normalize_batch_domains(domains)
    if not targets:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No domains to scan.")

    quota_error = check_batch_production_scan_access(tenant_id=tenant_id, count=len(targets))
    if quota_error:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=quota_error)

    for target in targets:
        try:
            resolve_scannable(target, port=443, tenant_id=tenant_id)
        except ScanSafetyError as exc:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Domain '{target}' is not authorized for scanning: {exc}",
            ) from exc

    from app.audit.service import log_action

    log_action(
        tenant_id=tenant_id,
        action="scan.batch_started",
        actor=auth.role,
        detail={"domains": targets, "count": len(targets), "industry": industry},
    )

    dataset = load_dataset()
    started: list[dict[str, Any]] = []

    for target in targets:
        scan_kwargs = {
            "scenario_id": scenario_id,
            "target_override": target,
            "uploaded_rows": None,
            "seed": 1234,
            "depth": depth,
            "industry": industry,
            "tenant_id": tenant_id,
        }

        log_action(
            tenant_id=tenant_id,
            action="live_scan_authorized",
            actor=auth.role,
            resource_id=target,
            detail={"domain": target, "industry": industry, "mode": "batch"},
        )

        if not use_worker_queue():
            bundle = run_pqc_scan(dataset, use_fixture=False, **scan_kwargs)
            save_scan_bundle(bundle.scan_id, bundle, tenant_id=tenant_id)
            record_production_scan_usage(tenant_id=tenant_id, use_fixture=False)
            started.append({"scanId": bundle.scan_id, "target": target, "status": "done"})
            continue

        scan_id = create_job(
            tenant_id=tenant_id,
            payload={
                "scenarioId": scenario_id,
                "target": target,
                "seed": 1234,
                "bundleSessionId": None,
                "tenantId": tenant_id,
                "depth": depth,
                "industry": industry,
            },
            auth_method=auth.auth_method,
            api_key_id=auth.api_key_id,
            actor_email=auth.email,
        )

        def make_runner(kwargs: dict[str, Any]):
            def runner(on_progress):
                return run_pqc_scan(dataset, use_fixture=False, on_progress=on_progress, **kwargs)

            return runner

        run_job_async(scan_id, make_runner(dict(scan_kwargs)), tenant_id=tenant_id)
        record_production_scan_usage(tenant_id=tenant_id, use_fixture=False)
        started.append({"scanId": scan_id, "target": target, "status": "running"})

    return {
        "status": "success",
        "count": len(started),
        "scans": started,
        "summary": f"Started {len(started)} baseline scan(s) across authorized domains.",
    }
