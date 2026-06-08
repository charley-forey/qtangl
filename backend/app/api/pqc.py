from __future__ import annotations

from dataclasses import asdict
import logging
import os

import json
from typing import Any

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.auth import AuthContext, require_api_key_readonly, require_auth, require_auth_admin, require_auth_readonly
from app.db.config import persistence_enabled, use_worker_queue
from app.models.api import ErrorResponse
from app.pqc.data import (
    load_dataset,
    load_handshake_trace,
    load_scenario,
    load_standards,
    parse_uploaded_bundle_csv,
    parse_uploaded_bundle_pem,
)
from app.pqc.jobs import (
    bundle_stored,
    create_job,
    get_job,
    load_scan_bundle,
    load_scan_bundle_for_public_verify,
    run_job_async,
    save_scan_bundle,
    scan_storage_diagnosis,
)
from app.pqc.pipeline import run_pqc_scan
from app.pqc.report import (
    report_to_auditor,
    report_to_board,
    report_to_cbom,
    report_to_csv,
    report_to_json,
    report_to_pdf,
)
from app.pqc.serialize import serialize_asset, serialize_bundle, serialize_handshake, serialize_scenario
from app.pqc.safety import ScanSafetyError, live_scan_enabled
from app.pqc.sessions import create_session, get_session
from app.pqc.standards import default_standards

router = APIRouter(prefix="/pqc", tags=["pqc"])
logger = logging.getLogger(__name__)


class PqcScanRequest(BaseModel):
    scenarioId: str = Field(default="bank-tls-inventory")
    useFixture: bool = Field(default=True)
    target: str | None = None
    seed: int = Field(default=1234)
    bundleSessionId: str | None = None
    depth: str = Field(default="standard", pattern="^(standard|lite)$")


class VerifyReportRequest(BaseModel):
    reportJson: dict[str, Any]


class CbomIngestRequest(BaseModel):
    document: dict[str, Any]
    sourceLabel: str | None = None
    verificationStatus: str = Field(default="unverified-source")


class CbomConflictResolveRequest(BaseModel):
    resolvedValue: str


class PqcHandshakeRequest(BaseModel):
    useFixture: bool = Field(default=True)


def _report_formats() -> list[str]:
    return ["json", "csv", "cbom", "pdf", "bundle", "executive", "board", "auditor"]


def _report_meta(*, report_available: bool, missing_reason: str | None = None) -> dict[str, Any]:
    return {
        "reportAvailable": report_available,
        "availableFormats": _report_formats() if report_available else [],
        "missingReason": missing_reason,
    }


def _report_meta_for_scan(scan_id: str, *, tenant_id: str) -> dict[str, Any]:
    if bundle_stored(scan_id, tenant_id=tenant_id):
        return _report_meta(report_available=True)
    return _report_meta(
        report_available=False,
        missing_reason="bundle_not_persisted",
    )


def _scan_outcome(bundle_payload: dict[str, Any] | None) -> str:
    if not bundle_payload:
        return "unknown"
    assets = bundle_payload.get("assets") or []
    coverage = bundle_payload.get("scanCoverage") or []
    if not assets and coverage:
        return "target_unreachable"
    if not assets:
        return "no_assets_found"
    if coverage:
        return "partial_assets"
    return "assets_found"


@router.get("/inventory", responses={401: {"model": ErrorResponse}})
def get_inventory(_token: str = Depends(require_api_key_readonly)) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "summary": "PQC crypto asset inventory fixture loaded.",
        "inventory": [serialize_asset(asset) for asset in dataset.inventory],
    }


@router.get("/scenarios", responses={401: {"model": ErrorResponse}})
def get_scenarios(_token: str = Depends(require_api_key_readonly)) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "scenarios": [serialize_scenario(scenario) for scenario in dataset.scenarios],
    }


@router.get("/target", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def get_target(
    scenarioId: str = "bank-tls-inventory",
    _token: str = Depends(require_api_key_readonly),
) -> dict:
    try:
        scenario = load_scenario(scenarioId)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return {
        "status": "success",
        "target": asdict(scenario.target),
        "scenario": serialize_scenario(scenario),
    }


@router.get("/handshake-trace", responses={401: {"model": ErrorResponse}})
def get_handshake_trace(_token: str = Depends(require_api_key_readonly)) -> dict:
    trace = load_handshake_trace()
    return {"status": "success", "trace": serialize_handshake(trace)}


@router.get("/standards", responses={401: {"model": ErrorResponse}})
def get_standards(_token: str = Depends(require_api_key_readonly)) -> dict:
    try:
        standards = load_standards()
    except Exception:
        standards = default_standards()
    return {"status": "success", "standards": standards}


@router.post("/upload-bundle", responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
async def upload_bundle(
    file: UploadFile = File(...),
    auth: AuthContext = Depends(require_auth),
) -> dict:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Upload a file.")

    payload = await file.read()
    text = payload.decode("utf-8", errors="replace")
    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            rows = parse_uploaded_bundle_csv(text)
        elif filename.endswith(".json"):
            from app.pqc.cloud_import import parse_cloud_inventory

            rows = parse_cloud_inventory(text, filename=filename)
            if not rows:
                raise ValueError("No cloud certificates found in JSON export.")
        elif filename.endswith(".pem") or "begin certificate" in text.lower():
            rows = parse_uploaded_bundle_pem(text)
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Upload CSV endpoints, PEM certs, or cloud PKI JSON (ACM/Key Vault/K8s).",
            )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    session_id = create_session(rows, tenant_id=auth.tenant_id)
    return {
        "status": "success",
        "sessionId": session_id,
        "summary": f"Validated {len(rows)} bundle entries and stored them in a 24-hour session.",
    }


@router.post("/scan", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def scan_pqc(
    request: PqcScanRequest,
    auth: AuthContext = Depends(require_auth),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict:
    from app.billing.entitlements import check_scan_quota
    from app.store.idempotency import cache_scan_id, get_cached_scan_id

    if idempotency_key:
        cached = get_cached_scan_id(tenant_id=auth.tenant_id, idempotency_key=idempotency_key)
        if cached:
            job = get_job(cached, tenant_id=auth.tenant_id)
            if job is not None:
                if job.status == "running":
                    return {
                        "status": "running",
                        "scanId": cached,
                        "summary": "Duplicate request — returning existing in-flight scan.",
                        **_report_meta(report_available=False, missing_reason="scan_running"),
                    }
                bundle_dict = load_scan_bundle(cached, tenant_id=auth.tenant_id)
                if bundle_dict:
                    return {
                        "status": "success",
                        **bundle_dict,
                        "scanOutcome": _scan_outcome(bundle_dict),
                        **_report_meta_for_scan(cached, tenant_id=auth.tenant_id),
                    }

    quota_error = check_scan_quota(tenant_id=auth.tenant_id)
    if quota_error:
        from app.telemetry.events import track_event

        track_event("tier_upgrade_clicked", tenant_id=auth.tenant_id, properties=quota_error)
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=quota_error,
        )
    dataset = load_dataset()
    uploaded_rows = None
    if request.bundleSessionId:
        uploaded_rows = get_session(request.bundleSessionId, tenant_id=auth.tenant_id)
        if uploaded_rows is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uploaded bundle session not found or expired.",
            )

    try:
        if request.useFixture:
            bundle = run_pqc_scan(
                dataset,
                scenario_id=request.scenarioId,
                use_fixture=True,
                target_override=request.target,
                uploaded_rows=uploaded_rows,
                seed=request.seed,
                depth=request.depth,
            )
            save_scan_bundle(bundle.scan_id, bundle, tenant_id=auth.tenant_id)
            if idempotency_key:
                cache_scan_id(
                    tenant_id=auth.tenant_id,
                    idempotency_key=idempotency_key,
                    scan_id=bundle.scan_id,
                )
            payload = serialize_bundle(bundle)
            return {
                "status": "success",
                **payload,
                "scanOutcome": _scan_outcome(payload),
                **_report_meta_for_scan(bundle.scan_id, tenant_id=auth.tenant_id),
            }

        if not live_scan_enabled():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Live PQC scanning is disabled on this deployment. "
                    "Set QTANGL_PQC_ENABLE_LIVE_SCAN=true or use fixture mode."
                ),
            )

        def run_live(on_progress=None):
            return run_pqc_scan(
                dataset,
                scenario_id=request.scenarioId,
                use_fixture=False,
                target_override=request.target,
                uploaded_rows=uploaded_rows,
                seed=request.seed,
                on_progress=on_progress,
                depth=request.depth,
            )

        # Single-process deploys (Railway default: inline jobs) run synchronously so the
        # client does not poll — live scans can exceed 24s when probing many endpoints.
        if not use_worker_queue():
            bundle = run_live()
            save_scan_bundle(bundle.scan_id, bundle, tenant_id=auth.tenant_id)
            if idempotency_key:
                cache_scan_id(
                    tenant_id=auth.tenant_id,
                    idempotency_key=idempotency_key,
                    scan_id=bundle.scan_id,
                )
            payload = serialize_bundle(bundle)
            return {
                "status": "success",
                **payload,
                "scanOutcome": _scan_outcome(payload),
                **_report_meta_for_scan(bundle.scan_id, tenant_id=auth.tenant_id),
            }

        scan_id = create_job(
            tenant_id=auth.tenant_id,
            payload={
                "scenarioId": request.scenarioId,
                "target": request.target,
                "seed": request.seed,
                "bundleSessionId": request.bundleSessionId,
                "tenantId": auth.tenant_id,
                "depth": request.depth,
            },
        )

        def runner(on_progress):
            return run_live(on_progress=on_progress)

        run_job_async(scan_id, runner, tenant_id=auth.tenant_id)
        if idempotency_key:
            cache_scan_id(tenant_id=auth.tenant_id, idempotency_key=idempotency_key, scan_id=scan_id)
        return {
            "status": "running",
            "scanId": scan_id,
            "summary": "Live PQC scan started. Poll GET /pqc/scan/{scanId} for progress.",
            **_report_meta(report_available=False, missing_reason="scan_running"),
        }
    except HTTPException:
        raise
    except StopIteration as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown PQC scenario: {request.scenarioId}",
        ) from exc
    except ScanSafetyError as exc:
        logger.warning("pqc_scan_safety_block tenant_id=%s target=%s detail=%s", auth.tenant_id, request.target, exc)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception(
            "pqc_scan_error tenant_id=%s scenario=%s target=%s",
            auth.tenant_id,
            request.scenarioId,
            request.target,
        )
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/scan/{scan_id}", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def get_scan_status(
    scan_id: str,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    try:
        return _get_scan_status_payload(scan_id, tenant_id=auth.tenant_id)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("get_scan_status failed scan_id=%s tenant_id=%s", scan_id, auth.tenant_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load scan status: {exc}",
        ) from exc


def _get_scan_status_payload(scan_id: str, *, tenant_id: str) -> dict:
    job = get_job(scan_id, tenant_id=tenant_id)
    if job:
        if job.status == "running":
            return {
                "status": "running",
                "scanId": scan_id,
                "timeline": [asdict(event) for event in job.timeline],
                "scanOutcome": "running",
                **_report_meta(report_available=False, missing_reason="scan_running"),
            }
        if job.status == "error":
            return {
                "status": "error",
                "scanId": scan_id,
                "message": job.error,
                "timeline": [asdict(event) for event in job.timeline],
                "scanOutcome": "failed",
                **_report_meta(report_available=False, missing_reason="scan_failed"),
            }
        if job.bundle:
            payload = serialize_bundle(job.bundle)
            return {
                "status": "success",
                **payload,
                "scanOutcome": _scan_outcome(payload),
                **_report_meta_for_scan(scan_id, tenant_id=tenant_id),
            }

    cached = load_scan_bundle(scan_id, tenant_id=tenant_id)
    if cached:
        return {
            "status": "success",
            **cached,
            "scanOutcome": _scan_outcome(cached),
            **_report_meta_for_scan(scan_id, tenant_id=tenant_id),
        }

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")


@router.post("/handshake/prove", responses={401: {"model": ErrorResponse}})
def prove_handshake_endpoint(
    request: PqcHandshakeRequest,
    _auth: AuthContext = Depends(require_auth),
) -> dict:
    from app.pqc.handshake import prove_handshake

    proof = prove_handshake(use_fixture=request.useFixture)
    return {"status": "success", "proof": serialize_handshake(proof)}


@router.get("/report/{scan_id}", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def download_report(
    scan_id: str,
    format: str = Query(default="json", alias="format"),
    auth: AuthContext = Depends(require_auth_readonly),
) -> Response:
    job = get_job(scan_id, tenant_id=auth.tenant_id)
    bundle = job.bundle if job and job.bundle else None
    if bundle is None:
        payload = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
        if payload is None and auth.tenant_id == "sandbox":
            payload = load_scan_bundle_for_public_verify(scan_id)
        if payload:
            from app.pqc.bundle_codec import bundle_from_api_dict

            bundle = bundle_from_api_dict(payload)
    if bundle is None:
        logger.warning(
            "pqc_report_missing scan_id=%s tenant_id=%s reason=bundle_not_found",
            scan_id,
            auth.tenant_id,
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found for scan.",
            headers={"X-Qtangl-Report-Missing-Reason": "bundle_not_found"},
        )

    report = bundle.report
    fmt = format.lower()
    if fmt == "json":
        body = report_to_json(report)
        return Response(content=__import__("json").dumps(body), media_type="application/json")
    if fmt == "csv":
        return Response(content=report_to_csv(report), media_type="text/csv")
    if fmt == "cbom":
        body = report_to_cbom(report)
        return Response(content=__import__("json").dumps(body), media_type="application/json")
    if fmt == "pdf":
        pdf_bytes = report_to_pdf(report)
        media_type = "application/pdf" if pdf_bytes[:4] == b"%PDF" else "application/json"
        return Response(content=pdf_bytes, media_type=media_type)
    if fmt == "bundle" or fmt == "evidence":
        from app.pqc.report_bundle import build_evidence_bundle

        content = build_evidence_bundle(report)
        return Response(
            content=content,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{scan_id}-evidence.zip"'},
        )
    if fmt == "executive":
        from app.pqc.report import report_to_executive

        body = report_to_executive(report)
        return Response(content=__import__("json").dumps(body), media_type="application/json")
    if fmt == "board":
        body = report_to_board(report)
        return Response(content=__import__("json").dumps(body), media_type="application/json")
    if fmt == "auditor":
        body = report_to_auditor(report)
        return Response(content=__import__("json").dumps(body), media_type="application/json")
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="format must be json|csv|cbom|pdf|bundle|evidence|executive|board|auditor",
    )


@router.post("/scan/{scan_id}/persist", responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
def persist_scan_bundle(
    scan_id: str,
    body: dict[str, Any],
    auth: AuthContext = Depends(require_auth),
) -> dict:
    """Store the scan bundle from the client when DB/worker persistence did not complete."""
    body_scan_id = body.get("scanId")
    if body_scan_id and str(body_scan_id) != scan_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="scanId in body does not match path",
        )
    from app.pqc.bundle_codec import bundle_from_api_dict

    try:
        bundle = bundle_from_api_dict(body)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid scan bundle: {exc}",
        ) from exc
    save_scan_bundle(scan_id, bundle, tenant_id=auth.tenant_id)
    logger.info("persist_scan_bundle scan_id=%s tenant_id=%s", scan_id, auth.tenant_id)
    return {
        "status": "success",
        "scanId": scan_id,
        **_report_meta_for_scan(scan_id, tenant_id=auth.tenant_id),
    }


@router.get("/report/{scan_id}/availability", responses={401: {"model": ErrorResponse}})
def report_availability(
    scan_id: str,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    diagnosis = scan_storage_diagnosis(scan_id, tenant_id=auth.tenant_id)
    if diagnosis is None:
        return {"status": "success", "scanId": scan_id, **_report_meta(report_available=True)}

    job = get_job(scan_id, tenant_id=auth.tenant_id)
    if job and job.status == "running":
        return {
            "status": "success",
            "scanId": scan_id,
            **_report_meta(report_available=False, missing_reason="scan_running"),
        }
    if job and job.status == "error":
        return {
            "status": "success",
            "scanId": scan_id,
            **_report_meta(report_available=False, missing_reason="scan_failed"),
        }

    if diagnosis == "scan_not_found" and auth.tenant_id == "sandbox":
        if load_scan_bundle_for_public_verify(scan_id):
            return {"status": "success", "scanId": scan_id, **_report_meta(report_available=True)}

    missing_reason = diagnosis
    if diagnosis == "scan_not_found":
        missing_reason = "scan_not_found"
    elif diagnosis == "wrong_tenant":
        missing_reason = "wrong_tenant"

    return {
        "status": "success",
        "scanId": scan_id,
        **_report_meta(report_available=False, missing_reason=missing_reason),
    }


def _dispatch_verify_webhook(
    *,
    scan_id: str,
    valid: bool,
    readiness_band: str,
    target_domain: str,
) -> None:
    from app.notifications.webhook_store import active_webhook_urls
    from app.notifications.webhooks import notify_tenant_event
    from app.store.scan_jobs import get_scan_tenant_id
    from app.tenant.settings import get_tenant_settings_raw

    tenant_id = get_scan_tenant_id(scan_id) or "sandbox"
    urls = active_webhook_urls(tenant_id=tenant_id, event="report.verified")
    if not urls:
        return
    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    notify_tenant_event(
        webhooks=urls,
        event="report.verified",
        tenant_id=tenant_id,
        payload={
            "scanId": scan_id,
            "valid": valid,
            "readinessBand": readiness_band,
            "targetDomain": target_domain,
            "verifyUrl": f"{base}/verify?scanId={scan_id}",
        },
        signing_secret=str(settings.get("webhookSigningSecret") or ""),
    )


@router.get("/verify/{scan_id}", responses={404: {"model": ErrorResponse}})
def verify_report(scan_id: str, request: Request) -> dict:
    """Public verification: recompute content hash and verify signature."""
    from app.api.public_rate_limit import enforce_public_rate_limit
    from app.store.scan_jobs import load_scan_bundle_for_public_verify

    enforce_public_rate_limit(request)

    payload = load_scan_bundle_for_public_verify(scan_id)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")

    from app.pqc.bundle_codec import bundle_from_api_dict
    from app.pqc.signing import verify_report_signature
    from app.pqc.transparency import log_inclusion_block
    from app.telemetry.events import track_event

    bundle = bundle_from_api_dict(payload)
    report_json = report_to_json(bundle.report)
    signature = report_json.get("signature") or bundle.report.signature or {}
    result = verify_report_signature(report_json, signature)
    content_hash = result.get("contentHash") or signature.get("contentHash")
    log_inclusion = log_inclusion_block(str(content_hash)) if content_hash else None
    if log_inclusion:
        result["logInclusion"] = log_inclusion
    track_event(
        "report_verified",
        properties={"scanId": scan_id, "valid": result.get("valid"), "source": "public_verify"},
    )
    _dispatch_verify_webhook(
        scan_id=scan_id,
        valid=bool(result.get("valid")),
        readiness_band=bundle.report.readiness_band,
        target_domain=bundle.report.target_domain,
    )
    return {
        "status": "success",
        "scanId": scan_id,
        "verifySpecVersion": result.get("verifySpecVersion"),
        "verification": result,
        "readinessBand": bundle.report.readiness_band,
        "targetDomain": bundle.report.target_domain,
    }


@router.post("/verify", responses={422: {"model": ErrorResponse}})
def verify_report_json(body: VerifyReportRequest, request: Request) -> dict:
    """Verify pasted report JSON + signature block."""
    from app.api.public_rate_limit import enforce_public_rate_limit

    enforce_public_rate_limit(request)
    from app.pqc.signing import verify_report_signature
    from app.pqc.transparency import log_inclusion_block
    from app.telemetry.events import track_event

    report_json = dict(body.reportJson)
    signature = report_json.pop("signature", {}) or {}
    result = verify_report_signature(report_json, signature)
    content_hash = result.get("contentHash") or signature.get("contentHash")
    log_inclusion = log_inclusion_block(str(content_hash)) if content_hash else None
    if log_inclusion:
        result["logInclusion"] = log_inclusion
    track_event(
        "report_verified",
        properties={
            "scanId": report_json.get("scanId"),
            "valid": result.get("valid"),
            "source": "paste_verify",
        },
    )
    scan_id = str(report_json.get("scanId") or "")
    if scan_id:
        _dispatch_verify_webhook(
            scan_id=scan_id,
            valid=bool(result.get("valid")),
            readiness_band=str(report_json.get("readinessBand") or ""),
            target_domain=str(report_json.get("targetDomain") or ""),
        )
    return {"status": "success", "verifySpecVersion": result.get("verifySpecVersion"), "verification": result}


@router.get("/index")
def readiness_index(request: Request, industry: str = "financial") -> dict:
    """Published Readiness Index snapshot (public, rate-limited)."""
    from app.api.public_rate_limit import enforce_public_rate_limit
    from app.data.benchmarks import readiness_index_snapshot

    enforce_public_rate_limit(request)
    snapshot = readiness_index_snapshot(industry=industry)
    return {"status": "success", "index": snapshot}


@router.get("/transparency/consistency")
def transparency_consistency(request: Request, from_seq: int = 0, to_seq: int = 0) -> dict:
    from app.api.public_rate_limit import enforce_public_rate_limit
    from app.pqc.transparency import consistency_proof

    enforce_public_rate_limit(request)
    proof = consistency_proof(from_seq=from_seq, to_seq=to_seq)
    if proof is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consistency proof unavailable.")
    return {"status": "success", "consistency": proof}


class WitnessSubmitRequest(BaseModel):
    witnessId: str
    rootHash: str
    seq: int
    alg: str
    signatureB64: str
    publicKeyB64: str


@router.get("/transparency/witnesses")
def transparency_witnesses(request: Request) -> dict:
    from app.api.public_rate_limit import enforce_public_rate_limit
    from app.db.engine import db_session
    from app.db.models import WitnessCosignature

    enforce_public_rate_limit(request)
    try:
        with db_session() as session:
            rows = session.query(WitnessCosignature).order_by(WitnessCosignature.observed_at.desc()).limit(50).all()
            witnesses = [
                {
                    "witnessId": r.witness_id,
                    "rootHash": r.root_hash,
                    "seq": r.seq,
                    "alg": r.alg,
                    "observedAt": r.observed_at.isoformat() if r.observed_at else None,
                }
                for r in rows
            ]
    except Exception:
        witnesses = []
    return {"status": "success", "witnesses": witnesses}


@router.post("/transparency/witness")
def transparency_witness_submit(body: WitnessSubmitRequest, request: Request) -> dict:
    from app.api.public_rate_limit import enforce_public_rate_limit
    from app.db.engine import db_session
    from app.db.models import WitnessCosignature
    import uuid
    from datetime import datetime, timezone

    enforce_public_rate_limit(request)
    with db_session() as session:
        row = WitnessCosignature(
            id=f"witness-{uuid.uuid4().hex[:16]}",
            witness_id=body.witnessId,
            root_hash=body.rootHash,
            seq=body.seq,
            alg=body.alg,
            signature_b64=body.signatureB64,
            public_key_b64=body.publicKeyB64,
            observed_at=datetime.now(timezone.utc),
        )
        session.add(row)
    return {"status": "success", "witnessId": body.witnessId}


@router.get("/transparency/root")
def transparency_root(request: Request) -> dict:
    """Current append-only transparency log root (hashes only; no PII)."""
    from app.api.public_rate_limit import enforce_public_rate_limit
    from app.pqc.transparency import current_root

    enforce_public_rate_limit(request)
    return {"status": "success", "log": current_root()}


@router.get("/transparency/keys")
def transparency_keys(request: Request) -> dict:
    """Public signing key history for offline verification."""
    from app.api.public_rate_limit import enforce_public_rate_limit
    from app.pqc.key_registry import list_public_signing_keys

    enforce_public_rate_limit(request)
    return {"status": "success", "keys": list_public_signing_keys()}


@router.get("/transparency/{content_hash}")
def transparency_inclusion(content_hash: str, request: Request) -> dict:
    """Inclusion proof for a report content hash."""
    from app.api.public_rate_limit import enforce_public_rate_limit
    from app.pqc.transparency import inclusion_proof

    enforce_public_rate_limit(request)

    proof = inclusion_proof(content_hash.lower().strip())
    if proof is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hash not in log.")
    return {"status": "success", "inclusion": proof}


_CBOM_MAX_BYTES = 25 * 1024 * 1024


@router.post("/cbom/ingest", responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
async def cbom_ingest(request: Request, auth: AuthContext = Depends(require_auth)) -> dict:
    """Ingest a third-party CycloneDX CBOM (1.6/1.7) into the tenant aggregate."""
    from app.cbom.service import ingest_cbom_document

    content_type = request.headers.get("content-type", "")
    document: dict[str, Any] | None = None
    source_label: str | None = None
    verification_status = "unverified-source"

    if "multipart/form-data" in content_type:
        form = await request.form()
        upload = form.get("file")
        if upload is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Missing file field.")
        raw = await upload.read()  # type: ignore[union-attr]
        if len(raw) > _CBOM_MAX_BYTES:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="CBOM exceeds 25MB limit.")
        filename = getattr(upload, "filename", "") or ""
        text = raw.decode("utf-8", errors="replace")
        if filename.lower().endswith((".pem", ".crt", ".cer")) or "BEGIN CERTIFICATE" in text:
            from app.cbom.service import parse_pem_bundle_to_document

            document = parse_pem_bundle_to_document(text)
            source_label = source_label or "PEM certificate upload"
            verification_status = "imported"
        else:
            document = json.loads(text)
        if form.get("sourceLabel"):
            source_label = str(form.get("sourceLabel"))
    else:
        payload = await request.json()
        if "document" in payload:
            document = payload["document"]
            source_label = payload.get("sourceLabel")
            verification_status = payload.get("verificationStatus") or "unverified-source"
        else:
            document = payload

    if document is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="CBOM document required.")

    result = ingest_cbom_document(
        tenant_id=auth.tenant_id,
        document=document,
        source_label=source_label,
        verification_status=verification_status,
        actor=auth.tenant_id,
    )
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": result.get("errors", [])},
        )
    from app.cbom.service import post_ingest_cbom_hooks

    post_ingest_cbom_hooks(tenant_id=auth.tenant_id, ingest_result=result)
    return {"status": "success", **result}


@router.get("/cbom/sources", responses={401: {"model": ErrorResponse}})
def cbom_sources(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.cbom.service import list_sources

    return {"status": "success", "sources": list_sources(tenant_id=auth.tenant_id)}


@router.get("/cbom/aggregate", responses={401: {"model": ErrorResponse}})
def cbom_aggregate(
    auth: AuthContext = Depends(require_auth_readonly),
    format: str | None = Query(default=None, alias="format"),
) -> dict:
    from app.cbom.service import get_aggregate
    from app.telemetry.events import track_event

    spec = "1.7" if format == "cdx17" else "1.6"
    aggregate = get_aggregate(tenant_id=auth.tenant_id, spec_version=spec)
    if format in {"cdx16", "cdx17"}:
        track_event(
            "aggregated_cbom_exported",
            tenant_id=auth.tenant_id,
            properties={"format": format, "verifiedPct": aggregate["readiness"].get("verifiedPct")},
        )
        return {"status": "success", "document": aggregate["document"]}
    return {"status": "success", "aggregate": aggregate}


@router.get("/cbom/conflicts", responses={401: {"model": ErrorResponse}})
def cbom_conflicts(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.cbom.service import list_conflicts

    return {"status": "success", "conflicts": list_conflicts(tenant_id=auth.tenant_id, status="open")}


@router.put("/cbom/conflicts/{conflict_id}", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def cbom_resolve_conflict(
    conflict_id: str,
    body: CbomConflictResolveRequest,
    auth: AuthContext = Depends(require_auth),
) -> dict:
    from app.cbom.service import resolve_conflict

    result = resolve_conflict(
        tenant_id=auth.tenant_id,
        conflict_id=conflict_id,
        resolved_value=body.resolvedValue,
        actor=auth.tenant_id,
    )
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conflict not found.")
    return {"status": "success", **result}


@router.get("/cbom/diff", responses={401: {"model": ErrorResponse}})
def cbom_diff(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.cbom.service import get_cbom_drift

    return {"status": "success", "drift": get_cbom_drift(tenant_id=auth.tenant_id)}


@router.post("/cbom/pull/{provider}", responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
def cbom_cloud_pull(provider: str, auth: AuthContext = Depends(require_auth)) -> dict:
    from app.integrations.cloud import pull_cloud_inventory
    from app.cbom.service import ingest_cbom_document
    from app.telemetry.events import track_event

    pull = pull_cloud_inventory(tenant_id=auth.tenant_id, provider=provider.lower())
    if not pull.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=pull.get("reason", "cloud_pull_failed"),
        )
    document = pull["document"]
    result = ingest_cbom_document(
        tenant_id=auth.tenant_id,
        document=document,
        source_label=f"{provider.upper()} read-only pull",
        verification_status="imported",
        actor=auth.tenant_id,
    )
    track_event(
        "cloud_pull_completed",
        tenant_id=auth.tenant_id,
        properties={
            "provider": provider,
            "assetCount": pull.get("componentCount", 0),
            "partial": pull.get("status") == "partial",
        },
    )
    if not result.get("ok"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=result.get("errors"))
    from app.cbom.service import post_ingest_cbom_hooks

    post_ingest_cbom_hooks(tenant_id=auth.tenant_id, ingest_result=result)
    return {"status": "success", "pull": pull, "ingest": result}


class RetireKeyRequest(BaseModel):
    keyFingerprint: str


@router.post("/transparency/keys/retire", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def retire_signing_key_endpoint(
    body: RetireKeyRequest,
    auth: AuthContext = Depends(require_auth_admin),
) -> dict:
    from app.pqc.key_registry import retire_signing_key

    if not retire_signing_key(key_fingerprint=body.keyFingerprint):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Key not found.")
    return {"status": "success", "keyFingerprint": body.keyFingerprint, "retired": True}
