from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from app.auth import require_api_key
from app.ev_fleet.data import load_dataset, load_scenario, parse_uploaded_fleet, parse_uploaded_stops
from app.ev_fleet.pipeline import run_ev_fleet_solve
from app.ev_fleet.sessions import create_session, get_session
from app.models.api import ErrorResponse

router = APIRouter(prefix="/ev-fleet", tags=["ev-fleet"])


class EvFleetSolveRequest(BaseModel):
    scenarioId: str = Field(default="tou-peak-ca")
    useFixture: bool = Field(default=True)
    seed: int = Field(default=1234)
    fleetSessionId: str | None = None
    stopsSessionId: str | None = None


@router.get("/depot", responses={401: {"model": ErrorResponse}})
def get_depot(_token: str = Depends(require_api_key)) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "summary": "EV fleet depot fixture loaded.",
        "vehicles": [asdict(vehicle) for vehicle in dataset.vehicles],
        "stops": [asdict(stop) for stop in dataset.stops],
        "chargers": [asdict(charger) for charger in dataset.chargers],
        "depot": asdict(dataset.depot),
        "tariff": asdict(dataset.tariff),
    }


@router.get("/scenarios", responses={401: {"model": ErrorResponse}})
def get_scenarios(_token: str = Depends(require_api_key)) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "scenarios": [asdict(scenario) for scenario in dataset.scenarios],
    }


@router.get("/window", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def get_window(
    scenarioId: str = "tou-peak-ca",
    _token: str = Depends(require_api_key),
) -> dict:
    try:
        scenario = load_scenario(scenarioId)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return {
        "status": "success",
        "window": asdict(scenario.window),
        "scenario": asdict(scenario),
    }


@router.get("/qpu-trace", responses={401: {"model": ErrorResponse}})
def get_qpu_trace(_token: str = Depends(require_api_key)) -> dict:
    dataset = load_dataset()
    return {
        "status": "success",
        "trace": asdict(dataset.qpu_trace),
    }


@router.post("/upload-fleet", responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
async def upload_fleet(
    file: UploadFile = File(...),
    _token: str = Depends(require_api_key),
) -> dict:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Upload a CSV fleet file.",
        )

    payload = await file.read()
    try:
        vehicles = parse_uploaded_fleet(payload.decode("utf-8"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    session_id = create_session(vehicles)
    return {
        "status": "success",
        "sessionId": session_id,
        "summary": f"Validated {len(vehicles)} vehicles and stored the fleet in a 24-hour session.",
    }


@router.post("/upload-stops", responses={401: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
async def upload_stops(
    file: UploadFile = File(...),
    _token: str = Depends(require_api_key),
) -> dict:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Upload a CSV stops file.",
        )

    payload = await file.read()
    try:
        stops = parse_uploaded_stops(payload.decode("utf-8"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    session_id = create_session(stops)
    return {
        "status": "success",
        "sessionId": session_id,
        "summary": f"Validated {len(stops)} stops and stored them in a 24-hour session.",
    }


@router.post("/plan/solve", responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def solve_plan(
    request: EvFleetSolveRequest,
    _token: str = Depends(require_api_key),
) -> dict:
    dataset = load_dataset()
    vehicles_override = None
    stops_override = None
    if request.fleetSessionId:
        vehicles_override = get_session(request.fleetSessionId)
        if vehicles_override is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uploaded fleet session not found or expired.",
            )
    if request.stopsSessionId:
        stops_override = get_session(request.stopsSessionId)
        if stops_override is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uploaded stops session not found or expired.",
            )

    try:
        bundle = run_ev_fleet_solve(
            dataset,
            scenario_id=request.scenarioId,
            use_fixture=request.useFixture,
            vehicles_override=vehicles_override,
            stops_override=stops_override,
            seed=request.seed,
        )
    except StopIteration as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown EV fleet scenario: {request.scenarioId}",
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
