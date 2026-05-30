from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.auth import require_api_key
from app.models.api import ErrorResponse
from app.pqc.data import (
    load_dataset,
    load_handshake_trace,
    load_scenario,
    load_standards,
    parse_uploaded_bundle_csv,
    parse_uploaded_bundle_pem,
)
from app.pqc.jobs import create_job, get_job, run_job_async
from app.pqc.pipeline import run_pqc_scan
from app.pqc.report import report_to_cbom, report_to_csv, report_to_json, report_to_pdf
from app.pqc.serialize import serialize_asset, serialize_bundle, serialize_handshake, serialize_scenario
from app.pqc.safety import ScanSafetyError, live_scan_enabled
from app.pqc.sessions import create_session, get_session
from app.pqc.standards import default_standards

router = APIRouter(prefix="/pqc", tags=["pqc"])

_report_cache: dict[str, dict] = {}


class PqcScanRequest(BaseModel):
    scenarioId: str = Field(default="bank-tls-inventory")
    useFixture: bool = Field(default=True)
    target: str | None = None
    seed: int = Field(default=1234)
    bundleSessionId: str | None = None
    depth: str | None = Field(default="standard")


class PqcHandshakeRequest(BaseModel):
    useFixture: bool = Field(default=True)


@router.get("/inventory", responses={401: {"model": ErrorResponse}})
def get_inventory(_token: str = Depends(require_api_key)) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "summary": "PQC crypto asset inventory fixture loaded.",
        "inventory": [serialize_asset(asset) for asset in dataset.inventory],
    }


@router.get("/scenarios", responses={401: {"model": ErrorResponse}})
def get_scenarios(_token: str = Depends(require_api_key)) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "scenarios": [serialize_scenario(scenario) for scenario in dataset.scenarios],
    }


@router.get("/target", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def get_target(
    scenarioId: str = "bank-tls-inventory",
    _token: str = Depends(require_api_key),
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
def get_handshake_trace(_token: str = Depends(require_api_key)) -> dict:
    trace = load_handshake_trace()
    return {"status": "success", "trace": serialize_handshake(trace)}


@router.get("/standards", responses={401: {"model": ErrorResponse}})
def get_standards(_token: str = Depends(require_api_key)) -> dict:
    try:
        standards = load_standards()
    except Exception:
        standards = default_standards()
    return {"status": "success", "standards": standards}


@router.post("/upload-bundle", responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
async def upload_bundle(
    file: UploadFile = File(...),
    _token: str = Depends(require_api_key),
) -> dict:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Upload a file.")

    payload = await file.read()
    text = payload.decode("utf-8", errors="replace")
    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            rows = parse_uploaded_bundle_csv(text)
        elif filename.endswith(".pem") or "begin certificate" in text.lower():
            rows = parse_uploaded_bundle_pem(text)
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Upload a CSV endpoint list or PEM certificate bundle.",
            )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    session_id = create_session(rows)
    return {
        "status": "success",
        "sessionId": session_id,
        "summary": f"Validated {len(rows)} bundle entries and stored them in a 24-hour session.",
    }


@router.post("/scan", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def scan_pqc(
    request: PqcScanRequest,
    _token: str = Depends(require_api_key),
) -> dict:
    dataset = load_dataset()
    uploaded_rows = None
    if request.bundleSessionId:
        uploaded_rows = get_session(request.bundleSessionId)
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
            )
            _report_cache[bundle.scan_id] = {"bundle": bundle}
            return {"status": "success", **serialize_bundle(bundle)}

        if not live_scan_enabled():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Live PQC scanning is disabled on this deployment. "
                    "Set QTANGL_PQC_ENABLE_LIVE_SCAN=true or use fixture mode."
                ),
            )

        scan_id = create_job()

        def runner(on_progress):
            return run_pqc_scan(
                dataset,
                scenario_id=request.scenarioId,
                use_fixture=False,
                target_override=request.target,
                uploaded_rows=uploaded_rows,
                seed=request.seed,
                on_progress=on_progress,
            )

        run_job_async(scan_id, runner)
        return {
            "status": "running",
            "scanId": scan_id,
            "summary": "Live PQC scan started. Poll GET /pqc/scan/{scanId} for progress.",
        }
    except HTTPException:
        raise
    except StopIteration as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown PQC scenario: {request.scenarioId}",
        ) from exc
    except ScanSafetyError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/scan/{scan_id}", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def get_scan_status(
    scan_id: str,
    _token: str = Depends(require_api_key),
) -> dict:
    job = get_job(scan_id)
    if job:
        if job.status == "running":
            return {
                "status": "running",
                "scanId": scan_id,
                "timeline": [asdict(event) for event in job.timeline],
            }
        if job.status == "error":
            return {"status": "error", "scanId": scan_id, "message": job.error, "timeline": [asdict(event) for event in job.timeline]}
        if job.bundle:
            _report_cache[scan_id] = {"bundle": job.bundle}
            return {"status": "success", **serialize_bundle(job.bundle)}

    cached = _report_cache.get(scan_id)
    if cached and cached.get("bundle"):
        return {"status": "success", **serialize_bundle(cached["bundle"])}

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")


@router.post("/handshake/prove", responses={401: {"model": ErrorResponse}})
def prove_handshake_endpoint(
    request: PqcHandshakeRequest,
    _token: str = Depends(require_api_key),
) -> dict:
    from app.pqc.handshake import prove_handshake

    proof = prove_handshake(use_fixture=request.useFixture)
    return {"status": "success", "proof": serialize_handshake(proof)}


@router.get("/report/{scan_id}", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def download_report(
    scan_id: str,
    format: str = Query(default="json", alias="format"),
    _token: str = Depends(require_api_key),
) -> Response:
    cached = _report_cache.get(scan_id)
    job = get_job(scan_id)
    bundle = cached["bundle"] if cached else (job.bundle if job else None)
    if bundle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found for scan.")

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
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="format must be json|csv|cbom|pdf")
