from __future__ import annotations

import csv
import json
import random
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "demos" / "hospital_restaffing" / "data"
SCENARIOS_DIR = DATA_DIR / "scenarios"
BACKEND_FIXTURES_DIR = ROOT / "backend" / "app" / "hospital" / "fixtures"
BACKEND_SCENARIOS_DIR = BACKEND_FIXTURES_DIR / "scenarios"

SEED = 42
BASE_DATE = datetime(2026, 5, 26, 0, 0, 0)


FIRST_NAMES = [
    "Alicia",
    "Amara",
    "Avery",
    "Brooke",
    "Camila",
    "Carla",
    "Carmen",
    "Chloe",
    "Dana",
    "Devin",
    "Eden",
    "Elena",
    "Emma",
    "Eva",
    "Hannah",
    "Iris",
    "Jade",
    "Jamie",
    "Jasmine",
    "Jordan",
    "Kara",
    "Layla",
    "Leah",
    "Lina",
    "Maya",
    "Mia",
    "Naomi",
    "Nora",
    "Olivia",
    "Priya",
    "Riley",
    "Sofia",
    "Talia",
    "Vivian",
    "Zoe",
]

LAST_NAMES = [
    "Adams",
    "Allen",
    "Bennett",
    "Brooks",
    "Campbell",
    "Carter",
    "Diaz",
    "Edwards",
    "Flores",
    "Foster",
    "Garcia",
    "Griffin",
    "Hall",
    "Hayes",
    "Hughes",
    "James",
    "Kelly",
    "Kim",
    "Lopez",
    "Miller",
    "Mitchell",
    "Nguyen",
    "Ortiz",
    "Patel",
    "Perry",
    "Ramirez",
    "Reed",
    "Rivera",
    "Scott",
    "Simmons",
    "Taylor",
    "Thompson",
    "Turner",
    "Walker",
    "Young",
]

WARD_CONFIG = {
    "Cath Lab 1": {
        "count": 18,
        "required_certs": ["ACLS"],
        "optional_certs": ["PALS", "Charge"],
        "priority": "high",
    },
    "Cath Lab 2": {
        "count": 18,
        "required_certs": ["ACLS"],
        "optional_certs": ["PALS", "Charge"],
        "priority": "high",
    },
    "ICU": {
        "count": 34,
        "required_certs": ["ACLS", "CCRN"],
        "optional_certs": ["Charge", "Vent"],
        "priority": "critical",
    },
    "OR-A": {
        "count": 26,
        "required_certs": ["Circulating", "Scrub"],
        "optional_certs": ["Charge", "Trauma"],
        "priority": "high",
    },
    "OR-B": {
        "count": 24,
        "required_certs": ["Circulating", "Scrub"],
        "optional_certs": ["Charge", "Trauma"],
        "priority": "high",
    },
    "Med-Surg": {
        "count": 60,
        "required_certs": ["BLS"],
        "optional_certs": ["Telemetry", "Charge"],
        "priority": "standard",
    },
}

SHIFT_TEMPLATES = [
    ("day", 6, 30, 12),
    ("swing", 14, 30, 12),
    ("night", 18, 30, 12),
]


@dataclass(slots=True)
class NurseSeed:
    id: str
    name: str
    home_ward: str
    certifications: list[str]
    cross_trained_wards: list[str]
    seniority_date: str
    base_hourly_rate: float
    weekly_hours: int
    max_hours_week: int
    cba_group: str
    role: str
    last_shift_end: str
    assignments: list[dict[str, Any]]


def ensure_dirs() -> None:
    SCENARIOS_DIR.mkdir(parents=True, exist_ok=True)
    BACKEND_SCENARIOS_DIR.mkdir(parents=True, exist_ok=True)


def make_name_pool() -> list[str]:
    names: list[str] = []
    for first in FIRST_NAMES:
        for last in LAST_NAMES:
            names.append(f"{first} {last}")
    return names


def build_shifts() -> list[dict[str, Any]]:
    shifts: list[dict[str, Any]] = []
    acuity = {
        "Cath Lab 1": {"minStaff": 3, "requiredCertifications": ["ACLS"]},
        "Cath Lab 2": {"minStaff": 3, "requiredCertifications": ["ACLS"]},
        "ICU": {"minStaff": 8, "requiredCertifications": ["ACLS", "CCRN"]},
        "OR-A": {"minStaff": 4, "requiredCertifications": ["Circulating", "Scrub"]},
        "OR-B": {"minStaff": 4, "requiredCertifications": ["Circulating", "Scrub"]},
        "Med-Surg": {"minStaff": 10, "requiredCertifications": ["BLS"]},
    }
    for day_index in range(14):
        for ward, requirements in acuity.items():
            for shift_name, hour, minute, duration_hours in SHIFT_TEMPLATES:
                start = BASE_DATE + timedelta(days=day_index, hours=hour, minutes=minute)
                end = start + timedelta(hours=duration_hours)
                shifts.append(
                    {
                        "id": f"{ward.lower().replace(' ', '-')}-{day_index + 1}-{shift_name}",
                        "dayIndex": day_index + 1,
                        "shiftName": shift_name,
                        "ward": ward,
                        "start": start.isoformat(),
                        "end": end.isoformat(),
                        "durationHours": duration_hours,
                        "priority": WARD_CONFIG[ward]["priority"],
                        "requiredCertifications": requirements["requiredCertifications"],
                        "minStaff": requirements["minStaff"],
                    }
                )
    return shifts


def make_certifications(home_ward: str, rng: random.Random) -> tuple[list[str], list[str], str]:
    required = list(WARD_CONFIG[home_ward]["required_certs"])
    optional = WARD_CONFIG[home_ward]["optional_certs"]
    certs = list(dict.fromkeys(required + rng.sample(optional, k=min(len(optional), rng.randint(1, 2)))))
    cross_trained = [home_ward]

    if "Cath Lab" in home_ward:
        cross_trained.extend(["Cath Lab 1", "Cath Lab 2", "ICU"])
        role = "Charge RN" if "Charge" in certs else "Procedure RN"
    elif home_ward == "ICU":
        cross_trained.extend(["ICU", "Cath Lab 1", "Cath Lab 2"])
        role = "Critical Care RN"
    elif "OR" in home_ward:
        cross_trained.extend(["OR-A", "OR-B"])
        role = "Perioperative RN"
    else:
        cross_trained.extend(["Med-Surg", "ICU"])
        role = "Staff RN"

    if "BLS" not in certs:
        certs.append("BLS")

    return sorted(set(certs)), sorted(set(cross_trained)), role


def build_assignments(
    nurse_id: str,
    home_ward: str,
    cross_trained_wards: list[str],
    certifications: list[str],
    rng: random.Random,
) -> list[dict[str, Any]]:
    assignments: list[dict[str, Any]] = []
    recent_days = [0, 1, 2, 4, 6, 8, 10, 12]
    ward_choices = [home_ward] * 8 + cross_trained_wards
    for day_index in recent_days:
        if rng.random() < 0.18:
            continue
        shift_name, hour, minute, duration_hours = SHIFT_TEMPLATES[rng.randrange(len(SHIFT_TEMPLATES))]
        start = BASE_DATE + timedelta(days=day_index, hours=hour, minutes=minute)
        end = start + timedelta(hours=duration_hours)
        ward = ward_choices[rng.randrange(len(ward_choices))]
        assignments.append(
            {
                "shiftId": f"{ward.lower().replace(' ', '-')}-{day_index + 1}-{shift_name}",
                "ward": ward,
                "shiftName": shift_name,
                "start": start.isoformat(),
                "end": end.isoformat(),
                "requiredCertifications": sorted(set(certifications[:2])),
                "kind": "scheduled",
                "nurseId": nurse_id,
            }
        )
    return sorted(assignments, key=lambda item: item["start"])


def build_roster(shifts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rng = random.Random(SEED)
    name_pool = make_name_pool()
    rng.shuffle(name_pool)
    roster: list[dict[str, Any]] = []
    assigned_count = defaultdict(int)

    sarah_assignment = {
        "shiftId": "cath-lab-2-1-day",
        "ward": "Cath Lab 2",
        "shiftName": "day",
        "start": (BASE_DATE + timedelta(hours=6, minutes=30)).isoformat(),
        "end": (BASE_DATE + timedelta(hours=18, minutes=30)).isoformat(),
        "requiredCertifications": ["ACLS", "PALS"],
        "kind": "scheduled",
        "nurseId": "nurse-sarah-k",
    }

    fixed_nurses = [
        NurseSeed(
            id="nurse-sarah-k",
            name="Sarah Keller",
            home_ward="Cath Lab 2",
            certifications=["ACLS", "PALS", "Charge", "BLS"],
            cross_trained_wards=["Cath Lab 1", "Cath Lab 2", "ICU"],
            seniority_date="2019-03-04",
            base_hourly_rate=69.50,
            weekly_hours=44,
            max_hours_week=60,
            cba_group="RN-12H",
            role="Charge RN",
            last_shift_end=(BASE_DATE - timedelta(hours=18)).isoformat(),
            assignments=[sarah_assignment],
        ),
        NurseSeed(
            id="nurse-marcus-h",
            name="Marcus Hill",
            home_ward="Cath Lab 2",
            certifications=["ACLS", "PALS", "Charge", "BLS"],
            cross_trained_wards=["Cath Lab 1", "Cath Lab 2", "ICU"],
            seniority_date="2014-05-12",
            base_hourly_rate=73.25,
            weekly_hours=50,
            max_hours_week=60,
            cba_group="RN-12H",
            role="Charge RN",
            last_shift_end=(BASE_DATE - timedelta(hours=14)).isoformat(),
            assignments=[
                {
                    "shiftId": "cath-lab-1-1-day",
                    "ward": "Cath Lab 1",
                    "shiftName": "day",
                    "start": (BASE_DATE + timedelta(hours=6, minutes=30)).isoformat(),
                    "end": (BASE_DATE + timedelta(hours=18, minutes=30)).isoformat(),
                    "requiredCertifications": ["ACLS"],
                    "kind": "scheduled",
                    "nurseId": "nurse-marcus-h",
                }
            ],
        ),
        NurseSeed(
            id="nurse-priya-n",
            name="Priya Nair",
            home_ward="Cath Lab 1",
            certifications=["ACLS", "PALS", "BLS"],
            cross_trained_wards=["Cath Lab 1", "Cath Lab 2"],
            seniority_date="2021-01-19",
            base_hourly_rate=64.75,
            weekly_hours=36,
            max_hours_week=60,
            cba_group="RN-12H",
            role="Procedure RN",
            last_shift_end=(BASE_DATE - timedelta(hours=12)).isoformat(),
            assignments=[],
        ),
        NurseSeed(
            id="nurse-devin-r",
            name="Devin Reyes",
            home_ward="ICU",
            certifications=["ACLS", "CCRN", "PALS", "BLS"],
            cross_trained_wards=["ICU", "Cath Lab 2"],
            seniority_date="2022-11-07",
            base_hourly_rate=62.10,
            weekly_hours=32,
            max_hours_week=60,
            cba_group="RN-12H",
            role="Critical Care RN",
            last_shift_end=(BASE_DATE - timedelta(hours=15)).isoformat(),
            assignments=[],
        ),
        NurseSeed(
            id="nurse-olivia-t",
            name="Olivia Tran",
            home_ward="Cath Lab 2",
            certifications=["ACLS", "PALS", "BLS"],
            cross_trained_wards=["Cath Lab 1", "Cath Lab 2"],
            seniority_date="2023-08-14",
            base_hourly_rate=59.40,
            weekly_hours=28,
            max_hours_week=60,
            cba_group="RN-12H",
            role="Procedure RN",
            last_shift_end=(BASE_DATE - timedelta(hours=25)).isoformat(),
            assignments=[],
        ),
        NurseSeed(
            id="nurse-amara-j",
            name="Amara James",
            home_ward="OR-A",
            certifications=["Circulating", "Scrub", "BLS", "Trauma"],
            cross_trained_wards=["OR-A", "OR-B"],
            seniority_date="2020-09-22",
            base_hourly_rate=66.00,
            weekly_hours=40,
            max_hours_week=60,
            cba_group="RN-12H",
            role="Perioperative RN",
            last_shift_end=(BASE_DATE - timedelta(hours=20)).isoformat(),
            assignments=[],
        ),
    ]

    for nurse in fixed_nurses:
        assigned_count[nurse.home_ward] += 1
        roster.append(
            {
                "id": nurse.id,
                "name": nurse.name,
                "homeWard": nurse.home_ward,
                "certifications": nurse.certifications,
                "crossTrainedWards": nurse.cross_trained_wards,
                "seniorityDate": nurse.seniority_date,
                "baseHourlyRate": nurse.base_hourly_rate,
                "weeklyHours": nurse.weekly_hours,
                "maxHoursWeek": nurse.max_hours_week,
                "cbaGroup": nurse.cba_group,
                "role": nurse.role,
                "lastShiftEnd": nurse.last_shift_end,
                "assignments": nurse.assignments,
            }
        )

    nurse_index = 1
    for ward, config in WARD_CONFIG.items():
        remaining = config["count"] - assigned_count[ward]
        for _ in range(remaining):
            name = name_pool.pop()
            certifications, cross_trained_wards, role = make_certifications(ward, rng)
            assignments = build_assignments(
                nurse_id=f"nurse-{nurse_index:03d}",
                home_ward=ward,
                cross_trained_wards=cross_trained_wards,
                certifications=certifications,
                rng=rng,
            )
            weekly_hours = min(60, 24 + 4 * len(assignments))
            seniority_year = rng.randint(2013, 2025)
            seniority_month = rng.randint(1, 12)
            seniority_day = rng.randint(1, 28)
            last_shift_end = assignments[-1]["end"] if assignments else (BASE_DATE - timedelta(hours=rng.randint(8, 30))).isoformat()
            roster.append(
                {
                    "id": f"nurse-{nurse_index:03d}",
                    "name": name,
                    "homeWard": ward,
                    "certifications": certifications,
                    "crossTrainedWards": cross_trained_wards,
                    "seniorityDate": f"{seniority_year:04d}-{seniority_month:02d}-{seniority_day:02d}",
                    "baseHourlyRate": round(rng.uniform(48.0, 76.0), 2),
                    "weeklyHours": weekly_hours,
                    "maxHoursWeek": 60,
                    "cbaGroup": "RN-12H" if rng.random() > 0.2 else "RN-8H",
                    "role": role,
                    "lastShiftEnd": last_shift_end,
                    "assignments": assignments,
                }
            )
            nurse_index += 1

    return roster


def build_cba() -> dict[str, Any]:
    return {
        "source": "PBJ-shaped synthetic dataset grounded in public staffing distributions",
        "rules": [
            {
                "id": "rest-10h",
                "label": "Mandatory rest",
                "description": "A nurse must have at least 10 hours between the end of one shift and the start of the next.",
                "kind": "hard",
            },
            {
                "id": "hours-60",
                "label": "Weekly hours cap",
                "description": "No nurse may exceed 60 scheduled hours in a rolling week without triggering an agency backfill.",
                "kind": "soft",
            },
            {
                "id": "seniority-bump",
                "label": "Seniority bumping",
                "description": "Senior staff can refuse mandatory overtime; junior staff are considered before agency.",
                "kind": "soft",
            },
            {
                "id": "skill-cover",
                "label": "Skill coverage",
                "description": "Cath lab coverage requires ACLS, ICU requires CCRN, and OR coverage requires a scrub/circulating-certified RN.",
                "kind": "hard",
            },
        ],
        "costLadder": {
            "internalSwap": 1.0,
            "voluntaryOvertime": 1.25,
            "mandatoryOvertime": 1.5,
            "agency": 2.4,
        },
    }


def build_scenarios(roster: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sarah = next(n for n in roster if n["id"] == "nurse-sarah-k")
    priya = next(n for n in roster if n["id"] == "nurse-priya-n")
    devin = next(n for n in roster if n["id"] == "nurse-devin-r")
    amara = next(n for n in roster if n["id"] == "nurse-amara-j")

    return [
        {
            "id": "callout-cath-acls",
            "title": "Cath lab ACLS call-out",
            "summary": "Sarah K. calls out 49 minutes before the day shift in Cath Lab 2, leaving an ACLS-required procedural slot uncovered.",
            "callOut": {
                "id": "callout-sarah-k",
                "nurseId": sarah["id"],
                "nurseName": sarah["name"],
                "ward": "Cath Lab 2",
                "shiftId": "cath-lab-2-1-day",
                "start": (BASE_DATE + timedelta(hours=6, minutes=30)).isoformat(),
                "end": (BASE_DATE + timedelta(hours=18, minutes=30)).isoformat(),
                "urgencyMinutes": 49,
                "requiredCertifications": ["ACLS", "PALS"],
                "channel": "phone",
                "reason": "Sick call",
            },
            "manualBaseline": {
                "decisionMinutes": 22,
                "agencyCost": 4800,
                "summary": "Charge nurse defaults to the safest agency backfill to preserve acuity coverage.",
            },
            "preferredCandidates": [priya["id"], devin["id"], "nurse-olivia-t"],
            "counts": [
                {"bitstring": "001", "weight": 27},
                {"bitstring": "010", "weight": 33},
                {"bitstring": "100", "weight": 40},
            ],
        },
        {
            "id": "callout-icu-mass",
            "title": "ICU cascade call-out",
            "summary": "Three ICU nurses call out on the same morning, forcing a rebalance across ICU, cath lab, and float coverage.",
            "callOut": {
                "id": "callout-icu-mass",
                "nurseId": devin["id"],
                "nurseName": devin["name"],
                "ward": "ICU",
                "shiftId": "icu-1-day",
                "start": (BASE_DATE + timedelta(hours=6, minutes=30)).isoformat(),
                "end": (BASE_DATE + timedelta(hours=18, minutes=30)).isoformat(),
                "urgencyMinutes": 41,
                "requiredCertifications": ["ACLS", "CCRN"],
                "channel": "text",
                "reason": "Multi-call outage",
            },
            "manualBaseline": {
                "decisionMinutes": 31,
                "agencyCost": 9100,
                "summary": "Manual balancing forces two agency nurses because the scheduler cannot see the best float chain fast enough.",
            },
            "preferredCandidates": [priya["id"], "nurse-018", "nurse-035"],
            "counts": [
                {"bitstring": "001", "weight": 21},
                {"bitstring": "010", "weight": 32},
                {"bitstring": "100", "weight": 47},
            ],
        },
        {
            "id": "callout-or-late-add",
            "title": "OR late add-on case",
            "summary": "An urgent OR case is added after 06:30 and the command center needs a scrub-certified RN without breaching fatigue rules.",
            "callOut": {
                "id": "callout-or-late-add",
                "nurseId": amara["id"],
                "nurseName": amara["name"],
                "ward": "OR-A",
                "shiftId": "or-a-1-day",
                "start": (BASE_DATE + timedelta(hours=9, minutes=0)).isoformat(),
                "end": (BASE_DATE + timedelta(hours=21, minutes=0)).isoformat(),
                "urgencyMinutes": 63,
                "requiredCertifications": ["Scrub", "Circulating"],
                "channel": "pager",
                "reason": "Late add-on case",
            },
            "manualBaseline": {
                "decisionMinutes": 18,
                "agencyCost": 3900,
                "summary": "The manual plan pulls the nearest scrub-certified traveler, increasing cost and hand-off risk.",
            },
            "preferredCandidates": ["nurse-042", "nurse-051", "nurse-078"],
            "counts": [
                {"bitstring": "001", "weight": 24},
                {"bitstring": "010", "weight": 34},
                {"bitstring": "100", "weight": 42},
            ],
        },
    ]


def build_qpu_trace() -> dict[str, Any]:
    return {
        "backend": {
            "name": "fake_brisbane",
            "provider": "qiskit-aer fake-provider",
            "calibrationTimestamp": "2026-05-25T20:14:00Z",
            "status": "simulated_hardware_noise_model",
            "medianT1Micros": 149.2,
            "medianT2Micros": 88.4,
        },
        "run": {
            "shots": 256,
            "reps": 1,
            "optimizer": "SPSA",
            "maxiter": 12,
            "seed": 1234,
        },
        "distribution": [
            {"bitstring": "100", "count": 102, "decodedCandidateId": "nurse-priya-n"},
            {"bitstring": "010", "count": 83, "decodedCandidateId": "nurse-devin-r"},
            {"bitstring": "001", "count": 71, "decodedCandidateId": "nurse-olivia-t"},
        ],
        "summary": "Cached QPU-style evidence trace for the Sarah K. call-out scenario. The hybrid candidate matched the classical objective while surfacing three distinct alternates.",
    }


def build_penalty_weights() -> dict[str, Any]:
    return {
        "hardConstraintMultiplier": 10.0,
        "softWeights": {
            "overtimeHours": 4.0,
            "agencyUsage": 8.5,
            "fatigueRisk": 5.5,
            "fairnessDelta": 3.0,
            "seniorityPreference": 2.5,
            "crossWardPenalty": 1.75,
        },
    }


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def write_json_to_both(relative_path: str, payload: Any) -> None:
    write_json(DATA_DIR / relative_path, payload)
    write_json(BACKEND_FIXTURES_DIR / relative_path, payload)


def write_calibration() -> None:
    calibration = """# Calibration notes

- Facility profile: synthetic 420-bed regional U.S. hospital.
- Grounding sources: CMS Payroll-Based Journal public staffing distributions, AACN ICU staffing guidance, AORN perioperative staffing guidance, and The Joint Commission HR competency expectations.
- Skill mix targets:
  - Cath Lab: ACLS on every day shift, PALS optional on 35-45% of slots.
  - ICU: CCRN + ACLS on high-acuity shifts.
  - OR: scrub/circulating coverage in every staffed room.
- Weekly hour distribution: centered on 36-44 hours for bedside RNs, capped at 60.
- Agency spend reference: $1.41M quarterly used in the Sarah K. narrative.
"""
    (DATA_DIR / "calibration.md").write_text(calibration, encoding="utf-8")
    (BACKEND_FIXTURES_DIR / "calibration.md").write_text(calibration, encoding="utf-8")


def write_roster_template() -> None:
    rows = [
        [
            "nurse_id",
            "certifications",
            "ward",
            "week_hours",
            "last_shift_end",
            "seniority_date",
        ],
        [
            "nurse-201",
            "ACLS|PALS|BLS",
            "Cath Lab 2",
            "36",
            "2026-05-25T18:30:00",
            "2021-09-14",
        ],
    ]
    with (DATA_DIR / "roster_template.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerows(rows)
    with (BACKEND_FIXTURES_DIR / "roster_template.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerows(rows)


def main() -> None:
    ensure_dirs()
    shifts = build_shifts()
    roster = build_roster(shifts)
    scenarios = build_scenarios(roster)
    cba = build_cba()
    qpu_trace = build_qpu_trace()
    penalty_weights = build_penalty_weights()

    write_json_to_both("roster.json", roster)
    write_json_to_both("shifts.json", shifts)
    write_json_to_both("cba.json", cba)
    write_json_to_both("qpu_trace.json", qpu_trace)
    write_json_to_both("penalty_weights.json", penalty_weights)
    write_json_to_both("callout_event.json", scenarios[0]["callOut"])
    for scenario in scenarios:
        write_json_to_both(f"scenarios/{scenario['id']}.json", scenario)

    write_calibration()
    write_roster_template()

    print(
        json.dumps(
            {
                "rosterCount": len(roster),
                "shiftCount": len(shifts),
                "scenarioCount": len(scenarios),
                "outputDir": str(DATA_DIR),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
