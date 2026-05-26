from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import require_api_key
from app.models.api import ErrorResponse, OptimizeRequest, OptimizeResponse
from app.parsers import parse_request
from app.pipeline import run_optimization
from app.presentation import build_optimize_response

router = APIRouter(tags=["optimize"])


@router.post(
    "/optimize",
    response_model=OptimizeResponse,
    responses={
        401: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        501: {"model": ErrorResponse},
    },
)
def optimize(
    request: OptimizeRequest,
    _token: str = Depends(require_api_key),
) -> OptimizeResponse:
    try:
        canonical_problem = parse_request(request)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    try:
        result = run_optimization(canonical_problem)
    except NotImplementedError as exc:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(exc),
        ) from exc

    if not result.feasible:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=result.summary,
        )

    return build_optimize_response(canonical_problem, result)
