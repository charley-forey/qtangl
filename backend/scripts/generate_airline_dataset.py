from __future__ import annotations

import csv
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "demos" / "airline_recovery" / "data"
SCENARIOS_DIR = DATA_DIR / "scenarios"
BACKEND_FIXTURES_DIR = ROOT / "backend" / "app" / "airline" / "fixtures"
BACKEND_SCENARIOS_DIR = BACKEND_FIXTURES_DIR / "scenarios"

SEED = 42
BASE = datetime(2026, 5, 28, 6, 0, 0)

FIRST = ["Alex", "Blake", "Casey", "Dana", "Evan", "Finn", "Gina", "Harper", "Ivy", "Jordan"]
LAST = ["Adams", "Brooks", "Carter", "Diaz", "Edwards", "Foster", "Garcia", "Hayes", "Kim", "Lopez"]


def iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def generate_crew() -> list[dict]:
    random.seed(SEED)
    crew: list[dict] = []
    bases = ["KORD", "KDCA", "KDFW", "KBOS", "KATL"]
    roles = ["CA", "FO", "FO", "FA"]
    for index in range(48):
        base = bases[index % len(bases)]
        role = roles[index % len(roles)]
        seniority = BASE - timedelta(days=365 * (3 + index % 12))
        last_end = BASE - timedelta(hours=14 + (index % 6))
        crew.append(
            {
                "id": f"crew-{index + 1:03d}",
                "name": f"{FIRST[index % len(FIRST)]} {LAST[index % len(LAST)]}",
                "role": role,
                "base": base,
                "qualifications": ["A320", "ETOPS"] if role != "FA" else ["A320"],
                "qualifiedFleets": ["A320"],
                "seniorityDate": iso(seniority),
                "hourlyRate": 120.0 if role == "CA" else 85.0,
                "blockHoursWeek": 28 + (index % 8),
                "maxFdpHours": 14,
                "cbaGroup": "LINE",
                "dutyStart": iso(last_end + timedelta(hours=10)),
                "lastDutyEnd": iso(last_end),
                "assignments": [],
            }
        )
    preferred = ["crew-003", "crew-007", "crew-011", "crew-015", "crew-021"]
    for crew_id in preferred:
        member = next(item for item in crew if item["id"] == crew_id)
        member["base"] = "KORD"
        member["qualifications"] = ["A320", "ETOPS", "CAT-III"]
    return crew


def generate_flights() -> list[dict]:
    legs = [
        ("B61207", "KORD", "KBOS", 0, 120),
        ("B61208", "KBOS", "KJFK", 150, 90),
        ("B61209", "KJFK", "KORD", 300, 150),
        ("B61441", "KDCA", "KORD", 60, 130),
        ("B61442", "KORD", "KDFW", 240, 160),
        ("B61443", "KDFW", "KATL", 450, 140),
    ]
    flights = []
    for leg_id, (fno, origin, dest, offset, block) in enumerate(legs):
        dep = BASE + timedelta(minutes=offset)
        arr = dep + timedelta(minutes=block)
        flights.append(
            {
                "id": f"leg-{leg_id + 1:03d}",
                "flightNo": fno,
                "origin": origin,
                "dest": dest,
                "schedDep": iso(dep),
                "schedArr": iso(arr),
                "blockMinutes": block,
                "fleetType": "A320",
                "tailId": "N812JB" if leg_id < 3 else "N445BZ",
                "requiredQuals": ["A320", "ETOPS"],
                "pax": 140 + leg_id * 5,
                "connectionPax": 20 + leg_id * 3,
                "priority": "high" if leg_id < 3 else "normal",
                "minCrew": 2,
            }
        )
    return flights


def generate_aircraft() -> list[dict]:
    return [
        {
            "id": "N812JB",
            "fleetType": "A320",
            "seats": 186,
            "currentStation": "KORD",
            "status": "mx_hold",
            "availableFrom": iso(BASE + timedelta(hours=3)),
            "metadata": {"carrier": "B6"},
        },
        {
            "id": "N445BZ",
            "fleetType": "A320",
            "seats": 186,
            "currentStation": "KORD",
            "status": "available",
            "availableFrom": iso(BASE),
            "metadata": {"carrier": "B6"},
        },
        {
            "id": "N903DL",
            "fleetType": "A320",
            "seats": 186,
            "currentStation": "KDCA",
            "status": "available",
            "availableFrom": iso(BASE),
            "metadata": {"carrier": "B6"},
        },
    ]


def scenario_payloads() -> list[dict]:
    return [
        {
            "id": "mx-hold-ord-0612",
            "title": "KORD MX hold — tail N812JB",
            "summary": "06:12 at KORD — N812JB unavailable for a 3-hour maintenance hold. Three downstream legs need tail swap and crew rebid.",
            "disruption": {
                "id": "disruption-mx-ord",
                "aircraftId": "N812JB",
                "station": "KORD",
                "start": iso(BASE + timedelta(minutes=12)),
                "mxHoldHours": 3.0,
                "affectedLegIds": ["leg-001", "leg-002", "leg-003"],
                "crewAffected": 12,
                "urgencyMinutes": 48,
                "channel": "acars",
                "reason": "Hydraulic leak — 3 hr MX hold",
                "requiredQuals": ["A320", "ETOPS"],
            },
            "manualBaseline": {
                "decisionMinutes": 35,
                "recoveryCost": 185000.0,
                "summary": "OCC cancels the third leg and calls reserve at premium cost to protect the bank.",
            },
            "preferredCandidates": ["crew-003", "crew-007", "crew-011"],
            "classicalSearchScope": "local",
            "counts": [
                {"bitstring": "100000000000", "weight": 24},
                {"bitstring": "010000000000", "weight": 31},
                {"bitstring": "001000000000", "weight": 45},
            ],
        },
        {
            "id": "crew-illegal-dca",
            "title": "FAR 117 bust at DCA",
            "summary": "Inbound delay pushes a connecting crew over FDP at KDCA; two afternoon departures need reassignment.",
            "disruption": {
                "id": "disruption-fdp-dca",
                "aircraftId": "N903DL",
                "station": "KDCA",
                "start": iso(BASE + timedelta(minutes=60)),
                "mxHoldHours": 0.0,
                "affectedLegIds": ["leg-004", "leg-005"],
                "crewAffected": 8,
                "urgencyMinutes": 55,
                "channel": "phone",
                "reason": "Inbound delay — crew illegal on FDP",
                "requiredQuals": ["A320", "ETOPS"],
            },
            "manualBaseline": {
                "decisionMinutes": 28,
                "recoveryCost": 92000.0,
                "summary": "Controllers deadhead reserve from BOS and accept a 45-minute delay on the ORD departure.",
            },
            "preferredCandidates": ["crew-015", "crew-021"],
            "classicalSearchScope": "global",
            "counts": [
                {"bitstring": "100000", "weight": 28},
                {"bitstring": "010000", "weight": 36},
                {"bitstring": "001000", "weight": 36},
            ],
        },
        {
            "id": "wx-groundstop-dfw",
            "title": "DFW ground stop cascade",
            "summary": "Weather ground stop at DFW ripples through the evening bank; three legs need tail and crew recovery.",
            "disruption": {
                "id": "disruption-wx-dfw",
                "aircraftId": "N445BZ",
                "station": "KDFW",
                "start": iso(BASE + timedelta(minutes=240)),
                "mxHoldHours": 1.5,
                "affectedLegIds": ["leg-005", "leg-006"],
                "crewAffected": 10,
                "urgencyMinutes": 70,
                "channel": "email",
                "reason": "Ground stop — convective weather",
                "requiredQuals": ["A320"],
            },
            "manualBaseline": {
                "decisionMinutes": 42,
                "recoveryCost": 210000.0,
                "summary": "Manual plan cancels one leg and hotels 140 passengers before calling reserve.",
            },
            "preferredCandidates": ["crew-005", "crew-009"],
            "classicalSearchScope": "global",
            "counts": [
                {"bitstring": "10000", "weight": 30},
                {"bitstring": "01000", "weight": 35},
                {"bitstring": "00100", "weight": 35},
            ],
        },
    ]


def main() -> None:
    crew = generate_crew()
    flights = generate_flights()
    aircraft = generate_aircraft()
    network = {"crew": crew, "flights": flights, "aircraft": aircraft}

    far117 = {
        "source": "FAA FAR 117 (synthetic OCC profile)",
        "rules": [
            {
                "id": "rest-10h",
                "label": "Minimum rest",
                "description": "10-hour minimum rest before reporting.",
                "kind": "hard",
            },
            {
                "id": "fdp-14h",
                "label": "FDP limit",
                "description": "Maximum 14-hour flight duty period for this roster.",
                "kind": "hard",
            },
        ],
        "costLadder": {
            "premiumPay": 1.35,
            "reserve": 2.5,
            "deadhead": 1.15,
            "cancel": 4.0,
        },
    }

    penalty_weights = {
        "hardConstraintMultiplier": 10.0,
        "noDoubleBookingMultiplier": 8.0,
        "softWeights": {
            "fatigueRisk": 1.0,
            "fairnessDelta": 1.0,
            "seniorityPreference": 0.5,
            "offBasePenalty": 1.2,
        },
    }

    qpu_trace = {
        "backend": {"name": "ibm_torino", "qubits": 133},
        "run": {"jobId": "airline-demo-trace", "shots": 4096, "seed": 1234},
        "distribution": [
            {"bitstring": "001000000000", "count": 1847, "decodedPlanId": "hybrid-plan-3"},
            {"bitstring": "010000000000", "count": 1264, "decodedPlanId": "hybrid-plan-2"},
            {"bitstring": "100000000000", "count": 985, "decodedPlanId": "hybrid-plan-1"},
        ],
        "summary": "Cached QPU sampling for the KORD MX-hold micro-window (12 binary vars).",
    }

    disruption_event = scenario_payloads()[0]["disruption"]

    targets = [DATA_DIR, BACKEND_FIXTURES_DIR]
    for target in targets:
        write_json(target / "network.json", network)
        write_json(target / "far117.json", far117)
        write_json(target / "penalty_weights.json", penalty_weights)
        write_json(target / "qpu_trace.json", qpu_trace)
        write_json(target / "disruption_event.json", disruption_event)
        scenarios_target = target / "scenarios"
        scenarios_target.mkdir(parents=True, exist_ok=True)
        for scenario in scenario_payloads():
            write_json(scenarios_target / f"{scenario['id']}.json", scenario)

    template_path = BACKEND_FIXTURES_DIR / "crew_template.csv"
    template_path.parent.mkdir(parents=True, exist_ok=True)
    with template_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "crew_id",
                "name",
                "role",
                "base",
                "qualifications",
                "qualified_fleets",
                "block_hours_week",
                "last_duty_end",
                "seniority_date",
                "hourly_rate",
                "max_fdp_hours",
                "cba_group",
            ]
        )
        writer.writerow(
            [
                "crew-upload-01",
                "Upload Captain",
                "CA",
                "KORD",
                "A320|ETOPS",
                "A320",
                "32",
                iso(BASE - timedelta(hours=12)),
                iso(BASE - timedelta(days=2000)),
                "120",
                "14",
                "LINE",
            ]
        )

    calibration = """# Airline OCC recovery calibration

Synthetic regional-carrier profile sized for demo solves (~48 crew, 6 legs, 3 aircraft).

- FAR 117 rest and FDP limits shape the hard feasibility set.
- DOT controllable-cancellation cost bands inform manual baseline recovery costs.
- Reserve/deadhead multipliers follow a 2.5x / 1.15x ladder vs line flying.
"""
    for target in targets:
        (target / "calibration.md").write_text(calibration, encoding="utf-8")

    print(f"Wrote airline fixtures to {DATA_DIR} and {BACKEND_FIXTURES_DIR}")


if __name__ == "__main__":
    main()
