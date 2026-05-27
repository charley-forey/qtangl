from __future__ import annotations

from collections import deque

from app.hospital.models import HospitalDataset, Nurse, RepairWindow, ScenarioDefinition
from app.hospital.solver_classical import ClassicalSolveResult


def detect_repair_window(
    dataset: HospitalDataset,
    scenario: ScenarioDefinition,
    classical_result: ClassicalSolveResult,
    *,
    max_nurses: int = 8,
) -> RepairWindow:
    eligible_by_id = {candidate.nurse_id for candidate in classical_result.eligible_candidates}
    nurses_by_id = {nurse.id: nurse for nurse in dataset.roster if nurse.id in eligible_by_id}
    if not nurses_by_id:
        return RepairWindow(
            nurse_ids=[],
            ward_ids=[scenario.callout.ward],
            reasons=["No eligible internal candidates were available; the fallback is agency."],
            edge_count=0,
        )

    adjacency: dict[str, set[str]] = {nurse_id: set() for nurse_id in nurses_by_id}
    edge_count = 0
    nurse_list = list(nurses_by_id.values())
    for index, nurse in enumerate(nurse_list):
        for other in nurse_list[index + 1 :]:
            if _is_linked(nurse, other, scenario.callout.ward):
                adjacency[nurse.id].add(other.id)
                adjacency[other.id].add(nurse.id)
                edge_count += 1

    seeds = _seed_ids(scenario, classical_result, nurses_by_id)
    queue = deque(seeds)
    seen = set(seeds)
    selected: list[str] = []
    reasons = [
        "Repair window seeded from the call-out ward, preferred scenario candidates, and the classical top pick.",
        "Neighbors were added when they shared a ward, shared a required certification, or were cross-trained into the call-out ward.",
    ]

    while queue and len(selected) < max_nurses:
        nurse_id = queue.popleft()
        if nurse_id not in nurses_by_id:
            continue
        selected.append(nurse_id)
        for neighbor_id in sorted(adjacency.get(nurse_id, set())):
            if neighbor_id in seen:
                continue
            seen.add(neighbor_id)
            queue.append(neighbor_id)

    ward_ids = sorted({nurses_by_id[nurse_id].home_ward for nurse_id in selected})
    return RepairWindow(
        nurse_ids=selected,
        ward_ids=ward_ids,
        reasons=reasons,
        edge_count=edge_count,
    )


def _seed_ids(
    scenario: ScenarioDefinition,
    classical_result: ClassicalSolveResult,
    nurses_by_id: dict[str, Nurse],
) -> list[str]:
    seeds: list[str] = []
    if classical_result.selected_candidate.nurse_id in nurses_by_id:
        seeds.append(classical_result.selected_candidate.nurse_id)

    for candidate_id in scenario.preferred_candidates:
        if candidate_id in nurses_by_id and candidate_id not in seeds:
            seeds.append(candidate_id)

    for nurse_id, nurse in nurses_by_id.items():
        if (
            nurse.home_ward == scenario.callout.ward
            or scenario.callout.ward in nurse.cross_trained_wards
        ) and nurse_id not in seeds:
            seeds.append(nurse_id)

    return seeds


def _is_linked(nurse: Nurse, other: Nurse, callout_ward: str) -> bool:
    if nurse.home_ward == other.home_ward:
        return True
    if callout_ward in nurse.cross_trained_wards and callout_ward in other.cross_trained_wards:
        return True
    if set(nurse.certifications) & set(other.certifications):
        return True
    if nurse.cba_group == other.cba_group:
        return True
    return False
