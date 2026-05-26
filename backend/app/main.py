from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.optimize import router as optimize_router

app = FastAPI(
    title="Qtangl Backend",
    version="0.1.0",
    summary="Pilot optimization API for scheduling, routing, and staffing workflows.",
)

app.include_router(optimize_router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


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
