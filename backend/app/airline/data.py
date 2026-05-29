from __future__ import annotations

import csv
import json
import os
from pathlib import Path
from typing import Any

from app.airline.models import (
    Aircraft,
    CrewMember,
    DisruptionEvent,
    Far117Profile,
    Far117Rule,
    FlightLeg,
    ManualBaseline,
    PairingAssignment,
    QpuTrace,
    QpuTraceDistributionItem,
    ScenarioCount,
    ScenarioDefinition,
    AirlineDataset,
)

MODULE_DIR = Path(__file__).resolve().parent
BACKEND_FIXTURES_DIR = MODULE_DIR / "fixtures"


def _candidate_data_dirs() -> list[Path]:
    configured = os.getenv("QTANGL_AIRLINE_DATA_DIR")
    candidates: list[Path] = []
    if configured:
        candidates.append(Path(configured))

    current = Path(__file__).resolve()
    for parent in current.parents:
        candidates.append(parent / "demos" / "airline_recovery" / "data")

    candidates.append(BACKEND_FIXTURES_DIR)
    return candidates


def _resolve_data_dir() -> Path:
    for candidate in _candidate_data_dirs():
        if (candidate / "network.json").exists():
            return candidate
    return BACKEND_FIXTURES_DIR


def get_data_dir() -> Path:
    return _resolve_data_dir()


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _build_pairing(payload: dict[str, Any]) -> PairingAssignment:
    return PairingAssignment(
        leg_id=payload["legId"],
        flight_no=payload["flightNo"],
        origin=payload["origin"],
        dest=payload["dest"],
        sched_dep=payload["schedDep"],
        sched_arr=payload["schedArr"],
        required_quals=payload.get("requiredQuals", []),
        kind=payload.get("kind", "scheduled"),
        crew_id=payload.get("crewId"),
    )


def _build_crew(payload: dict[str, Any]) -> CrewMember:
    return CrewMember(
        id=payload["id"],
        name=payload["name"],
        role=payload["role"],
        base=payload["base"],
        qualifications=payload.get("qualifications", []),
        qualified_fleets=payload.get("qualifiedFleets", []),
        seniority_date=payload["seniorityDate"],
        hourly_rate=float(payload["hourlyRate"]),
        block_hours_week=int(payload["blockHoursWeek"]),
        max_fdp_hours=int(payload["maxFdpHours"]),
        cba_group=payload["cbaGroup"],
        duty_start=payload["dutyStart"],
        last_duty_end=payload["lastDutyEnd"],
        assignments=[_build_pairing(item) for item in payload.get("assignments", [])],
        metadata={
            key: value
            for key, value in payload.items()
            if key
            not in {
                "id",
                "name",
                "role",
                "base",
                "qualifications",
                "qualifiedFleets",
                "seniorityDate",
                "hourlyRate",
                "blockHoursWeek",
                "maxFdpHours",
                "cbaGroup",
                "dutyStart",
                "lastDutyEnd",
                "assignments",
            }
        },
    )


def _build_flight(payload: dict[str, Any]) -> FlightLeg:
    return FlightLeg(
        id=payload["id"],
        flight_no=payload["flightNo"],
        origin=payload["origin"],
        dest=payload["dest"],
        sched_dep=payload["schedDep"],
        sched_arr=payload["schedArr"],
        block_minutes=int(payload["blockMinutes"]),
        fleet_type=payload["fleetType"],
        tail_id=payload["tailId"],
        required_quals=payload.get("requiredQuals", []),
        pax=int(payload.get("pax", 0)),
        connection_pax=int(payload.get("connectionPax", 0)),
        priority=payload.get("priority", "normal"),
        min_crew=int(payload.get("minCrew", 2)),
    )


def _build_aircraft(payload: dict[str, Any]) -> Aircraft:
    return Aircraft(
        id=payload["id"],
        fleet_type=payload["fleetType"],
        seats=int(payload["seats"]),
        current_station=payload["currentStation"],
        status=payload["status"],
        available_from=payload["availableFrom"],
        metadata=payload.get("metadata", {}),
    )


def _build_disruption(payload: dict[str, Any]) -> DisruptionEvent:
    return DisruptionEvent(
        id=payload["id"],
        aircraft_id=payload["aircraftId"],
        station=payload["station"],
        start=payload["start"],
        mx_hold_hours=float(payload["mxHoldHours"]),
        affected_leg_ids=list(payload.get("affectedLegIds", [])),
        crew_affected=int(payload.get("crewAffected", 0)),
        urgency_minutes=int(payload["urgencyMinutes"]),
        channel=payload.get("channel", "acars"),
        reason=payload.get("reason", "maintenance hold"),
        required_quals=payload.get("requiredQuals", []),
    )


def _build_scenario(payload: dict[str, Any]) -> ScenarioDefinition:
    return ScenarioDefinition(
        id=payload["id"],
        title=payload["title"],
        summary=payload["summary"],
        disruption=_build_disruption(payload["disruption"]),
        manual_baseline=ManualBaseline(
            decision_minutes=int(payload["manualBaseline"]["decisionMinutes"]),
            recovery_cost=float(payload["manualBaseline"]["recoveryCost"]),
            summary=payload["manualBaseline"]["summary"],
        ),
        preferred_candidates=list(payload.get("preferredCandidates", [])),
        counts=[
            ScenarioCount(bitstring=item["bitstring"], weight=int(item["weight"]))
            for item in payload.get("counts", [])
        ],
        classical_search_scope=payload.get("classicalSearchScope", "global"),
    )


def load_network() -> dict[str, list]:
    data_dir = get_data_dir()
    payload = _read_json(data_dir / "network.json")
    return {
        "crew": [_build_crew(item) for item in payload.get("crew", [])],
        "flights": [_build_flight(item) for item in payload.get("flights", [])],
        "aircraft": [_build_aircraft(item) for item in payload.get("aircraft", [])],
    }


def load_crew() -> list[CrewMember]:
    return load_network()["crew"]


def load_flights() -> list[FlightLeg]:
    return load_network()["flights"]


def load_aircraft() -> list[Aircraft]:
    return load_network()["aircraft"]


def load_far117() -> Far117Profile:
    payload = _read_json(get_data_dir() / "far117.json")
    return Far117Profile(
        source=payload["source"],
        rules=[
            Far117Rule(
                id=rule["id"],
                label=rule["label"],
                description=rule["description"],
                kind=rule["kind"],
            )
            for rule in payload["rules"]
        ],
        cost_ladder={key: float(value) for key, value in payload["costLadder"].items()},
    )


def load_qpu_trace() -> QpuTrace:
    payload = _read_json(get_data_dir() / "qpu_trace.json")
    return QpuTrace(
        backend=payload["backend"],
        run=payload["run"],
        distribution=[
            QpuTraceDistributionItem(
                bitstring=item["bitstring"],
                count=int(item["count"]),
                decoded_plan_id=item["decodedPlanId"],
            )
            for item in payload.get("distribution", [])
        ],
        summary=payload["summary"],
    )


def load_scenarios() -> list[ScenarioDefinition]:
    scenarios_dir = get_data_dir() / "scenarios"
    scenarios = []
    for path in sorted(scenarios_dir.glob("*.json")):
        scenarios.append(_build_scenario(_read_json(path)))
    return scenarios


def load_scenario(scenario_id: str) -> ScenarioDefinition:
    for scenario in load_scenarios():
        if scenario.id == scenario_id:
            return scenario
    raise KeyError(f"Unknown airline scenario: {scenario_id}")


def load_default_disruption() -> DisruptionEvent:
    return _build_disruption(_read_json(get_data_dir() / "disruption_event.json"))


def load_penalty_weights() -> dict[str, Any]:
    return _read_json(get_data_dir() / "penalty_weights.json")


def load_dataset() -> AirlineDataset:
    network = load_network()
    return AirlineDataset(
        crew=network["crew"],
        flights=network["flights"],
        aircraft=network["aircraft"],
        far117=load_far117(),
        scenarios=load_scenarios(),
        qpu_trace=load_qpu_trace(),
        penalty_weights=load_penalty_weights(),
    )


def parse_uploaded_crew(csv_text: str) -> list[CrewMember]:
    reader = csv.DictReader(csv_text.splitlines())
    required_columns = {
        "crew_id",
        "qualifications",
        "base",
        "block_hours_week",
        "last_duty_end",
        "seniority_date",
    }
    if not reader.fieldnames or set(reader.fieldnames) < required_columns:
        raise ValueError(
            "Uploaded crew CSV is missing required columns: "
            + ", ".join(sorted(required_columns))
        )

    uploaded: list[CrewMember] = []
    for row in reader:
        uploaded.append(
            CrewMember(
                id=str(row["crew_id"]).strip(),
                name=str(row.get("name") or row["crew_id"]).strip(),
                role=str(row.get("role") or "FO").strip(),
                base=str(row["base"]).strip(),
                qualifications=[
                    qualification.strip()
                    for qualification in str(row["qualifications"]).split("|")
                    if qualification.strip()
                ],
                qualified_fleets=[
                    fleet.strip()
                    for fleet in str(row.get("qualified_fleets") or "A320").split("|")
                    if fleet.strip()
                ],
                seniority_date=str(row["seniority_date"]).strip(),
                hourly_rate=float(row.get("hourly_rate") or 95.0),
                block_hours_week=int(float(row["block_hours_week"])),
                max_fdp_hours=int(float(row.get("max_fdp_hours") or 14)),
                cba_group=str(row.get("cba_group") or "LINE").strip(),
                duty_start=str(row.get("duty_start") or row["last_duty_end"]).strip(),
                last_duty_end=str(row["last_duty_end"]).strip(),
                assignments=[],
            )
        )
    return uploaded
