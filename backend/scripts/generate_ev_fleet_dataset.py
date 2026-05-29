#!/usr/bin/env python3
"""Generate EV fleet demo fixtures for backend and demos folders."""

from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_FIXTURES = REPO_ROOT / "backend" / "app" / "ev_fleet" / "fixtures"
DEMO_DATA = REPO_ROOT / "demos" / "ev_fleet_charging" / "data"


def _write(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def build_dataset() -> dict[str, object]:
    vehicles = []
    for index in range(1, 19):
        vehicles.append(
            {
                "id": f"veh-{index:03d}",
                "name": f"Van {index:02d}",
                "batteryKwh": 75.0,
                "usableKwh": 67.5,
                "efficiencyKwhPerKm": 0.28,
                "startSocKwh": round(12 + (index % 5) * 4.5, 1),
                "connectorType": "J1772",
                "maxChargeKw": 7.2,
                "depot": "depot-oakland",
                "status": "available" if index != 7 else "returning",
                "dispatchDeadline": "2026-05-29T05:30:00",
                "assignments": [],
            }
        )

    zones = ["east-bay", "peninsula", "sf-core", "south-bay"]
    stops = []
    for index in range(1, 25):
        zone = zones[(index - 1) % len(zones)]
        stops.append(
            {
                "id": f"stop-{index:03d}",
                "label": f"Customer {index}",
                "zone": zone,
                "demandParcels": 1 + (index % 3),
                "serviceMinutes": 8 + (index % 4),
                "windowStart": f"2026-05-28T{8 + (index % 6):02d}:00:00",
                "windowEnd": f"2026-05-28T{12 + (index % 5):02d}:30:00",
                "priority": "high" if index % 7 == 0 else "normal",
                "lat": 37.7 + (index % 10) * 0.01,
                "lon": -122.2 - (index % 8) * 0.01,
            }
        )

    chargers = [
        {
            "id": f"chg-{index:02d}",
            "name": f"L2 Bay {index}",
            "level": "L2",
            "powerKw": 7.2,
            "connectorType": "J1772",
            "status": "available",
        }
        for index in range(1, 13)
    ]

    depot = {
        "id": "depot-oakland",
        "name": "Oakland last-mile depot",
        "timezone": "America/Los_Angeles",
        "chargerIds": [charger["id"] for charger in chargers],
        "sitePowerCapKw": 86.4,
    }

    tariff = {
        "id": "pge-ev-b19",
        "source": "PG&E B-19 EV (synthetic CA TOU)",
        "periods": [
            {"name": "offpeak", "start": "00:00", "end": "16:00", "pricePerKwh": 0.15},
            {"name": "peak", "start": "16:00", "end": "21:00", "pricePerKwh": 0.45},
            {"name": "offpeak", "start": "21:00", "end": "24:00", "pricePerKwh": 0.15},
        ],
        "demandChargePerKw": 22.0,
        "sitePowerCapKw": 86.4,
    }

    matrix: dict[str, dict[str, float]] = {"depot-oakland": {}}
    for stop in stops:
        distance = 6.0 + (hash(stop["id"]) % 8)
        matrix["depot-oakland"][stop["id"]] = distance
        matrix.setdefault(stop["id"], {})["depot-oakland"] = distance
    for left in stops:
        for right in stops:
            if left["id"] == right["id"]:
                continue
            matrix.setdefault(left["id"], {})[right["id"]] = 4.0 + (
                hash(left["id"] + right["id"]) % 6
            )

    penalty_weights = {
        "hardConstraintMultiplier": 10.0,
        "noDoubleBookingMultiplier": 8.0,
        "peakConcurrencyMultiplier": 6.0,
        "softWeights": {"fairnessDelta": 0.5, "peakPenalty": 1.2, "readinessRisk": 1.0},
    }

    qpu_trace = {
        "backend": {"name": "ibm_torino", "qubits": 133},
        "run": {"jobId": "ev-fleet-demo-001", "shots": 1024, "reps": 1},
        "distribution": [
            {"bitstring": "100000000000", "count": 24, "decodedPlanId": "hybrid-plan-1"},
            {"bitstring": "010000000000", "count": 31, "decodedPlanId": "hybrid-plan-2"},
            {"bitstring": "001000000000", "count": 45, "decodedPlanId": "hybrid-plan-3"},
        ],
        "summary": "Fixture replay of charger-queue micro-window QAOA sampling.",
    }

    scenarios = {
        "tou-peak-ca.json": {
            "id": "tou-peak-ca",
            "title": "CA peak TOU — Oakland depot",
            "summary": "18 vans return by 18:00; 12 L2 bays; shift charging off the 16:00–21:00 peak.",
            "window": {
                "id": "window-tou-ca",
                "planDate": "2026-05-28",
                "tariffId": "pge-ev-b19",
                "depotId": "depot-oakland",
                "fleetSize": 18,
                "chargerCount": 12,
                "peakWindowStart": "2026-05-28T16:00:00",
                "peakWindowEnd": "2026-05-28T21:00:00",
                "urgencyMinutes": 90,
                "channel": "dispatch",
                "reason": "Evening depot charge plan — avoid peak TOU",
            },
            "manualBaseline": {
                "decisionMinutes": 45,
                "naiveDailyCost": 620.0,
                "summary": "Plug vans in on return — most energy lands in peak at full concurrent draw.",
            },
            "preferredCandidates": ["veh-003", "veh-007", "veh-011"],
            "counts": [
                {"bitstring": "100000000000", "weight": 24},
                {"bitstring": "010000000000", "weight": 31},
                {"bitstring": "001000000000", "weight": 45},
            ],
        },
        "demand-charge-spike.json": {
            "id": "demand-charge-spike",
            "title": "Demand-charge spike",
            "summary": "18 vans hit depot within 30 minutes — site cap and demand charge dominate.",
            "window": {
                "id": "window-spike",
                "planDate": "2026-05-28",
                "tariffId": "pge-ev-b19",
                "depotId": "depot-oakland",
                "fleetSize": 18,
                "chargerCount": 12,
                "peakWindowStart": "2026-05-28T17:00:00",
                "peakWindowEnd": "2026-05-28T19:00:00",
                "urgencyMinutes": 30,
                "channel": "telemetry",
                "reason": "Concurrent plug-in spike detected",
            },
            "manualBaseline": {
                "decisionMinutes": 25,
                "naiveDailyCost": 710.0,
                "summary": "First-come charging maxes site kW — demand charge penalty applies.",
            },
            "preferredCandidates": ["veh-001", "veh-005", "veh-012"],
            "counts": [
                {"bitstring": "100000000000", "weight": 28},
                {"bitstring": "010000000000", "weight": 35},
                {"bitstring": "001000000000", "weight": 37},
            ],
        },
        "driver-dropout-rewindow.json": {
            "id": "driver-dropout-rewindow",
            "title": "Driver dropout + tight windows",
            "summary": "Van 007 drops at 16:00; customer windows tighten — routes and charge plan re-solve.",
            "window": {
                "id": "window-dropout",
                "planDate": "2026-05-28",
                "tariffId": "pge-ev-b19",
                "depotId": "depot-oakland",
                "fleetSize": 17,
                "chargerCount": 12,
                "peakWindowStart": "2026-05-28T16:00:00",
                "peakWindowEnd": "2026-05-28T21:00:00",
                "urgencyMinutes": 60,
                "channel": "ops-phone",
                "reason": "Driver call-out — reassign stops and recharge plan",
            },
            "manualBaseline": {
                "decisionMinutes": 55,
                "naiveDailyCost": 680.0,
                "summary": "Manual re-route plus plug-in-as-available charging.",
            },
            "preferredCandidates": ["veh-002", "veh-008", "veh-014"],
            "droppedVehicleId": "veh-007",
            "counts": [
                {"bitstring": "100000000000", "weight": 22},
                {"bitstring": "010000000000", "weight": 33},
                {"bitstring": "001000000000", "weight": 45},
            ],
        },
    }

    return {
        "fleet.json": vehicles,
        "stops.json": stops,
        "chargers.json": chargers,
        "depot.json": depot,
        "tariff.json": tariff,
        "distance_matrix.json": matrix,
        "penalty_weights.json": penalty_weights,
        "qpu_trace.json": qpu_trace,
        "charging_window_event.json": scenarios["tou-peak-ca.json"]["window"],
        "scenarios": scenarios,
    }


def write_fixtures(target: Path, dataset: dict[str, object]) -> None:
    for name, payload in dataset.items():
        if name == "scenarios":
            for scenario_name, scenario_payload in payload.items():
                _write(target / "scenarios" / scenario_name, scenario_payload)
        else:
            _write(target / name, payload)


def main() -> None:
    dataset = build_dataset()
    for target in (BACKEND_FIXTURES, DEMO_DATA):
        write_fixtures(target, dataset)
    print(f"Wrote EV fleet fixtures to {BACKEND_FIXTURES} and {DEMO_DATA}")


if __name__ == "__main__":
    main()
