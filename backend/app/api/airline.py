from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from app.auth import require_api_key
from app.airline.data import load_dataset, load_default_disruption, load_scenario, parse_uploaded_crew
from app.airline.pipeline import run_airline_solve
from app.airline.sessions import create_session, get_session
from app.models.api import ErrorResponse

router = APIRouter(prefix="/airline", tags=["airline"])


class AirlineSolveRequest(BaseModel):
    scenarioId: str = Field(default="mx-hold-ord-0612")
    useFixture: bool = Field(default=True)
    seed: int = Field(default=1234)
    crewSessionId: str | None = None


@router.get(
    "/network",
    responses={401: {"model": ErrorResponse}},
)
def get_network(
    _token: str = Depends(require_api_key),
) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "summary": "Airline network fixture loaded.",
        "crew": [asdict(member) for member in dataset.crew],
        "flights": [asdict(flight) for flight in dataset.flights],
        "aircraft": [asdict(aircraft) for aircraft in dataset.aircraft],
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
    "/disruption",
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def get_disruption(
    scenarioId: str = "mx-hold-ord-0612",
    _token: str = Depends(require_api_key),
) -> dict:
    try:
        scenario = load_scenario(scenarioId)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return {
        "status": "success",
        "disruption": asdict(scenario.disruption),
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
    "/upload-crew",
    responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
)
async def upload_crew(
    file: UploadFile = File(...),
    _token: str = Depends(require_api_key),
) -> dict:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Upload a CSV crew roster file.",
        )

    payload = await file.read()
    try:
        crew = parse_uploaded_crew(payload.decode("utf-8"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    session_id = create_session(crew)
    return {
        "status": "success",
        "sessionId": session_id,
        "summary": f"Validated {len(crew)} crew members and stored the roster in a 24-hour session.",
    }


@router.post(
    "/recover/solve",
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def solve_recovery(
    request: AirlineSolveRequest,
    _token: str = Depends(require_api_key),
) -> dict:
    dataset = load_dataset()
    crew_override = None
    if request.crewSessionId:
        crew_override = get_session(request.crewSessionId)
        if crew_override is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uploaded crew session not found or expired.",
            )

    try:
        bundle = run_airline_solve(
            dataset,
            scenario_id=request.scenarioId,
            use_fixture=request.useFixture,
            crew_override=crew_override,
            seed=request.seed,
        )
    except StopIteration as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown airline scenario: {request.scenarioId}",
        ) from exc

    return {
        "status": "success",
        "scenario": asdict(bundle.scenario),
        "routing": asdict(bundle.routing),
        "repairWindow": asdict(bundle.repair_window),
        "classicalPlan": asdict(bundle.classical_plan),
        "hybridPlans": [asdict(plan) for plan in bundle.hybrid_plans],
        "scoreboard": asdict(bundle.scoreboard),
        "auditPacks": [asdict(audit_pack) for audit_pack in bundle.audit_packs],
        "timeline": [asdict(item) for item in bundle.timeline],
        "details": bundle.details,
    }
