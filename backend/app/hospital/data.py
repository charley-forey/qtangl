from __future__ import annotations

import csv
import json
import os
from pathlib import Path
from typing import Any

from app.hospital.models import (
    CallOutEvent,
    CbaProfile,
    CbaRule,
    HospitalDataset,
    ManualBaseline,
    Nurse,
    QpuTrace,
    QpuTraceDistributionItem,
    ScenarioCount,
    ScenarioDefinition,
    ShiftAssignment,
    ShiftRequirement,
)


MODULE_DIR = Path(__file__).resolve().parent
BACKEND_FIXTURES_DIR = MODULE_DIR / "fixtures"


def _candidate_data_dirs() -> list[Path]:
    configured = os.getenv("QTANGL_HOSPITAL_DATA_DIR")
    candidates: list[Path] = []
    if configured:
        candidates.append(Path(configured))

    current = Path(__file__).resolve()
    for parent in current.parents:
        candidates.append(parent / "demos" / "hospital_restaffing" / "data")

    candidates.append(BACKEND_FIXTURES_DIR)
    return candidates


def _resolve_data_dir() -> Path:
    for candidate in _candidate_data_dirs():
        if (candidate / "roster.json").exists():
            return candidate
    return BACKEND_FIXTURES_DIR


def get_data_dir() -> Path:
    return _resolve_data_dir()


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _build_assignment(payload: dict[str, Any]) -> ShiftAssignment:
    return ShiftAssignment(
        shift_id=payload["shiftId"],
        ward=payload["ward"],
        shift_name=payload["shiftName"],
        start=payload["start"],
        end=payload["end"],
        required_certifications=payload.get("requiredCertifications", []),
        kind=payload.get("kind", "scheduled"),
        nurse_id=payload.get("nurseId"),
    )


def _build_nurse(payload: dict[str, Any]) -> Nurse:
    return Nurse(
        id=payload["id"],
        name=payload["name"],
        home_ward=payload["homeWard"],
        certifications=payload.get("certifications", []),
        cross_trained_wards=payload.get("crossTrainedWards", []),
        seniority_date=payload["seniorityDate"],
        base_hourly_rate=float(payload["baseHourlyRate"]),
        weekly_hours=int(payload["weeklyHours"]),
        max_hours_week=int(payload["maxHoursWeek"]),
        cba_group=payload["cbaGroup"],
        role=payload["role"],
        last_shift_end=payload["lastShiftEnd"],
        assignments=[_build_assignment(assignment) for assignment in payload.get("assignments", [])],
        metadata={
            key: value
            for key, value in payload.items()
            if key
            not in {
                "id",
                "name",
                "homeWard",
                "certifications",
                "crossTrainedWards",
                "seniorityDate",
                "baseHourlyRate",
                "weeklyHours",
                "maxHoursWeek",
                "cbaGroup",
                "role",
                "lastShiftEnd",
                "assignments",
            }
        },
    )


def _build_shift(payload: dict[str, Any]) -> ShiftRequirement:
    return ShiftRequirement(
        id=payload["id"],
        day_index=int(payload["dayIndex"]),
        shift_name=payload["shiftName"],
        ward=payload["ward"],
        start=payload["start"],
        end=payload["end"],
        duration_hours=int(payload["durationHours"]),
        priority=payload["priority"],
        required_certifications=payload.get("requiredCertifications", []),
        min_staff=int(payload["minStaff"]),
    )


def _build_callout(payload: dict[str, Any]) -> CallOutEvent:
    return CallOutEvent(
        id=payload["id"],
        nurse_id=payload["nurseId"],
        nurse_name=payload["nurseName"],
        ward=payload["ward"],
        shift_id=payload["shiftId"],
        start=payload["start"],
        end=payload["end"],
        urgency_minutes=int(payload["urgencyMinutes"]),
        required_certifications=payload.get("requiredCertifications", []),
        channel=payload.get("channel", "unknown"),
        reason=payload.get("reason", "call out"),
    )


def _build_scenario(payload: dict[str, Any]) -> ScenarioDefinition:
    return ScenarioDefinition(
        id=payload["id"],
        title=payload["title"],
        summary=payload["summary"],
        callout=_build_callout(payload["callOut"]),
        manual_baseline=ManualBaseline(
            decision_minutes=int(payload["manualBaseline"]["decisionMinutes"]),
            agency_cost=float(payload["manualBaseline"]["agencyCost"]),
            summary=payload["manualBaseline"]["summary"],
        ),
        preferred_candidates=list(payload.get("preferredCandidates", [])),
        counts=[
            ScenarioCount(bitstring=item["bitstring"], weight=int(item["weight"]))
            for item in payload.get("counts", [])
        ],
    )


def load_roster() -> list[Nurse]:
    data_dir = get_data_dir()
    return [_build_nurse(payload) for payload in _read_json(data_dir / "roster.json")]


def load_shifts() -> list[ShiftRequirement]:
    data_dir = get_data_dir()
    return [_build_shift(payload) for payload in _read_json(data_dir / "shifts.json")]


def load_cba() -> CbaProfile:
    payload = _read_json(get_data_dir() / "cba.json")
    return CbaProfile(
        source=payload["source"],
        rules=[
            CbaRule(
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
                decoded_candidate_id=item["decodedCandidateId"],
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
    raise KeyError(f"Unknown hospital scenario: {scenario_id}")


def load_default_callout() -> CallOutEvent:
    return _build_callout(_read_json(get_data_dir() / "callout_event.json"))


def load_penalty_weights() -> dict[str, Any]:
    return _read_json(get_data_dir() / "penalty_weights.json")


def load_dataset() -> HospitalDataset:
    return HospitalDataset(
        roster=load_roster(),
        shifts=load_shifts(),
        cba=load_cba(),
        scenarios=load_scenarios(),
        qpu_trace=load_qpu_trace(),
        penalty_weights=load_penalty_weights(),
    )


def parse_uploaded_roster(csv_text: str) -> list[Nurse]:
    reader = csv.DictReader(csv_text.splitlines())
    required_columns = {
        "nurse_id",
        "certifications",
        "ward",
        "week_hours",
        "last_shift_end",
        "seniority_date",
    }
    if not reader.fieldnames or set(reader.fieldnames) < required_columns:
        raise ValueError(
            "Uploaded roster CSV is missing required columns: "
            + ", ".join(sorted(required_columns))
        )

    uploaded: list[Nurse] = []
    for row in reader:
        uploaded.append(
            Nurse(
                id=str(row["nurse_id"]).strip(),
                name=str(row.get("name") or row["nurse_id"]).strip(),
                home_ward=str(row["ward"]).strip(),
                certifications=[
                    certification.strip()
                    for certification in str(row["certifications"]).split("|")
                    if certification.strip()
                ],
                cross_trained_wards=[str(row["ward"]).strip()],
                seniority_date=str(row["seniority_date"]).strip(),
                base_hourly_rate=float(row.get("base_hourly_rate") or 60.0),
                weekly_hours=int(float(row["week_hours"])),
                max_hours_week=int(float(row.get("max_hours_week") or 60)),
                cba_group=str(row.get("cba_group") or "RN-12H").strip(),
                role=str(row.get("role") or "Staff RN").strip(),
                last_shift_end=str(row["last_shift_end"]).strip(),
                assignments=[],
            )
        )
    return uploaded
