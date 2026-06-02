from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.auth import get_rate_limit
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from app.api.public import router as public_router
from app.api.admin import router as admin_router
from app.api.airline import router as airline_router
from app.api.ev_fleet import router as ev_fleet_router
from app.api.hospital import router as hospital_router
from app.api.optimize import router as optimize_router
from app.api.pqc import router as pqc_router
from app.api.tenant import router as tenant_router
from app.db.config import inline_jobs, persistence_enabled, redis_enabled, use_worker_queue
from app.db.engine import init_db, ping_db
from app.pqc.report import report_to_json
from app.queue.redis_queue import ping as ping_redis

DEFAULT_CORS_ORIGINS = (
    "https://www.qtangl.com",
    "https://qtangl.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)

CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = [
    "Authorization",
    "Content-Type",
    "X-Api-Key",
    "X-Request-Id",
    "Accept",
]

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


def cors_origins() -> list[str]:
    raw = os.getenv("QTANGL_CORS_ORIGINS")
    if not raw:
        return list(DEFAULT_CORS_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def cors_headers_for_request(request: Request) -> dict[str, str]:
    """Attach CORS on error responses (custom handlers bypass middleware in some stacks)."""
    import re

    origin = request.headers.get("origin")
    if not origin:
        return {}
    allowed = set(cors_origins())
    regex = os.getenv("QTANGL_CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app")
    if origin not in allowed and not (regex and re.fullmatch(regex, origin)):
        return {}
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
    }


app = FastAPI(
    title="Qtangl PQC Readiness API",
    version="0.1.0",
    summary="Post-quantum readiness platform: Assess, Monitor, Convert with signed evidence.",
    lifespan=lifespan,
)


class RateLimitHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        limit = get_rate_limit()
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Window"] = "60"
        return response


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        import uuid

        request_id = request.headers.get("X-Request-Id") or f"req-{uuid.uuid4().hex[:16]}"
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        return response


app.add_middleware(RequestIdMiddleware)
app.add_middleware(RateLimitHeaderMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_origin_regex=os.getenv("QTANGL_CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app"),
    allow_credentials=True,
    allow_methods=CORS_ALLOW_METHODS,
    allow_headers=CORS_ALLOW_HEADERS,
)

app.include_router(optimize_router)
app.include_router(hospital_router)
app.include_router(airline_router)
app.include_router(ev_fleet_router)
app.include_router(pqc_router)
app.include_router(tenant_router)
app.include_router(admin_router)
app.include_router(public_router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready", tags=["health"])
def health_ready() -> dict[str, object]:
    from app.monitoring.scheduler_state import scheduler_metrics

    db_ok = ping_db() if persistence_enabled() else True
    redis_ok = ping_redis() if redis_enabled() else True
    ready = db_ok and redis_ok
    metrics = scheduler_metrics()
    stale = False
    last_tick = metrics.get("lastTickAt")
    interval = float(metrics.get("intervalSec") or 60)
    if metrics.get("schedulerEnabled") and last_tick:
        import time

        stale = (time.time() - float(last_tick)) > (interval * 2)
    return {
        "status": "ready" if ready and not stale else "degraded",
        "database": db_ok,
        "redis": redis_ok,
        "persistenceEnabled": persistence_enabled(),
        "redisEnabled": redis_enabled(),
        "inlineJobs": inline_jobs(),
        "workerQueueEnabled": use_worker_queue(),
        "scheduler": metrics,
        "schedulerStale": stale,
    }


@app.get("/r/{token}", tags=["sharing"])
def shared_report_readonly(token: str) -> dict:
    """Expiring read-only report summary via signed share token."""
    from app.pqc.bundle_codec import bundle_from_api_dict
    from app.sharing.service import resolve_share_token
    from app.store.scan_jobs import load_scan_bundle

    resolved = resolve_share_token(token)
    if resolved is None:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link invalid or expired.")
    payload = load_scan_bundle(resolved["scanId"], tenant_id=resolved["tenantId"])
    if payload is None:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    bundle = bundle_from_api_dict(payload)
    report_json = report_to_json(bundle.report)
    return {
        "status": "success",
        "scanId": resolved["scanId"],
        "targetDomain": bundle.report.target_domain,
        "readinessBand": bundle.report.readiness_band,
        "report": {
            "readinessScore": bundle.report.readiness_score,
            "coverageConfidence": bundle.report.coverage_confidence,
        },
        "executiveSummary": report_json.get("executiveSummary", {}),
        "scanDiff": report_json.get("scanDiff"),
        "verifyUrl": f"/verify?scanId={resolved['scanId']}",
    }


@app.get("/r/{token}/report", tags=["sharing"])
def shared_report_download(token: str, format: str = "pdf") -> Response:
    """Download PDF or evidence bundle via expiring share token (no API key)."""
    from fastapi import HTTPException, status
    from app.pqc.bundle_codec import bundle_from_api_dict
    from app.pqc.report import report_to_pdf
    from app.pqc.report_bundle import build_evidence_bundle
    from app.sharing.service import resolve_share_token
    from app.store.scan_jobs import load_scan_bundle

    resolved = resolve_share_token(token)
    if resolved is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link invalid or expired.")
    payload = load_scan_bundle(resolved["scanId"], tenant_id=resolved["tenantId"])
    if payload is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    bundle = bundle_from_api_dict(payload)
    fmt = format.lower()
    if fmt == "bundle":
        content = build_evidence_bundle(bundle.report)
        return Response(
            content=content,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{resolved["scanId"]}-evidence.zip"'},
        )
    pdf_bytes = report_to_pdf(bundle.report)
    return Response(content=pdf_bytes, media_type="application/pdf")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception("Unhandled error request_id=%s", request_id, exc_info=exc)
    content: dict[str, str] = {
        "status": "error",
        "message": "Qtangl hit an unexpected backend error. Try again or check the server logs.",
        "requestId": request_id,
    }
    if os.getenv("QTANGL_DEBUG", "").lower() in {"1", "true", "yes"}:
        content["detail"] = str(exc)
    return JSONResponse(
        status_code=500,
        content=content,
        headers=cors_headers_for_request(request),
    )
