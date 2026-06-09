from __future__ import annotations

import hashlib
import json
import threading
import uuid
from datetime import datetime, timezone
from typing import Any

from app.audit.service import log_action
from app.cbom.adapter import (
    component_dedupe_key,
    infer_source_label,
    normalized_from_crypto_asset,
    parse_cyclonedx_document,
)
from app.cbom.merge import (
    aggregated_readiness,
    detect_conflicts,
    export_aggregate_cbom,
    normalized_to_row_fields,
    row_to_normalized,
)
from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import CbomComponent as CbomComponentRow
from app.db.models import CbomIngestJob as CbomIngestJobRow
from app.db.models import CbomSource as CbomSourceRow
from app.db.models import MergeConflict as MergeConflictRow
from app.pqc.cbom import validate_import_cbom
from app.store.scan_jobs import list_jobs_for_tenant, load_scan_bundle
from app.telemetry.events import track_event

_MAX_UPLOAD_BYTES = 25 * 1024 * 1024
_memory_lock = threading.Lock()
_memory_sources: dict[str, list[dict[str, Any]]] = {}
_memory_jobs: dict[str, list[dict[str, Any]]] = {}
_memory_components: dict[str, list[dict[str, Any]]] = {}
_memory_conflicts: dict[str, list[dict[str, Any]]] = {}


def _content_hash(document: dict[str, Any]) -> str:
    payload = json.dumps(document, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _mem_key(tenant_id: str) -> str:
    return tenant_id


def ingest_cbom_document(
    *,
    tenant_id: str,
    document: dict[str, Any],
    source_label: str | None = None,
    verification_status: str = "unverified-source",
    actor: str = "api",
) -> dict[str, Any]:
    errors = validate_import_cbom(document)
    if errors:
        return {"ok": False, "errors": errors}

    content_hash = _content_hash(document)
    spec = str(document.get("specVersion", "1.6"))
    fmt = "cdx17" if spec == "1.7" else "cdx16"
    stype, label = infer_source_label(document, override=source_label)

    if persistence_enabled():
        return _ingest_persisted(
            tenant_id=tenant_id,
            document=document,
            content_hash=content_hash,
            fmt=fmt,
            stype=stype,
            label=label or source_label or "External CBOM",
            verification_status=verification_status,
            actor=actor,
        )
    return _ingest_memory(
        tenant_id=tenant_id,
        document=document,
        content_hash=content_hash,
        fmt=fmt,
        stype=stype,
        label=label or source_label or "External CBOM",
        verification_status=verification_status,
    )


def _ingest_persisted(
    *,
    tenant_id: str,
    document: dict[str, Any],
    content_hash: str,
    fmt: str,
    stype: str,
    label: str,
    verification_status: str,
    actor: str,
) -> dict[str, Any]:
    with db_session() as session:
        existing_job = (
            session.query(CbomIngestJobRow)
            .filter(
                CbomIngestJobRow.tenant_id == tenant_id,
                CbomIngestJobRow.content_hash == content_hash,
            )
            .one_or_none()
        )
        if existing_job:
            return {
                "ok": True,
                "idempotent": True,
                "ingestJobId": existing_job.id,
                "sourceId": existing_job.source_id,
                "componentCount": existing_job.component_count,
            }

        source = CbomSourceRow(
            id=f"src-{uuid.uuid4().hex[:12]}",
            tenant_id=tenant_id,
            source_type=stype,
            label=label,
            status="active",
            last_ingested_at=datetime.now(timezone.utc),
        )
        session.add(source)
        session.flush()

        job_id = f"ingest-{uuid.uuid4().hex[:12]}"
        components = parse_cyclonedx_document(
            document,
            source_id=source.id,
            source_type=stype,
            source_label=label,
            verification_status=verification_status,
        )
        new_count = 0
        deduped = 0
        conflict_count = 0

        for comp in components:
            key = component_dedupe_key(comp)
            row = (
                session.query(CbomComponentRow)
                .filter(CbomComponentRow.tenant_id == tenant_id, CbomComponentRow.component_key == key)
                .one_or_none()
            )
            if row is None:
                fields = normalized_to_row_fields(comp, tenant_id=tenant_id, source_id=source.id, ingest_job_id=job_id)
                session.add(CbomComponentRow(id=f"cmp-{uuid.uuid4().hex[:12]}", **fields))
                new_count += 1
                continue

            existing_norm = row_to_normalized(row)
            conflicts = detect_conflicts(existing_norm, comp)
            if conflicts:
                for c in conflicts:
                    session.add(
                        MergeConflictRow(
                            id=f"conf-{uuid.uuid4().hex[:12]}",
                            tenant_id=tenant_id,
                            component_key=key,
                            field=c["field"],
                            value_a=str(c["valueA"]),
                            value_b=str(c["valueB"]),
                            source_a=c["sourceA"],
                            source_b=c["sourceB"],
                            status="open",
                        )
                    )
                    conflict_count += 1
                    track_event(
                        "cbom_conflict_opened",
                        tenant_id=tenant_id,
                        properties={"field": c["field"]},
                    )
            else:
                deduped += 1

        session.add(
            CbomIngestJobRow(
                id=job_id,
                tenant_id=tenant_id,
                source_id=source.id,
                content_hash=content_hash,
                format=fmt,
                component_count=len(components),
                status="completed",
            )
        )

        source_id = source.id
        component_total = len(components)

    log_action(
        tenant_id=tenant_id,
        action="cbom_ingested",
        actor=actor,
        resource_id=job_id,
        detail={"sourceId": source_id, "componentCount": component_total, "conflicts": conflict_count},
    )
    track_event(
        "cbom_ingested",
        tenant_id=tenant_id,
        properties={
            "sourceType": stype,
            "format": fmt,
            "componentCount": component_total,
            "verificationStatus": verification_status,
        },
    )
    track_event(
        "cbom_merged",
        tenant_id=tenant_id,
        properties={
            "newComponents": new_count,
            "dedupedCount": deduped,
            "conflictCount": conflict_count,
        },
    )
    return {
        "ok": True,
        "idempotent": False,
        "ingestJobId": job_id,
        "sourceId": source_id,
        "componentCount": component_total,
        "newComponents": new_count,
        "dedupedCount": deduped,
        "conflictCount": conflict_count,
    }


def _ingest_memory(
    *,
    tenant_id: str,
    document: dict[str, Any],
    content_hash: str,
    fmt: str,
    stype: str,
    label: str,
    verification_status: str,
) -> dict[str, Any]:
    key = _mem_key(tenant_id)
    with _memory_lock:
        sources = _memory_sources.setdefault(key, [])
        source = {"id": f"src-{uuid.uuid4().hex[:12]}", "sourceType": stype, "label": label}
        sources.append(source)
        job_id = f"ingest-{uuid.uuid4().hex[:12]}"
        components = parse_cyclonedx_document(
            document,
            source_id=source["id"],
            source_type=stype,
            source_label=label,
            verification_status=verification_status,
        )
        comp_rows = _memory_components.setdefault(key, [])
        new_count = 0
        deduped = 0
        for comp in components:
            ckey = component_dedupe_key(comp)
            existing = next((r for r in comp_rows if r["component_key"] == ckey), None)
            if existing:
                deduped += 1
            else:
                fields = normalized_to_row_fields(comp, tenant_id=tenant_id, source_id=source["id"], ingest_job_id=job_id)
                fields["id"] = f"cmp-{uuid.uuid4().hex[:12]}"
                comp_rows.append(fields)
                new_count += 1
        _memory_jobs.setdefault(key, []).append(
            {"id": job_id, "sourceId": source["id"], "contentHash": content_hash, "componentCount": len(components)}
        )
    track_event("cbom_ingested", tenant_id=tenant_id, properties={"format": fmt, "componentCount": len(components)})
    return {
        "ok": True,
        "idempotent": False,
        "ingestJobId": job_id,
        "sourceId": source["id"],
        "componentCount": len(components),
        "newComponents": new_count,
        "dedupedCount": deduped,
        "conflictCount": 0,
    }


def ingest_scan_assets(*, tenant_id: str, assets: list[Any], source_method: str) -> int:
    """Upsert discovery assets (host/code/binary) into tenant CBOM aggregate."""
    from app.pqc.report import _asset_dict

    source_id = f"discovery-{source_method.replace(':', '-')}"
    label_map = {
        "qtangl:host-sensor": "Qtangl host sensor",
        "qtangl:code-scan": "Qtangl code scan",
        "qtangl:binary-scan": "Qtangl binary scan",
    }
    count = 0
    for asset in assets:
        if hasattr(asset, "kind"):
            asset_dict = _asset_dict(asset)
        elif isinstance(asset, dict):
            asset_dict = asset
        else:
            continue
        if asset_dict.get("kind") == "error":
            continue
        comp = normalized_from_crypto_asset(
            asset_dict,
            source_id=source_id,
            scan_id=source_id,
            source_method=source_method,
            source_label=label_map.get(source_method, "Qtangl discovery"),
        )
        if persistence_enabled():
            _upsert_component_persisted(
                tenant_id=tenant_id,
                comp=comp,
                source_id=source_id,
                ingest_job_id=f"disc-{uuid.uuid4().hex[:8]}",
            )
        else:
            _upsert_component_memory(
                tenant_id=tenant_id,
                comp=comp,
                source_id=source_id,
                ingest_job_id=f"disc-{uuid.uuid4().hex[:8]}",
            )
        count += 1
    return count


def sync_scan_to_aggregate(*, tenant_id: str, scan_id: str | None = None) -> int:
    """Upsert latest (or specified) scan assets as verified qtangl-scan components."""
    scan_id = scan_id or _latest_scan_id(tenant_id)
    if not scan_id:
        return 0
    bundle = load_scan_bundle(scan_id, tenant_id=tenant_id)
    if not bundle:
        return 0
    assets = bundle.get("assets") or []
    source_id = f"scan-{scan_id}"
    count = 0
    for asset_dict in assets:
        if asset_dict.get("kind") == "error":
            continue
        comp = normalized_from_crypto_asset(asset_dict, source_id=source_id, scan_id=scan_id)
        if persistence_enabled():
            _upsert_component_persisted(tenant_id=tenant_id, comp=comp, source_id=source_id, ingest_job_id=f"scan-sync-{scan_id}")
        else:
            _upsert_component_memory(tenant_id=tenant_id, comp=comp, source_id=source_id, ingest_job_id=f"scan-sync-{scan_id}")
        count += 1
    return count


def _latest_scan_id(tenant_id: str) -> str | None:
    jobs = list_jobs_for_tenant(tenant_id=tenant_id, limit=5)
    for job in jobs:
        if job.get("status") == "done":
            return job["scanId"]
    return None


def _upsert_component_persisted(*, tenant_id: str, comp: Any, source_id: str, ingest_job_id: str) -> None:
    key = component_dedupe_key(comp)
    with db_session() as session:
        row = (
            session.query(CbomComponentRow)
            .filter(CbomComponentRow.tenant_id == tenant_id, CbomComponentRow.component_key == key)
            .one_or_none()
        )
        fields = normalized_to_row_fields(comp, tenant_id=tenant_id, source_id=source_id, ingest_job_id=ingest_job_id)
        if row is None:
            session.add(CbomComponentRow(id=f"cmp-{uuid.uuid4().hex[:12]}", **fields))
        else:
            for attr, val in fields.items():
                if attr != "tenant_id":
                    setattr(row, attr, val)


def _upsert_component_memory(*, tenant_id: str, comp: Any, source_id: str, ingest_job_id: str) -> None:
    key = _mem_key(tenant_id)
    ckey = component_dedupe_key(comp)
    fields = normalized_to_row_fields(comp, tenant_id=tenant_id, source_id=source_id, ingest_job_id=ingest_job_id)
    with _memory_lock:
        rows = _memory_components.setdefault(key, [])
        existing = next((r for r in rows if r["component_key"] == ckey), None)
        if existing:
            existing.update(fields)
        else:
            fields["id"] = f"cmp-{uuid.uuid4().hex[:12]}"
            rows.append(fields)


def _load_components(tenant_id: str) -> list[Any]:
    if persistence_enabled():
        with db_session() as session:
            rows = session.query(CbomComponentRow).filter(CbomComponentRow.tenant_id == tenant_id).all()
            return [row_to_normalized(r) for r in rows]
    with _memory_lock:
        raw = _memory_components.get(_mem_key(tenant_id), [])

        class _Row:
            pass

        out = []
        for r in raw:
            row = _Row()
            for k, v in r.items():
                setattr(row, k, v)
            out.append(row_to_normalized(row))
        return out


def get_aggregate(*, tenant_id: str, spec_version: str = "1.6", sync_scan: bool = True) -> dict[str, Any]:
    if sync_scan:
        sync_scan_to_aggregate(tenant_id=tenant_id)
    components = _load_components(tenant_id)
    open_conflicts = list_conflicts(tenant_id=tenant_id, status="open")
    conflict_keys = {c["componentKey"] for c in open_conflicts}
    merged = [c for c in components if component_dedupe_key(c) not in conflict_keys]
    sources = list_sources(tenant_id=tenant_id)
    from app.cbom.coverage import compute_coverage_confidence

    coverage = compute_coverage_confidence(components=merged, sources=sources)
    readiness = aggregated_readiness(merged)
    readiness["coverageConfidence"] = coverage.get("score")
    readiness["coverageBand"] = coverage.get("band")
    doc = export_aggregate_cbom(merged, tenant_id=tenant_id, spec_version=spec_version)
    return {
        "tenantId": tenant_id,
        "componentCount": len(merged),
        "totalStored": len(components),
        "openConflicts": len(open_conflicts),
        "readiness": readiness,
        "coverageConfidence": coverage,
        "document": doc,
        "sources": sources,
    }


def list_sources(*, tenant_id: str) -> list[dict[str, Any]]:
    if persistence_enabled():
        with db_session() as session:
            rows = session.query(CbomSourceRow).filter(CbomSourceRow.tenant_id == tenant_id).all()
            return [
                {
                    "id": r.id,
                    "sourceType": r.source_type,
                    "label": r.label,
                    "status": r.status,
                    "lastIngestedAt": r.last_ingested_at.isoformat() if r.last_ingested_at else None,
                }
                for r in rows
            ]
    with _memory_lock:
        return list(_memory_sources.get(_mem_key(tenant_id), []))


def list_conflicts(*, tenant_id: str, status: str = "open") -> list[dict[str, Any]]:
    if persistence_enabled():
        with db_session() as session:
            rows = (
                session.query(MergeConflictRow)
                .filter(MergeConflictRow.tenant_id == tenant_id, MergeConflictRow.status == status)
                .all()
            )
            return [_conflict_dict(r) for r in rows]
    with _memory_lock:
        return [c for c in _memory_conflicts.get(_mem_key(tenant_id), []) if c.get("status") == status]


def _conflict_dict(row: MergeConflictRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "componentKey": row.component_key,
        "field": row.field,
        "valueA": row.value_a,
        "valueB": row.value_b,
        "sourceA": row.source_a,
        "sourceB": row.source_b,
        "status": row.status,
        "resolvedValue": row.resolved_value,
        "resolvedAt": row.resolved_at.isoformat() if row.resolved_at else None,
    }


def resolve_conflict(
    *,
    tenant_id: str,
    conflict_id: str,
    resolved_value: str,
    actor: str = "api",
) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = session.get(MergeConflictRow, conflict_id)
        if row is None or row.tenant_id != tenant_id:
            return None
        row.resolved_value = resolved_value
        row.status = "resolved"
        row.resolved_at = datetime.now(timezone.utc)
        comp_row = (
            session.query(CbomComponentRow)
            .filter(CbomComponentRow.tenant_id == tenant_id, CbomComponentRow.component_key == row.component_key)
            .one_or_none()
        )
        if comp_row and row.field == "algorithm":
            comp_row.algorithm = resolved_value
        elif comp_row and row.field == "keySize":
            comp_row.key_size = int(resolved_value) if resolved_value.isdigit() else None
        elif comp_row and row.field == "vulnerabilityStatus":
            comp_row.vulnerability_status = resolved_value
    log_action(tenant_id=tenant_id, action="cbom_conflict_resolved", actor=actor, resource_id=conflict_id)
    track_event("cbom_conflict_resolved", tenant_id=tenant_id, properties={"conflictId": conflict_id})
    return {"id": conflict_id, "status": "resolved", "resolvedValue": resolved_value}


def get_cbom_drift(*, tenant_id: str) -> dict[str, Any]:
    """Compare current aggregate to snapshot from previous ingest job."""
    from app.cbom.diff import diff_cbom_snapshots

    if persistence_enabled():
        with db_session() as session:
            jobs = (
                session.query(CbomIngestJobRow)
                .filter(CbomIngestJobRow.tenant_id == tenant_id)
                .order_by(CbomIngestJobRow.created_at.desc())
                .limit(2)
                .all()
            )
            if len(jobs) < 2:
                return {"available": False, "reason": "need_two_ingest_jobs"}
            prev_job, curr_job = jobs[1], jobs[0]
            prev_rows = (
                session.query(CbomComponentRow)
                .filter(CbomComponentRow.tenant_id == tenant_id, CbomComponentRow.ingest_job_id == prev_job.id)
                .all()
            )
            curr_rows = (
                session.query(CbomComponentRow)
                .filter(CbomComponentRow.tenant_id == tenant_id, CbomComponentRow.ingest_job_id == curr_job.id)
                .all()
            )
            prev = [{"componentKey": r.component_key, "algorithm": r.algorithm, "name": r.name} for r in prev_rows]
            curr = [{"componentKey": r.component_key, "algorithm": r.algorithm, "name": r.name} for r in curr_rows]
    else:
        with _memory_lock:
            jobs = sorted(_memory_jobs.get(_mem_key(tenant_id), []), key=lambda j: j.get("created_at", ""), reverse=True)
            if len(jobs) < 2:
                return {"available": False, "reason": "need_two_ingest_jobs"}
            prev_job_id, curr_job_id = jobs[1]["id"], jobs[0]["id"]
            components = _memory_components.get(_mem_key(tenant_id), [])
            prev = [c for c in components if c.get("ingest_job_id") == prev_job_id]
            curr = [c for c in components if c.get("ingest_job_id") == curr_job_id]

    drift = diff_cbom_snapshots(prev, curr)
    return {"available": True, **drift}


def post_ingest_cbom_hooks(*, tenant_id: str, ingest_result: dict[str, Any]) -> None:
    """Evaluate CBOM drift alerts and fire cbom.ingested webhooks."""
    if not ingest_result.get("ok") or ingest_result.get("idempotent"):
        return
    from app.monitoring.alerts import evaluate_cbom_alerts
    from app.notifications.webhook_store import active_webhook_urls
    from app.notifications.webhooks import notify_tenant_event
    from app.tenant.settings import get_tenant_settings_raw

    drift = get_cbom_drift(tenant_id=tenant_id)
    alerts = evaluate_cbom_alerts(drift) if drift.get("available") else []
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    signing_secret = str(settings.get("webhookSigningSecret") or "")
    urls = active_webhook_urls(tenant_id=tenant_id, event="cbom.ingested")
    if urls:
        notify_tenant_event(
            webhooks=urls,
            event="cbom.ingested",
            tenant_id=tenant_id,
            payload={
                "ingestJobId": ingest_result.get("ingestJobId"),
                "componentCount": ingest_result.get("componentCount"),
                "newComponents": ingest_result.get("newComponents"),
                "conflictCount": ingest_result.get("conflictCount"),
                "cbomDrift": drift,
                "alerts": alerts,
            },
            signing_secret=signing_secret,
        )


def parse_pem_bundle_to_document(pem_text: str) -> dict[str, Any]:
    """Build minimal CycloneDX document from PEM certificates."""
    from app.pqc.data import parse_uploaded_bundle_pem

    rows = parse_uploaded_bundle_pem(pem_text)
    components = []
    for index, row in enumerate(rows):
        components.append(
            {
                "type": "cryptographic-asset",
                "name": row.get("label") or row.get("host") or f"cert-{index}",
                "bom-ref": f"pem-{index}",
                "cryptoProperties": {
                    "assetType": "certificate",
                    "certificateProperties": {
                        "subjectName": row.get("host", ""),
                        "signatureAlgorithm": row.get("algorithm", "unknown"),
                    },
                },
                "properties": [
                    {"name": "qtangl:sourceMethod", "value": "pem-upload"},
                    {"name": "qtangl:verificationStatus", "value": "imported"},
                ],
            }
        )
    return {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "version": 1,
        "metadata": {"component": {"type": "application", "name": "qtangl-pem-upload"}},
        "components": components,
    }
