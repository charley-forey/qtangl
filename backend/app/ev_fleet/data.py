from __future__ import annotations

import csv
import json
import os
from pathlib import Path
from typing import Any

from app.ev_fleet.models import (
    Charger,
    ChargingWindowEvent,
    DeliveryStop,
    Depot,
    EvFleetDataset,
    ManualBaseline,
    QpuTrace,
    QpuTraceDistributionItem,
    RouteStopVisit,
    ScenarioCount,
    ScenarioDefinition,
    TouPeriod,
    TouTariff,
    Vehicle,
)

MODULE_DIR = Path(__file__).resolve().parent
BACKEND_FIXTURES_DIR = MODULE_DIR / "fixtures"


def _candidate_data_dirs() -> list[Path]:
    configured = os.getenv("QTANGL_EVFLEET_DATA_DIR")
    candidates: list[Path] = []
    if configured:
        candidates.append(Path(configured))

    current = Path(__file__).resolve()
    for parent in current.parents:
        candidates.append(parent / "demos" / "ev_fleet_charging" / "data")

    candidates.append(BACKEND_FIXTURES_DIR)
    return candidates


def _resolve_data_dir() -> Path:
    for candidate in _candidate_data_dirs():
        if (candidate / "fleet.json").exists():
            return candidate
    return BACKEND_FIXTURES_DIR


def get_data_dir() -> Path:
    return _resolve_data_dir()


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _build_route_visit(payload: dict[str, Any]) -> RouteStopVisit:
    return RouteStopVisit(
        stop_id=payload["stopId"],
        arrival=payload["arrival"],
        depart=payload["depart"],
        soc_after_kwh=float(payload["socAfterKwh"]),
    )


def _build_vehicle(payload: dict[str, Any]) -> Vehicle:
    return Vehicle(
        id=payload["id"],
        name=payload["name"],
        battery_kwh=float(payload["batteryKwh"]),
        usable_kwh=float(payload.get("usableKwh", payload["batteryKwh"] * 0.9)),
        efficiency_kwh_per_km=float(payload["efficiencyKwhPerKm"]),
        start_soc_kwh=float(payload["startSocKwh"]),
        connector_type=payload["connectorType"],
        max_charge_kw=float(payload["maxChargeKw"]),
        depot=payload["depot"],
        status=payload.get("status", "available"),
        dispatch_deadline=payload["dispatchDeadline"],
        assignments=[_build_route_visit(item) for item in payload.get("assignments", [])],
        metadata={
            key: value
            for key, value in payload.items()
            if key
            not in {
                "id",
                "name",
                "batteryKwh",
                "usableKwh",
                "efficiencyKwhPerKm",
                "startSocKwh",
                "connectorType",
                "maxChargeKw",
                "depot",
                "status",
                "dispatchDeadline",
                "assignments",
            }
        },
    )


def _build_stop(payload: dict[str, Any]) -> DeliveryStop:
    return DeliveryStop(
        id=payload["id"],
        label=payload["label"],
        zone=payload["zone"],
        demand_parcels=int(payload.get("demandParcels", 1)),
        service_minutes=int(payload.get("serviceMinutes", 10)),
        window_start=payload["windowStart"],
        window_end=payload["windowEnd"],
        priority=payload.get("priority", "normal"),
        lat=float(payload.get("lat", 0.0)),
        lon=float(payload.get("lon", 0.0)),
    )


def _build_charger(payload: dict[str, Any]) -> Charger:
    return Charger(
        id=payload["id"],
        name=payload["name"],
        level=payload["level"],
        power_kw=float(payload["powerKw"]),
        connector_type=payload["connectorType"],
        status=payload.get("status", "available"),
        metadata=payload.get("metadata", {}),
    )


def _build_tariff(payload: dict[str, Any]) -> TouTariff:
    return TouTariff(
        id=payload["id"],
        source=payload["source"],
        periods=[
            TouPeriod(
                name=period["name"],
                start=period["start"],
                end=period["end"],
                price_per_kwh=float(period["pricePerKwh"]),
            )
            for period in payload["periods"]
        ],
        demand_charge_per_kw=float(payload["demandChargePerKw"]),
        site_power_cap_kw=float(payload["sitePowerCapKw"]),
    )


def _build_depot(payload: dict[str, Any]) -> Depot:
    return Depot(
        id=payload["id"],
        name=payload["name"],
        timezone=payload.get("timezone", "America/Los_Angeles"),
        charger_ids=list(payload.get("chargerIds", [])),
        site_power_cap_kw=float(payload["sitePowerCapKw"]),
    )


def _build_window(payload: dict[str, Any]) -> ChargingWindowEvent:
    return ChargingWindowEvent(
        id=payload["id"],
        plan_date=payload["planDate"],
        tariff_id=payload["tariffId"],
        depot_id=payload["depotId"],
        fleet_size=int(payload["fleetSize"]),
        charger_count=int(payload["chargerCount"]),
        peak_window_start=payload["peakWindowStart"],
        peak_window_end=payload["peakWindowEnd"],
        urgency_minutes=int(payload.get("urgencyMinutes", 60)),
        channel=payload.get("channel", "dispatch"),
        reason=payload.get("reason", "evening charge plan"),
    )


def _build_scenario(payload: dict[str, Any]) -> ScenarioDefinition:
    return ScenarioDefinition(
        id=payload["id"],
        title=payload["title"],
        summary=payload["summary"],
        window=_build_window(payload["window"]),
        manual_baseline=ManualBaseline(
            decision_minutes=int(payload["manualBaseline"]["decisionMinutes"]),
            naive_daily_cost=float(payload["manualBaseline"]["naiveDailyCost"]),
            summary=payload["manualBaseline"]["summary"],
        ),
        preferred_candidates=list(payload.get("preferredCandidates", [])),
        counts=[
            ScenarioCount(bitstring=item["bitstring"], weight=int(item["weight"]))
            for item in payload.get("counts", [])
        ],
        classical_search_scope=payload.get("classicalSearchScope", "global"),
        dropped_vehicle_id=payload.get("droppedVehicleId"),
    )


def load_vehicles() -> list[Vehicle]:
    return [_build_vehicle(payload) for payload in _read_json(get_data_dir() / "fleet.json")]


def load_stops() -> list[DeliveryStop]:
    return [_build_stop(payload) for payload in _read_json(get_data_dir() / "stops.json")]


def load_chargers() -> list[Charger]:
    return [_build_charger(payload) for payload in _read_json(get_data_dir() / "chargers.json")]


def load_depot() -> Depot:
    return _build_depot(_read_json(get_data_dir() / "depot.json"))


def load_tariff() -> TouTariff:
    return _build_tariff(_read_json(get_data_dir() / "tariff.json"))


def load_distance_matrix() -> dict[str, dict[str, float]]:
    return _read_json(get_data_dir() / "distance_matrix.json")


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
    raise KeyError(f"Unknown EV fleet scenario: {scenario_id}")


def load_penalty_weights() -> dict[str, Any]:
    return _read_json(get_data_dir() / "penalty_weights.json")


def load_dataset() -> EvFleetDataset:
    return EvFleetDataset(
        vehicles=load_vehicles(),
        stops=load_stops(),
        chargers=load_chargers(),
        depot=load_depot(),
        tariff=load_tariff(),
        scenarios=load_scenarios(),
        qpu_trace=load_qpu_trace(),
        penalty_weights=load_penalty_weights(),
        distance_matrix=load_distance_matrix(),
    )


def parse_uploaded_fleet(csv_text: str) -> list[Vehicle]:
    reader = csv.DictReader(csv_text.splitlines())
    required_columns = {
        "vehicle_id",
        "battery_kwh",
        "efficiency_kwh_per_km",
        "start_soc_kwh",
        "connector_type",
        "dispatch_deadline",
    }
    if not reader.fieldnames or set(reader.fieldnames) < required_columns:
        raise ValueError(
            "Uploaded fleet CSV is missing required columns: "
            + ", ".join(sorted(required_columns))
        )

    uploaded: list[Vehicle] = []
    for row in reader:
        battery = float(row["battery_kwh"])
        uploaded.append(
            Vehicle(
                id=str(row["vehicle_id"]).strip(),
                name=str(row.get("name") or row["vehicle_id"]).strip(),
                battery_kwh=battery,
                usable_kwh=float(row.get("usable_kwh") or battery * 0.9),
                efficiency_kwh_per_km=float(row["efficiency_kwh_per_km"]),
                start_soc_kwh=float(row["start_soc_kwh"]),
                connector_type=str(row["connector_type"]).strip(),
                max_charge_kw=float(row.get("max_charge_kw") or 7.2),
                depot=str(row.get("depot") or "depot-main").strip(),
                status=str(row.get("status") or "available").strip(),
                dispatch_deadline=str(row["dispatch_deadline"]).strip(),
                assignments=[],
            )
        )
    return uploaded


def parse_uploaded_stops(csv_text: str) -> list[DeliveryStop]:
    reader = csv.DictReader(csv_text.splitlines())
    required_columns = {"stop_id", "zone", "window_start", "window_end"}
    if not reader.fieldnames or set(reader.fieldnames) < required_columns:
        raise ValueError(
            "Uploaded stops CSV is missing required columns: "
            + ", ".join(sorted(required_columns))
        )

    uploaded: list[DeliveryStop] = []
    for row in reader:
        uploaded.append(
            DeliveryStop(
                id=str(row["stop_id"]).strip(),
                label=str(row.get("label") or row["stop_id"]).strip(),
                zone=str(row["zone"]).strip(),
                demand_parcels=int(float(row.get("demand_parcels") or 1)),
                service_minutes=int(float(row.get("service_minutes") or 10)),
                window_start=str(row["window_start"]).strip(),
                window_end=str(row["window_end"]).strip(),
                priority=str(row.get("priority") or "normal").strip(),
                lat=float(row.get("lat") or 0.0),
                lon=float(row.get("lon") or 0.0),
            )
        )
    return uploaded
