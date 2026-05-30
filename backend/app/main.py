from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.admin import router as admin_router
from app.api.airline import router as airline_router
from app.api.ev_fleet import router as ev_fleet_router
from app.api.hospital import router as hospital_router
from app.api.optimize import router as optimize_router
from app.api.pqc import router as pqc_router
from app.api.tenant import router as tenant_router
from app.db.config import inline_jobs, persistence_enabled, redis_enabled, use_worker_queue
from app.db.engine import init_db, ping_db
from app.queue.redis_queue import ping as ping_redis

DEFAULT_CORS_ORIGINS = (
    "https://www.qtangl.com",
    "https://qtangl.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


def cors_origins() -> list[str]:
    raw = os.getenv("QTANGL_CORS_ORIGINS")
    if not raw:
        return list(DEFAULT_CORS_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(
    title="Qtangl Backend",
    version="0.1.0",
    summary="Pilot optimization API for scheduling, routing, and staffing workflows.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_origin_regex=os.getenv("QTANGL_CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(optimize_router)
app.include_router(hospital_router)
app.include_router(airline_router)
app.include_router(ev_fleet_router)
app.include_router(pqc_router)
app.include_router(tenant_router)
app.include_router(admin_router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready", tags=["health"])
def health_ready() -> dict[str, object]:
    db_ok = ping_db() if persistence_enabled() else True
    redis_ok = ping_redis() if redis_enabled() else True
    ready = db_ok and redis_ok
    return {
        "status": "ready" if ready else "degraded",
        "database": db_ok,
        "redis": redis_ok,
        "persistenceEnabled": persistence_enabled(),
        "redisEnabled": redis_enabled(),
        "inlineJobs": inline_jobs(),
        "workerQueueEnabled": use_worker_queue(),
    }


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Qtangl hit an unexpected backend error. Try again or check the server logs.",
            "detail": str(exc),
        },
    )
