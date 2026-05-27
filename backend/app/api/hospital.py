from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from app.auth import require_api_key
from app.hospital.data import load_dataset, load_default_callout, load_scenario, parse_uploaded_roster
from app.hospital.pipeline import run_hospital_solve
from app.hospital.sessions import create_session, get_session
from app.models.api import ErrorResponse

router = APIRouter(prefix="/hospital", tags=["hospital"])


class HospitalSolveRequest(BaseModel):
    scenarioId: str = Field(default="callout-cath-acls")
    useFixture: bool = Field(default=True)
    seed: int = Field(default=1234)
    rosterSessionId: str | None = None


@router.get(
    "/roster",
    responses={401: {"model": ErrorResponse}},
)
def get_roster(
    _token: str = Depends(require_api_key),
) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "summary": "Hospital roster fixture loaded.",
        "roster": [asdict(nurse) for nurse in dataset.roster],
    }


@router.get(
    "/scenarios",
    responses={401: {"model": ErrorResponse}},
)
def get_scenarios(
    _token: str = Depends(require_api_key),
) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "scenarios": [asdict(scenario) for scenario in dataset.scenarios],
    }


@router.get(
    "/callout",
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def get_callout(
    scenarioId: str = "callout-cath-acls",
    _token: str = Depends(require_api_key),
) -> dict:
    try:
        scenario = load_scenario(scenarioId)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return {
        "status": "success",
        "callOut": asdict(scenario.callout),
        "scenario": asdict(scenario),
    }


@router.get(
    "/qpu-trace",
    responses={401: {"model": ErrorResponse}},
)
def get_qpu_trace(
    _token: str = Depends(require_api_key),
) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "trace": asdict(dataset.qpu_trace),
    }


@router.post(
    "/upload-roster",
    responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
)
async def upload_roster(
    file: UploadFile = File(...),
    _token: str = Depends(require_api_key),
) -> dict:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Upload a CSV roster file.",
        )

    payload = await file.read()
    try:
        roster = parse_uploaded_roster(payload.decode("utf-8"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    session_id = create_session(roster)
    return {
        "status": "success",
        "sessionId": session_id,
        "summary": f"Validated {len(roster)} nurses and stored the roster in a 24-hour session.",
    }


@router.post(
    "/callout/solve",
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def solve_callout(
    request: HospitalSolveRequest,
    _token: str = Depends(require_api_key),
) -> dict:
    dataset = load_dataset()
    roster_override = None
    if request.rosterSessionId:
        roster_override = get_session(request.rosterSessionId)
        if roster_override is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uploaded roster session not found or expired.",
            )

    try:
        bundle = run_hospital_solve(
            dataset,
            scenario_id=request.scenarioId,
            use_fixture=request.useFixture,
            roster_override=roster_override,
            seed=request.seed,
        )
    except StopIteration as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown hospital scenario: {request.scenarioId}",
        ) from exc

    return {
        "status": "success",
        "scenario": asdict(bundle.scenario),
        "repairWindow": asdict(bundle.repair_window),
        "classicalCandidate": asdict(bundle.classical_candidate),
        "hybridCandidates": [asdict(candidate) for candidate in bundle.hybrid_candidates],
        "scoreboard": asdict(bundle.scoreboard),
        "auditPacks": [asdict(audit_pack) for audit_pack in bundle.audit_packs],
        "timeline": [asdict(item) for item in bundle.timeline],
        "details": bundle.details,
    }
